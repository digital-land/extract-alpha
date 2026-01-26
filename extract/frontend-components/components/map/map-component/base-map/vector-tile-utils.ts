import type ml from 'maplibre-gl'

/**
 * Gets all vector source names from the map style
 * Internal helper function used by getVectorLayerIds
 */
function getVectorSourceNames (map: ml.Map): string[] {
  const style = map.getStyle()
  const vectorSources: string[] = []

  if (style?.sources) {
    for (const [sourceName, source] of Object.entries(style.sources)) {
      if (
        source &&
        typeof source === 'object' &&
        'type' in source &&
        source.type === 'vector'
      ) {
        vectorSources.push(sourceName)
      }
    }
  }

  return vectorSources
}

/**
 * Gets all layer IDs that use vector sources (for querying features)
 * Returns fill layers first, then line layers
 * @param map - The MapLibre map instance
 * @param options - Optional configuration
 * @param options.fillOnly - If true, only return fill layers (polygons)
 * @returns Array of layer IDs
 */
export function getVectorLayerIds (
  map: ml.Map,
  options?: { fillOnly?: boolean }
): string[] {
  const style = map.getStyle()
  const vectorSources = getVectorSourceNames(map)
  const fillLayerIds: string[] = []
  const lineLayerIds: string[] = []

  if (style?.layers) {
    for (const layer of style.layers) {
      if (
        'source' in layer &&
        layer.source &&
        typeof layer.source === 'string' &&
        vectorSources.includes(layer.source)
      ) {
        if (layer.type === 'fill') {
          fillLayerIds.push(layer.id)
        } else if (layer.type === 'line' && !options?.fillOnly) {
          lineLayerIds.push(layer.id)
        }
      }
    }
  }

  return [...fillLayerIds, ...lineLayerIds]
}
