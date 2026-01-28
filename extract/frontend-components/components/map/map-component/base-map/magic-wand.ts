import type ml from 'maplibre-gl'
import type { MapLibreEvent, MapMouseEvent, MapTouchEvent } from 'maplibre-gl'
import type {
  Geoman,
  GeoJsonImportFeature
} from '@geoman-io/maplibre-geoman-free'
import type { GeoJSON } from 'geojson'
import * as turf from '@turf/turf'
import { getVectorLayerIds } from './vector-tile-utils'

/**
 * Extended GeoJSON Feature returned by queryRenderedFeatures
 * Includes additional MapLibre properties like source and layer
 */
interface MapLibreFeature extends GeoJSON.Feature {
  source?: string;
  layer?: { id: string };
  id?: string | number;
}

/**
 * Geoman feature entry from featureStore
 * Has methods and properties for managing features
 */
interface GeomanFeatureEntry {
  id: string | number;
  shape?: string;
  getGeoJson: () => GeoJsonImportFeature;
}

/**
 * Handles magic wand selection - clicking on the map to select surrounding area based on vector tile bounds
 */
export class MagicWand {
  /**
   * Maximum number of features to process (lower number = faster)
   */
  #MAX_FEATURES: number = 50

  #map: ml.Map
  #geoman: Geoman
  #clickHandler: ((event: MapLibreEvent) => void) | null = null
  #onFeatureModified: (() => void) | null = null

  constructor (map: ml.Map, geoman: Geoman, onFeatureModified?: () => void) {
    this.#map = map
    this.#geoman = geoman
    this.#onFeatureModified = onFeatureModified || null
  }

  /**
   * Filters out Geoman features from query results
   */
  #filterGeomanFeatures (features: GeoJSON.Feature[]): GeoJSON.Feature[] {
    return features.filter((feature) => {
      const source = (feature as MapLibreFeature).source
      return (
        source !== 'gm_main' &&
        source !== 'gm_temporary' &&
        source !== undefined
      )
    })
  }

  /**
   * Queries vector tile features at a point and extracts their geometries
   */
  #getFeaturesAtPoint (lng: number, lat: number): GeoJSON.Feature[] {
    const point = this.#map.project([lng, lat])

    // First try to get fill layers (polygons)
    const fillLayers = getVectorLayerIds(this.#map, { fillOnly: true })
    if (fillLayers.length > 0) {
      const fillFeatures = this.#map.queryRenderedFeatures(point, {
        layers: fillLayers
      }) as GeoJSON.Feature[]

      const vectorFeatures = this.#filterGeomanFeatures(fillFeatures)
      if (vectorFeatures.length > 0) {
        return vectorFeatures.slice(0, this.#MAX_FEATURES)
      }
    }

    // If no fill features found, try line layers
    const allLayers = getVectorLayerIds(this.#map)
    const lineLayers = allLayers.filter((id) => !fillLayers.includes(id))
    if (lineLayers.length > 0) {
      const lineFeatures = this.#map.queryRenderedFeatures(point, {
        layers: lineLayers
      }) as GeoJSON.Feature[]

      const vectorFeatures = this.#filterGeomanFeatures(lineFeatures)
      return vectorFeatures.slice(0, this.#MAX_FEATURES)
    }

    return []
  }

  /**
   * Selects the best polygon from multiple polygons
   * Tries to find a polygon that contains the click point
   */
  #selectBestPolygon (
    polygons: GeoJSON.Polygon[],
    clickLng: number,
    clickLat: number
  ): GeoJSON.Polygon | null {
    if (polygons.length === 0) return null
    if (polygons.length === 1) return polygons[0]

    const clickPoint = turf.point([clickLng, clickLat])

    // Try to find a polygon that contains the click point
    const containingPolygon = polygons.find((polygon) => {
      const polygonFeature = turf.polygon(polygon.coordinates)
      return turf.booleanPointInPolygon(clickPoint, polygonFeature)
    })

    // If no polygon contains the point, return the first one
    return containingPolygon ?? polygons[0]
  }

  /**
   * Searches for a Geoman feature that contains the given point
   * Used to determine if it's an add or subtract operation
   */
  #findFeatureContainingPoint (
    point: [number, number]
  ): GeomanFeatureEntry | null {
    const pointFeature = turf.point(point)
    const featureStore = this.#geoman.features.featureStore
    if (!featureStore) return null

    // Iterate through featureStore to find feature containing the point
    let foundEntry: GeomanFeatureEntry | null = null
    featureStore.forEach((entry: GeomanFeatureEntry) => {
      if (foundEntry || !entry) return

      try {
        const geoJson = entry.getGeoJson()
        const geometry = geoJson?.geometry

        if (geometry?.type === 'Polygon' || geometry?.type === 'MultiPolygon') {
          const feature = turf.feature(geometry)
          if (turf.booleanPointInPolygon(pointFeature, feature)) {
            foundEntry = entry
          }
        }
      } catch (error) {
        // Skip invalid features
      }
    })

    return foundEntry
  }

  /**
   * Merges multiple polygons using Turf.js union
   * If polygons are not contiguous, returns a MultiPolygon
   */
  #mergePolygons (
    polygons: GeoJSON.Polygon[]
  ): GeoJSON.Polygon | GeoJSON.MultiPolygon {
    if (polygons.length === 0) {
      throw new Error('Cannot merge empty polygon array')
    }
    if (polygons.length === 1) {
      return polygons[0]
    }

    // Convert all polygons to features
    const features = polygons.map((poly) => turf.polygon(poly.coordinates))

    // turf.union expects a FeatureCollection
    const featureCollection = turf.featureCollection(features)

    // Use turf.union - it will merge if contiguous, or return MultiPolygon if not
    const unioned = turf.union(featureCollection)

    if (!unioned?.geometry) {
      // Fallback to MultiPolygon if union fails
      const multiPolygonFeature = turf.multiPolygon(
        polygons.map((p) => p.coordinates)
      )
      return multiPolygonFeature.geometry
    }

    return unioned.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon
  }

  /**
   * Prepares subtract polygon - always receives single polygon array
   * Returns the polygon or null if empty
   */
  #prepareSubtractPolygon (
    subtractPolygons: GeoJSON.Polygon[]
  ): GeoJSON.Polygon | null {
    if (subtractPolygons.length === 0) {
      return null
    }

    // Always a single polygon in practice, but handle multiple by merging
    if (subtractPolygons.length === 1) {
      return subtractPolygons[0]
    }

    // Multiple polygons: merge and use first polygon from result
    const merged = this.#mergePolygons(subtractPolygons)
    if (merged.type === 'Polygon') {
      return merged
    }

    // MultiPolygon result: use first polygon
    return merged.coordinates.length > 0
      ? { type: 'Polygon', coordinates: merged.coordinates[0] }
      : null
  }

  /**
   * Combines polygons into a single Polygon or MultiPolygon
   */
  #combinePolygons (
    polygons: GeoJSON.Polygon[]
  ): GeoJSON.Polygon | GeoJSON.MultiPolygon | null {
    if (polygons.length === 0) return null
    if (polygons.length === 1) return polygons[0]
    return {
      type: 'MultiPolygon',
      coordinates: polygons.map((p) => p.coordinates)
    }
  }

  /**
   * Subtracts polygons from a single Polygon
   * Returns the resulting geometry or null if subtraction fails
   */
  #subtractFromPolygon (
    fromPolygon: GeoJSON.Polygon,
    subtractPolygons: GeoJSON.Polygon[]
  ): GeoJSON.Polygon | GeoJSON.MultiPolygon | null {
    // Prepare subtract polygon
    const subtractPoly = this.#prepareSubtractPolygon(subtractPolygons)
    if (!subtractPoly) {
      return null
    }

    // Convert geometries to Polygon features for turf operations
    const fromFeature = turf.polygon(fromPolygon.coordinates)
    const subtractFeature = turf.polygon(subtractPoly.coordinates)

    // Check if the subtract polygon actually intersects with the source
    if (!turf.booleanIntersects(fromFeature, subtractFeature)) {
      return null
    }

    // Perform the difference operation: subtract subtractFeature from fromFeature
    const featureCollection = turf.featureCollection([
      fromFeature,
      subtractFeature
    ])
    const difference = turf.difference(featureCollection)

    if (!difference || !difference.geometry) {
      return null
    }

    return difference.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon
  }

  /**
   * Subtracts polygons from a MultiPolygon
   * Only modifies the polygon that contains the click point
   * Returns the resulting geometry or null if subtraction fails
   */
  #subtractFromMultiPolygon (
    fromMultiPolygon: GeoJSON.MultiPolygon,
    subtractPolygons: GeoJSON.Polygon[],
    clickPoint: [number, number]
  ): GeoJSON.Polygon | GeoJSON.MultiPolygon | null {
    const pointFeature = turf.point(clickPoint)
    let targetPolygonIndex = -1

    // Find which polygon in the MultiPolygon contains the click point
    for (let i = 0; i < fromMultiPolygon.coordinates.length; i++) {
      const poly = turf.polygon(fromMultiPolygon.coordinates[i])
      if (turf.booleanPointInPolygon(pointFeature, poly)) {
        targetPolygonIndex = i
        break
      }
    }

    if (targetPolygonIndex === -1) {
      return null
    }

    // Get the target polygon to modify
    const targetPoly: GeoJSON.Polygon = {
      type: 'Polygon',
      coordinates: fromMultiPolygon.coordinates[targetPolygonIndex]
    }

    // Get all other polygons (to keep them intact)
    const otherPolygons: GeoJSON.Polygon[] = fromMultiPolygon.coordinates
      .filter((_, index) => index !== targetPolygonIndex)
      .map(
        (coords) =>
          ({ type: 'Polygon', coordinates: coords } as GeoJSON.Polygon)
      )

    // Perform subtraction on the target polygon
    const result = this.#subtractFromPolygon(targetPoly, subtractPolygons)
    if (!result) {
      // Subtraction failed or removed entire polygon, return other polygons
      return otherPolygons.length > 0
        ? this.#combinePolygons(otherPolygons)
        : null
    }

    // Combine result with other polygons
    const resultPolygons: GeoJSON.Polygon[] = []
    if (result.type === 'Polygon') {
      resultPolygons.push(result)
    } else {
      // MultiPolygon: extract all polygons
      result.coordinates.forEach((coords) => {
        resultPolygons.push({ type: 'Polygon', coordinates: coords })
      })
    }

    return this.#combinePolygons([...resultPolygons, ...otherPolygons])
  }

  /**
   * Subtracts polygons from an existing polygon using Turf.js difference
   * Returns the resulting geometry (Polygon or MultiPolygon) or null if subtraction fails
   * @param clickPoint - The click point [lng, lat] to identify which polygon in a MultiPolygon to modify
   */
  #subtractPolygons (
    fromGeometry: GeoJSON.Polygon | GeoJSON.MultiPolygon,
    subtractPolygons: GeoJSON.Polygon[],
    clickPoint?: [number, number]
  ): GeoJSON.Polygon | GeoJSON.MultiPolygon | null {
    if (subtractPolygons.length === 0) {
      return fromGeometry
    }

    try {
      if (fromGeometry.type === 'MultiPolygon') {
        if (!clickPoint) return null
        return this.#subtractFromMultiPolygon(
          fromGeometry,
          subtractPolygons,
          clickPoint
        )
      }

      if (fromGeometry.type === 'Polygon') {
        return this.#subtractFromPolygon(fromGeometry, subtractPolygons)
      }

      return null
    } catch (error) {
      return null
    }
  }

  /**
   * Finds existing Geoman features that overlap or are adjacent to the new polygon
   * Used for merging new polygon with existing features
   */
  #findOverlappingFeatures (newPolygon: GeoJSON.Polygon): {
    entries: GeomanFeatureEntry[];
    geometries: (GeoJSON.Polygon | GeoJSON.MultiPolygon)[];
  } {
    const overlappingEntries: GeomanFeatureEntry[] = []
    const overlappingGeometries: (GeoJSON.Polygon | GeoJSON.MultiPolygon)[] =
      []
    const newPolyFeature = turf.polygon(newPolygon.coordinates)

    this.#geoman.features.featureStore.forEach((entry: GeomanFeatureEntry) => {
      try {
        const geoJson = entry.getGeoJson()
        const geometry = geoJson?.geometry

        if (geometry?.type === 'Polygon' || geometry?.type === 'MultiPolygon') {
          const existingFeature = turf.feature(geometry)
          if (turf.booleanIntersects(newPolyFeature, existingFeature)) {
            overlappingEntries.push(entry)
            overlappingGeometries.push(
              geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon
            )
          }
        }
      } catch (error) {
        // Skip invalid features
      }
    })

    return { entries: overlappingEntries, geometries: overlappingGeometries }
  }

  /**
   * Handles click event to select surrounding area
   */
  #handleClick (event: MapLibreEvent): void {
    const mouseEvent = event as MapMouseEvent | MapTouchEvent
    if (!mouseEvent.lngLat) {
      return
    }

    const clickLng = mouseEvent.lngLat.lng
    const clickLat = mouseEvent.lngLat.lat
    const clickPoint: [number, number] = [clickLng, clickLat]

    // Check if click point is already in an existing feature
    const existingFeature = this.#findFeatureContainingPoint(clickPoint)

    // Query features at the click point
    const features = this.#getFeaturesAtPoint(clickLng, clickLat)

    // Extract polygon geometries from features
    const polygons: GeoJSON.Polygon[] = []
    for (const feature of features) {
      const geometry = feature.geometry
      if (!geometry) continue

      if (geometry.type === 'Polygon') {
        polygons.push(geometry)
      } else if (
        geometry.type === 'MultiPolygon' &&
        geometry.coordinates.length > 0
      ) {
        polygons.push({
          type: 'Polygon',
          coordinates: geometry.coordinates[0]
        })
      }
    }

    // If clicking inside an existing feature
    if (existingFeature) {
      // If there are vector tile features at the click point, subtract them
      if (polygons.length > 0) {
        try {
          const existingGeoJson = existingFeature.getGeoJson()
          const existingGeometry = existingGeoJson?.geometry

          if (
            existingGeometry &&
            (existingGeometry.type === 'Polygon' ||
              existingGeometry.type === 'MultiPolygon')
          ) {
            // Select the best polygon to subtract (one that contains the click point, or the first one)
            const selectedPolygon = this.#selectBestPolygon(
              polygons,
              clickLng,
              clickLat
            )

            if (selectedPolygon) {
              // Subtract the clicked area from the existing polygon
              const resultGeometry = this.#subtractPolygons(
                existingGeometry as GeoJSON.Polygon | GeoJSON.MultiPolygon,
                [selectedPolygon],
                clickPoint
              )

              if (resultGeometry) {
                // Update the feature with the subtracted geometry
                const featureId = existingFeature.id
                this.#geoman.features.delete(featureId)

                const updatedFeature: GeoJsonImportFeature = {
                  type: 'Feature',
                  geometry: resultGeometry,
                  properties: {}
                }

                this.#geoman.features.importGeoJson(updatedFeature)
                this.#onFeatureModified?.()
                return
              }
            }
          }
        } catch (error) {
          // If subtraction fails, fall through to remove the entire feature
        }
      }

      // If no vector tile features or subtraction failed, remove the entire feature
      this.#geoman.features.delete(existingFeature.id)
      this.#onFeatureModified?.()
      return
    }

    // If clicking outside any feature, add a new feature
    if (polygons.length === 0) {
      return
    }

    // Select the best polygon (one that contains the click point, or the first one)
    const selectedPolygon = this.#selectBestPolygon(
      polygons,
      clickLng,
      clickLat
    )
    if (!selectedPolygon) {
      return
    }

    // Check if this polygon overlaps with existing features
    const { entries: overlappingEntries, geometries: overlappingGeometries } =
      this.#findOverlappingFeatures(selectedPolygon)

    if (overlappingGeometries.length > 0) {
      // Extract all polygons from geometries (handle MultiPolygons)
      const allPolygons: GeoJSON.Polygon[] = [selectedPolygon]

      for (const geom of overlappingGeometries) {
        if (geom.type === 'Polygon') {
          allPolygons.push(geom)
        } else if (geom.type === 'MultiPolygon') {
          geom.coordinates.forEach((coords) => {
            allPolygons.push({ type: 'Polygon', coordinates: coords })
          })
        }
      }

      // Merge all polygons using Turf.js union
      const mergedGeometry = this.#mergePolygons(allPolygons)

      // Delete old features after successful merge
      for (const entry of overlappingEntries) {
        this.#geoman.features.delete(entry.id)
      }

      // Add the merged feature
      const mergedFeature: GeoJsonImportFeature = {
        type: 'Feature',
        geometry: mergedGeometry,
        properties: {}
      }

      this.#geoman.features.importGeoJson(mergedFeature)
      this.#onFeatureModified?.()
    } else {
      // No overlap - add as new feature
      const featureToAdd: GeoJsonImportFeature = {
        type: 'Feature',
        geometry: selectedPolygon,
        properties: {}
      }

      this.#geoman.features.importGeoJson(featureToAdd)
      this.#onFeatureModified?.()
    }
  }

  /**
   * Enables magic wand selection
   */
  enable (): void {
    if (this.#clickHandler) {
      return
    }
    this.#clickHandler = (event: MapLibreEvent) => {
      this.#handleClick(event)
    }
    this.#map.on('click', this.#clickHandler)
  }

  /**
   * Disables magic wand selection
   */
  disable (): void {
    if (!this.#clickHandler) {
      return
    }
    this.#map.off('click', this.#clickHandler)
    this.#clickHandler = null
  }
}
