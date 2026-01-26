import type { GmOptionsPartial } from '@geoman-io/maplibre-geoman-free'

/**
 * Get Geoman style configuration based on tile type
 * For satellite tiles, use yellow/white colors for better visibility
 * For OS tiles, use default blue colors
 */
export const getGeomanStyle = (tileType: string = 'os'): GmOptionsPartial => {
  // Use yellow/white for satellite tiles, blue for OS tiles
  const isSatellite = tileType === 'satellite'
  const lineColor = isSatellite ? '#FFFF00' : '#3388ff' // Yellow for satellite, blue for OS
  const fillColor = isSatellite ? '#FFFF00' : '#3388ff'
  const fillOpacity = isSatellite ? 0.3 : 0.2
  const treeIconColour = isSatellite ? 'yellow' : 'green'

  return {
    layerStyles: {
      marker: {
        gm_main: [
          {
            type: 'symbol',
            layout: {
              'icon-image': `tree-icon-${treeIconColour}`
            }
          }
        ],
        gm_temporary: [
          {
            type: 'symbol',
            layout: {
              'icon-image': `tree-icon-${treeIconColour}`
            }
          }
        ]
      },
      polygon: {
        gm_main: [
          {
            type: 'fill',
            paint: {
              'fill-color': fillColor,
              'fill-opacity': fillOpacity
            }
          },
          {
            type: 'line',
            paint: {
              'line-color': lineColor,
              'line-width': 3
            }
          }
        ],
        gm_temporary: [
          {
            type: 'fill',
            paint: {
              'fill-color': fillColor,
              'fill-opacity': fillOpacity * 0.5
            }
          },
          {
            type: 'line',
            paint: {
              'line-color': lineColor,
              'line-width': 2,
              'line-dasharray': [2, 2]
            }
          }
        ]
      },
      line: {
        gm_main: [
          {
            type: 'line',
            paint: {
              'line-color': lineColor,
              'line-width': 3
            }
          }
        ],
        gm_temporary: [
          {
            type: 'line',
            paint: {
              'line-color': lineColor,
              'line-width': 2,
              'line-dasharray': [2, 2]
            }
          }
        ]
      }
    },
    controls: {
      draw: {
        polygon: { uiEnabled: false },
        marker: { uiEnabled: false }
        // need to enable otherwise add mode won't work
        // keep other draw tools disabled/hidden by omission
      },
      edit: {
        delete: { uiEnabled: false }
      },
      helper: {
        snapping: { uiEnabled: false },
        zoom_to_features: { uiEnabled: false }
      }
    }
  }
}
