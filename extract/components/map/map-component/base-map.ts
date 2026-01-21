/* eslint-env browser */
import ml from 'maplibre-gl'
import type { MapLibreEvent, MapMouseEvent, MapTouchEvent } from 'maplibre-gl'
import { Geoman } from '@geoman-io/maplibre-geoman-free'
import type { GeoJsonImportFeature, ModeName } from '@geoman-io/maplibre-geoman-free'
import * as turf from '@turf/turf'
import { getGeomanStyle } from './base-map/geoman-style'
import { Snapping } from './base-map/snapping'
import { MagicWand } from './base-map/magic-wand'
import { MapComponent } from '../map-component'

export class BaseMap extends HTMLElement {
  private map: ml.Map | undefined = undefined
  private geoman: Geoman | undefined = undefined
  private tempFeatures: GeoJsonImportFeature[] = []
  public geomanLoaded: boolean = false
  /** True while a draw session is in progress (used to prevent saving mid-draw) */
  public isDrawingActive: boolean = false
  private currentEditMode: ModeName | 'magic_wand' = 'change'
  // Interceptor for early-blocking inside-polygon drags in certain edit modes
  #blockInsideDragHandler: ((event: MapLibreEvent) => { next: boolean }) | null = null
  // Custom snapping handler for OS vector tiles
  private snapping: Snapping | null = null
  // Magic wand handler for selecting surrounding area based on vector tile bounds
  private magicWand: MagicWand | null = null
  private reactiveStore: InstanceType<typeof MapComponent>['reactiveStore']
  // Store subscription callbacks for cleanup
  private tileTypeCallback: ((tileType: string) => void) | null = null
  private snapCallback: ((snap: boolean) => void) | null = null

  /**
   * Getter method for the MapLibre map instance.
   * @returns {ml.Map | undefined} The MapLibre map instance, or undefined if not initialized
   */
  getMap (): ml.Map | undefined {
    return this.map
  }

  /**
   * Getter method for the Geoman instance.
   * @returns {Geoman | undefined} The Geoman instance, or undefined if not initialized
   */
  getGeoman (): Geoman | undefined {
    return this.geoman
  }

  constructor () {
    super()
    this.reactiveStore = (this.closest('map-component') as MapComponent).reactiveStore
  }

  connectedCallback () {
    this.#addStyles()

    this.tileTypeCallback = this.#changeTileType.bind(this)
    this.reactiveStore.tileType.subscribe(this.tileTypeCallback)

    this.snapCallback = this.#handleSnapChange.bind(this)
    this.reactiveStore.snap.subscribe(this.snapCallback)

    const id = crypto.randomUUID().substring(0, 8)
    this.id = `map-${id}`

    // init maplibre
    this.map = new ml.Map({
      container: `map-${id}`,
      style: '/api/map-style-os',
      center: [0, 51],
      zoom: 5
    })

    this.#initGeoman()
  }

  disconnectedCallback () {
    if (this.tileTypeCallback) {
      this.reactiveStore.tileType.unsubscribe(this.tileTypeCallback)
      this.tileTypeCallback = null
    }
    if (this.snapCallback) {
      this.reactiveStore.snap.unsubscribe(this.snapCallback)
      this.snapCallback = null
    }

    this.removeInsideDragInterceptors()
    this.snapping?.disable()
    this.magicWand?.disable()
    this.map?.remove()
  }

  #addStyles () {
    this.innerHTML = `
      <style>
        base-map {
          display: block;
          height: 100%;
          width: 100%;
        }
        .geoman-controls {
          display: none;
        }
      </style>
    `
  }

  #initGeoman () {
    if (!this.map) {
      return
    }

    // init geoman with style based on current tile type
    const geomanStyle = getGeomanStyle(this.reactiveStore.tileType.get())
    this.geoman = new Geoman(this.map, geomanStyle)

    // callback when geoman is fully loaded
    this.map.once('gm:loaded', () => {
      // load tree marker icon
      if (!this.geomanLoaded) {
        this.geomanLoaded = true

        if (!this.map?.hasImage('tree-icon-green')) {
          this.map?.loadImage(`${window.location.origin}/public/icons/tree-icon-green.webp`).then((image) => {
            this.map?.addImage('tree-icon-green', image.data)
          })
        }
        if (!this.map?.hasImage('tree-icon-yellow')) {
          this.map?.loadImage(`${window.location.origin}/public/icons/tree-icon-yellow.webp`).then((image) => {
            this.map?.addImage('tree-icon-yellow', image.data)
          })
        }

        // Let parent component know that geoman is loaded
        this.dispatchEvent(new CustomEvent('geomanLoaded', {
          bubbles: true,
          detail: { geoman: this.geoman, map: this.map }
        }))
      } else {
        this.showFeature(this.tempFeatures)
      }

      // detect changes on the map to add to undo history
      this.geoman?.setGlobalEventsListener((parameters: {name: string}) => {
        // Track draw lifecycle to avoid saving mid-draw
        if (parameters.name === 'gm:drawstart') {
          this.isDrawingActive = true
        }
        if (parameters.name === 'gm:draw:feature_created' || parameters.name === '_gm:draw:feature_created' || parameters.name === 'gm:drawend') {
          this.isDrawingActive = false
        }

        // Clear orphaned edit markers after edit operations complete
        // This prevents edit points from persisting after features are moved or deleted
        const editEvents = ['gm:dragend', 'gm:editend', 'gm:rotateend', 'gm:remove']
        if (editEvents.includes(parameters.name)) {
          this.#clearOrphanedEditMarkers()
        }

        // let parent component know that a geoman event has occurred
        this.dispatchEvent(new CustomEvent('geomanEvent', {
          bubbles: true,
          detail: { featureStore: this.geoman?.features.featureStore, parameters }
        }))
      })

      // Initialise tile snapping
      if (this.map && this.geoman) {
        this.snapping = new Snapping(this.map, this.geoman)
        this.magicWand = new MagicWand(this.map, this.geoman, () => {
          // Dispatch geomanEvent for undo/redo support
          this.dispatchEvent(new CustomEvent('geomanEvent', {
            bubbles: true,
            detail: { featureStore: this.geoman?.features.featureStore, parameters: { name: 'gm:magicwand' } }
          }))
        })
      }
    })
  }

  #changeTileType (tileType: string) {
    // Save current features before style change
    this.tempFeatures = []
    this.geoman?.features.featureStore.forEach((entry) => {
      // Filter out edit markers/vertices that are part of the editing UI
      const shape = entry.shape
      if (shape !== 'vertex_marker' && shape !== 'edge_marker' && shape !== 'center_marker') {
        this.tempFeatures.push(entry.getGeoJson())
      }
    })

    // Clear features from old Geoman instance before style change
    this.clearFeatures()

    // Change the map style
    if (tileType === 'satellite' || tileType === 'os') {
      this.map?.setStyle(`/api/map-style-${tileType}`)
    }

    // re-init geoman after style loads
    const styleLoadHandler = () => {
      this.map?.off('styledata', styleLoadHandler)
      this.#initGeoman()

      // Restore edit mode if it was active (this will also re-enable snapping if needed)
      if (this.reactiveStore.editEnabled.get()) {
        this.map?.once('gm:loaded', () => {
          this.setEditMode(this.currentEditMode)
        })
      }
    }
    this.map?.on('styledata', styleLoadHandler)
  }

  /**
   * Removes all features currently displayed on the map.
   */
  clearFeatures () {
    this.geoman?.features.featureStore.forEach((feature) => {
      this.geoman?.features.delete(feature.id)
    })
  }

  /**
   * Clears orphaned edit markers that no longer have a valid parent feature.
   */
  #clearOrphanedEditMarkers () {
    const editMarkerShapes = ['vertex_marker', 'edge_marker', 'center_marker']
    const validFeatureIds = new Set<string | number>()

    // First, collect all valid feature IDs (non-marker features)
    this.geoman?.features.featureStore.forEach((entry) => {
      const shape = entry.shape
      if (shape && !editMarkerShapes.includes(shape)) {
        validFeatureIds.add(entry.id)
      }
    })

    // Then, delete any edit markers that don't have a valid parent
    this.geoman?.features.featureStore.forEach((entry) => {
      const shape = entry.shape
      if (shape && editMarkerShapes.includes(shape)) {
        // Check if this marker's parent feature still exists
        const parent = entry.parent
        if (!parent || !validFeatureIds.has(parent.id)) {
          this.geoman?.features.delete(entry.id)
        }
      }
    })
  }

  showFeature (features: GeoJsonImportFeature[]) {
    // explode Multi-geometries
    const featureCollection = turf.featureCollection(features)
    const flattened = turf.flatten(featureCollection)
    const exploded = (flattened.features || []) as GeoJsonImportFeature[]

    exploded.forEach((feature) => {
      try {
        // Strip id and __gm_id to avoid conflicts when restoring from undo/redo
        delete feature.id
        if (feature.properties) {
          delete feature.properties.__gm_id
        }
        this.geoman?.features.importGeoJson(feature)
      } catch (error) {
        console.error('Error showing feature:', error)
      }
    })
    return exploded
  }

  /**
   * Centers and zooms the map to fit the bounds of the features
   */
  async centerOnAllFeatures () {
    if (!this.map || !this.geoman) return

    // Collect all features into a FeatureCollection
    const features: any[] = []
    this.geoman.features.featureStore.forEach((entry) => {
      try {
        const gj: any = entry.getGeoJson()
        if (gj?.geometry) {
          features.push(gj)
        }
      } catch {
        // ignore invalid features
      }
    })

    if (features.length === 0) return

    // Use turf.bbox() to calculate bounding box
    const featureCollection = turf.featureCollection(features) as any
    const bbox = turf.bbox(featureCollection) as [number, number, number, number]

    // Convert to MapLibre LngLatBounds format: [minX, minY, maxX, maxY] -> [[minX, minY], [maxX, maxY]]
    const bounds = new ml.LngLatBounds(
      [bbox[0], bbox[1]],
      [bbox[2], bbox[3]]
    )

    this.map.fitBounds(bounds, {
      padding: 50,
      maxZoom: 18,
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1500
    })
  }

  /**
   * Sets the current edit mode based on the selected radio button
   */
  setEditMode (mode?: ModeName | 'magic_wand') {
    // Disable all modes, clear interceptors, then enable the chosen edit sub-mode.
    // We re-add our interceptor AFTER enabling the mode so our handler is first
    // in Geoman's event bus order (ensuring we can short-circuit drags reliably).
    this.geoman?.disableAllModes()
    this.removeInsideDragInterceptors()
    this.magicWand?.disable()

    if (!mode) {
      mode = this.currentEditMode
    }
    this.currentEditMode = mode

    // Handle magic wand mode
    if (mode === 'magic_wand') {
      this.magicWand?.enable()
    } else if (mode === 'polygon' || mode === 'marker') {
      // Handle draw modes (polygon, marker)
      this.geoman?.enableDraw(mode)
      this.isDrawingActive = true
    } else if (mode === 'delete') {
      // Delete mode: clicking a feature removes it (polygon or point)
      this.geoman?.enableMode('edit', 'delete')
    } else {
      // Standard edit sub-modes (e.g., change, rotate, move, cut)
      this.geoman?.enableMode('edit', mode)
      if (mode === 'change' || mode === 'rotate') {
        // Re-add after enabling the mode to keep our handler first in the bus
        this.#addInsideDragInterceptors()
      }
    }

    // Enable Geoman's built-in snapping (for snapping to other Geoman features)
    this.#handleSnapChange(this.reactiveStore.snap.get())
  }

  #handleSnapChange (snap: boolean) {
    if (snap) {
      this.geoman?.enableMode('helper', 'snapping')
      this.snapping?.enable()
    } else {
      this.geoman?.disableMode('helper', 'snapping')
      this.snapping?.disable()
    }
  }

  /**
   * Prevents whole-feature dragging when clicking inside a polygon fill
   * in change/rotate modes by short-circuiting Geoman's mousedown/touchstart handler.
   * - Only active in polygon mode and for change/rotate (not cut/move).
   * - Allows vertex/edge markers through so normal edits still work.
   * - Registered on each mode switch so it runs before Geoman's own handlers.
   */
  #addInsideDragInterceptors () {
    // Handler that allows vertex/edge interactions, but blocks inside-polygon drags
    this.#blockInsideDragHandler = (event: MapLibreEvent) => {
      try {
        // Only apply in edit-mode for polygons and when mode is change/rotate
        const isTargetMode = this.currentEditMode === 'change' || this.currentEditMode === 'rotate'
        if (!this.reactiveStore.editEnabled.get() || this.reactiveStore.entityType.get() !== 'polygon' || !isTargetMode) {
          return { next: true }
        }

        const featureData = this.geoman?.features.getFeatureByMouseEvent({
          event: event as MapMouseEvent | MapTouchEvent,
          sourceNames: ['gm_main']
        })

        if (!featureData) {
          return { next: true }
        }

        // Determine if the clicked feature is a marker (vertex/edge/center) or the polygon itself
        // If it's a marker, allow Geoman to proceed with edit; otherwise block "drag" of the shape.
        let isMarker = false
        const parentMarkers = featureData.parent?.markers
        if (parentMarkers && typeof parentMarkers.forEach === 'function') {
          parentMarkers.forEach((marker: any) => {
            if (marker?.instance === featureData) {
              isMarker = true
            }
          })
        }

        // If not a marker (i.e., click inside polygon), block further handlers → prevents drag
        return { next: isMarker }
      } catch {
        // On any unexpected error, do not block the default behavior
        return { next: true }
      }
    }

    this.geoman?.events.bus.on('mousedown', this.#blockInsideDragHandler)
    this.geoman?.events.bus.on('touchstart', this.#blockInsideDragHandler)
  }

  removeInsideDragInterceptors () {
    if (!this.#blockInsideDragHandler) {
      return
    }
    this.geoman?.events.bus.off('mousedown', this.#blockInsideDragHandler)
    this.geoman?.events.bus.off('touchstart', this.#blockInsideDragHandler)
    this.#blockInsideDragHandler = null
  }

  collectFeatureEntries (): GeoJsonImportFeature[] {
    const currentFeatures: GeoJsonImportFeature[] = []
    this.geoman?.features.featureStore.forEach((entry) => {
      currentFeatures.push(entry.getGeoJson())
    })
    return currentFeatures
  }
}
