import type ml from 'maplibre-gl'
import type { MapLibreEvent, MapMouseEvent, MapTouchEvent } from 'maplibre-gl'
import type { Geoman } from '@geoman-io/maplibre-geoman-free'
import type { GeoJSON } from 'geojson'
import * as turf from '@turf/turf'
import { getVectorLayerIds } from './vector-tile-utils'

/**
 * Handles snapping to OS vector tile features (vertices/endpoints only)
 */
export class Snapping {
  #SNAP_DISTANCE: number = 15 // pixels
  #MAX_FEATURES: number = 20
  #CLOSE_ENOUGH_THRESHOLD: number = 0.5
  #COORDINATE_PRECISION: number = 6

  #map: ml.Map
  #geoman: Geoman
  #handler: ((event: MapLibreEvent) => { next: boolean }) | null = null

  constructor (map: ml.Map, geoman: Geoman) {
    this.#map = map
    this.#geoman = geoman
  }

  /**
   * Queries vector tile features near a point and finds the closest snap point
   * Only snaps to vertices (endpoints), not arbitrary points along lines
   */
  #findSnapPoint (lng: number, lat: number): [number, number] | null {
    const vectorLayers = getVectorLayerIds(this.#map)
    if (vectorLayers.length === 0) {
      return null
    }

    const radius = this.#SNAP_DISTANCE
    const point = this.#map.project([lng, lat])
    const bbox: [ml.PointLike, ml.PointLike] = [
      [point.x - radius, point.y - radius],
      [point.x + radius, point.y + radius]
    ]

    const features = this.#map.queryRenderedFeatures(bbox, {
      layers: vectorLayers
    })

    if (features.length === 0) {
      return null
    }

    // Limit processing to first 20 features for performance
    const featuresToProcess = features.slice(0, this.#MAX_FEATURES)

    // Collect unique vertices
    const uniqueVertices = new Map<string, [number, number]>()

    for (const feature of featuresToProcess) {
      const geometry = (feature as GeoJSON.Feature).geometry
      if (!geometry) continue

      // Use turf.coordAll() to extract all coordinates from the geometry
      const coords = turf.coordAll(turf.feature(geometry) as any)

      // Add to unique vertices map (using coordinate precision for deduplication)
      for (const coord of coords) {
        const key = `${coord[0].toFixed(
          this.#COORDINATE_PRECISION
        )},${coord[1].toFixed(this.#COORDINATE_PRECISION)}`
        uniqueVertices.set(key, [coord[0], coord[1]])
      }
    }

    // Find the closest candidate point (early exit if very close)
    let closestSnapPoint: [number, number] | null = null
    let minScreenDistance = Infinity
    const closeEnoughThreshold = radius * this.#CLOSE_ENOUGH_THRESHOLD

    for (const [, coord] of uniqueVertices) {
      const proj = this.#map.project(coord)
      const dist = Math.sqrt((point.x - proj.x) ** 2 + (point.y - proj.y) ** 2)
      if (dist < minScreenDistance && dist <= radius) {
        minScreenDistance = dist
        closestSnapPoint = coord
        if (dist <= closeEnoughThreshold) {
          break
        }
      }
    }

    return closestSnapPoint
  }

  /**
   * Enables snapping to OS vector tile features
   */
  enable (): void {
    this.#handler = (event: MapLibreEvent) => {
      try {
        const mouseEvent = event as MapMouseEvent | MapTouchEvent
        if (!mouseEvent.lngLat || !mouseEvent.point) {
          return { next: true }
        }

        // Find snap point on vector tiles
        const snapPoint = this.#findSnapPoint(
          mouseEvent.lngLat.lng,
          mouseEvent.lngLat.lat
        )

        if (snapPoint) {
          // Modify the event's lngLat coordinates
          const lngLat = mouseEvent.lngLat as {
            lng: number;
            lat: number;
            wrap?: () => void;
          }
          if (lngLat) {
            lngLat.lng = snapPoint[0]
            lngLat.lat = snapPoint[1]
            if (lngLat.wrap) {
              lngLat.wrap()
            }
          }
        }
      } catch (error) {
        console.debug('Vector tile snapping error:', error)
      }

      return { next: true }
    }

    this.#geoman.events.bus.on('mousemove', this.#handler)
    this.#geoman.events.bus.on('touchmove', this.#handler)
  }

  /**
   * Disables snapping to OS vector tile features
   */
  disable (): void {
    if (!this.#handler) {
      return
    }
    this.#geoman.events.bus.off('mousemove', this.#handler)
    this.#geoman.events.bus.off('touchmove', this.#handler)
    this.#handler = null
  }
}
