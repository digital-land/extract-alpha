/* eslint-env browser */
import type { GeoJsonImportFeature, ModeName } from '@geoman-io/maplibre-geoman-free'
import HistoryManager from './map-component/history-manager.ts'
import { ReactiveProp } from './map-component/reactivity.ts'

/* controllers */
import { EditModeController } from './map-component/edit-mode-controller.ts'
import { NonEditFunctionsController } from './map-component/non-edit-functions-controller.ts'

/* subcomponents */
import { MapOptions } from './map-component/map-options.ts'
import { MapEditMode } from './map-component/map-edit-mode.ts'
import { KeyboardEditor } from './map-component/keyboard-editor.ts'
import { BaseMap } from './map-component/base-map.ts'

interface MapController {
  hostConnected?: () => void
  hostDisconnected?: () => void
  /**
   * Provides access to select private methods of the host component.
   * Enables cross-controller communication without exposing those methods publicly.
   */
  capabilities?: {
    showFeature?: (features: GeoJsonImportFeature[], firstTime?: boolean) => Promise<void> | void
  }
}

/**
 * This web component integrates MapLibre GL for map rendering and Geoman for feature editing.
 * It supports viewing and editing geographic features (points, lines, polygons) with undo/redo
 * functionality, fullscreen mode, and PDF display.
 *
 * @example
 * ```html
 * <!-- Basic usage -->
 * <map-component data-pdf="/path/to/pdf"></map-component>
 *
 * <!-- With editing enabled -->
 * <map-component data-save-endpoint="/api/save" data-pdf="/path/to/pdf"></map-component>
 * ```
 *
 * @customElement map-component
 * @extends HTMLElement
 *
 * @attribute {string} data-pdf - URL path to a PDF document to display alongside the map
 * @attribute {string} data-save-endpoint - URL endpoint for saving edited features. When present, enables editing functionality
 *
 * @public
 * @method showFeature - Displays a GeoJSON feature on the map
 *   @param {GeoJsonImportFeature} newFeature - The GeoJSON feature to display on the map
 *
 * @public
 * @method clearFeatures - Removes all features currently displayed on the map. This is useful for
 *   resetting the map state or before loading a new feature.
 */
export class MapComponent extends HTMLElement {
  /** Queue of features waiting to be displayed before Geoman is loaded */
  public pendingFeatures: GeoJsonImportFeature[] = []
  /** Original features loaded into the map, used for cancel/reset */
  public originalFeatures: GeoJsonImportFeature[] | undefined = undefined
  /** For undo/redo functionality */
  public historyManager: HistoryManager | undefined = undefined
  public _controllers: MapController[] = []
  /** When true, suppresses automatic history capture from Geoman global events (used during undo/redo replays) */
  public suppressHistoryCapture: boolean = false
  public _id: string
  public baseMap: BaseMap | undefined = undefined
  /** Handler for beforeunload event to warn when leaving page in edit mode */
  #beforeUnloadHandler: ((event: BeforeUnloadEvent) => void) | null = null

  /**
   * Reactive store for sharing data between map sub-components
   * ( we are gradually going to shift everything to using this pattern)
  */
  public reactiveStore = {
    editEnabled: new ReactiveProp<boolean>(false),
    editMode: new ReactiveProp<ModeName | 'add' | 'magic_wand'>('change'),
    entityType: new ReactiveProp<'polygon' | 'marker'>('polygon'),
    tileType: new ReactiveProp<'os' | 'satellite'>('os'),
    snap: new ReactiveProp<boolean>(false)
  }

  constructor () {
    super()
    this._id = crypto.randomUUID().substring(0, 8)
    this._controllers.push(new EditModeController(this, { showFeature: this.#showFeature.bind(this) }))
    this._controllers.push(new NonEditFunctionsController(this))
  }

  connectedCallback (): void {
    // listen for reactive property changes
    this.reactiveStore.editMode.subscribe((editMode: ModeName | 'magic_wand') => {
      this.baseMap?.setEditMode(editMode)
    })
    this.reactiveStore.editEnabled.subscribe((editEnabled: boolean) => {
      if (editEnabled) {
        this.classList.add('map--edit-mode')
      } else {
        this.classList.remove('map--edit-mode')
      }
    })

    this.#render()
    this.baseMap = this.querySelector('base-map') as BaseMap
    this._controllers?.forEach((controller) => controller.hostConnected?.())

    this.baseMap?.addEventListener('geomanLoaded', (event) => {
      // Import any pending feature that was queued before geoman loaded
      this.#showFeature(this.pendingFeatures, true)
      this.pendingFeatures = []
    })

    this.baseMap?.addEventListener('geomanEvent', (event: Event) => {
      const customEvent = event as CustomEvent<{ featureStore: any, parameters: { name: string, isManualDelete?: boolean } }>
      const allowedEvents = [
        'gm:dragend',
        'gm:editend',
        'gm:rotateend',
        'gm:remove',
        // Drawing-related events to capture additions for undo history
        '_gm:draw:feature_created',
        'gm:draw:feature_created',
        'gm:magicwand'
      ]
      // Skip capturing while we are applying an undo/redo snapshot
      if (this.suppressHistoryCapture) {
        return
      }
      if (allowedEvents.includes(customEvent.detail.parameters.name)) {
        // Handle manual delete operations with suppressHistoryCapture to prevent double-capture
        const isManualDelete = customEvent.detail.parameters.isManualDelete === true
        if (isManualDelete) {
          this.suppressHistoryCapture = true
        }
        try {
          const entries: GeoJsonImportFeature[] = []
          customEvent.detail.featureStore.forEach((entry: any) => {
            entries.push(entry.getGeoJson())
          })
          this.historyManager?.addState(entries)
          this.classList.add('map--has-undos')
          this.classList.remove('map--has-redos')
        } finally {
          if (isManualDelete) {
            this.suppressHistoryCapture = false
          }
        }
      }
    })

    // Set up beforeunload handler to warn when leaving page in edit mode
    this.#beforeUnloadHandler = (event: BeforeUnloadEvent) => {
      if (this.reactiveStore.editEnabled.get()) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', this.#beforeUnloadHandler)
  }

  disconnectedCallback (): void {
    this._controllers?.forEach((controller) => controller.hostDisconnected?.())
    if (this.#beforeUnloadHandler) {
      window.removeEventListener('beforeunload', this.#beforeUnloadHandler)
      this.#beforeUnloadHandler = null
    }
  }

  #render () {
    this.classList.add('map')
    this.innerHTML = `

      <style>
        .map {
          --component-height: 500px;
          background-color: white;
        }
        .map__buttons {
          display: flex;
          justify-content: space-between;
        }
        .map__main-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          position: relative;
          .map__map-libre, .map__pdf {
            border: 1px solid var(--govuk-border-colour);
            height: var(--component-height);
          }
        }
        .map__map-libre {
          width: 100%;
        }
        .map__pdf {
          display: none;
          margin-top: 20px;
        }
        .map:has(#show-pdf-${this._id}:checked) .map__pdf {
          display: block;
        }
        @media (min-width: 1020px) {
          .map__main-container {
            height: var(--component-height);
            flex-direction: row;
          }
          .map__pdf {
            margin-top: 0px;
            width: 50%;
          }
          .map:has(#show-pdf-${this._id}:checked) .map__map-libre {
            width: 50%;
          }
        }
        .map__copyright {
          background-color: var(--govuk-light-grey-colour);
          border: 1px solid var(--govuk-border-colour);
          border-top: 0;
        }
      </style>

      <map-options ${this.hasAttribute('data-save-endpoint') ? 'editing-enabled="true"' : ''}"></map-options>

      <div class="map__buttons govuk-!-margin-top-3">
        <div class="map__buttons-left"></div>
        <div class="map__buttons-right"></div>
      </div>

      ${this.hasAttribute('data-save-endpoint')
        ? '<map-edit-mode class="map__edit-controls govuk-form-group govuk-!-padding-3 govuk-!-margin-bottom-0"></map-edit-mode>'
      : ''}

      <div class="map__main-container">
        <div class="map__map-libre">
          <keyboard-editor></keyboard-editor>
          <base-map></base-map>
        </div>
        ${this.hasAttribute('data-pdf')
          ? `<iframe class="map__pdf" src="${this.getAttribute('data-pdf')}" title="Original PDF"></iframe>`
        : ''}
      </div>

      <p class="map__copyright govuk-body-s govuk-!-padding-1 govuk-!-margin-0">Contains OS data © Crown copyright and database right ${new Date().getFullYear()}</p>
    `
  }

  /**
   * Displays a feature on the map.
   * @public
   * @param {GeoJsonImportFeature} newFeature - The GeoJSON feature to display on the map
   */
  showFeature (newFeature: GeoJsonImportFeature) {
    this.originalFeatures = [newFeature]
    if (this.baseMap?.geomanLoaded) {
      this.#showFeature([newFeature], true)
    } else {
      // Queue the feature until geoman is loaded
      this.pendingFeatures.push(newFeature)
    }
  }

  clearFeatures () {
    this.baseMap?.clearFeatures()
    this.historyManager?.clear()
    this.classList.remove('map--has-undos', 'map--has-redos')
  }

  /**
   * Internal method to import and display features on the map.
   * @private
   * @param {GeoJsonImportFeature[]} features - Array of GeoJSON features to display
   * @param {boolean} [firstTime=false] - Whether this is the first time displaying features
   */
  async #showFeature (features: GeoJsonImportFeature[], firstTime: boolean = false) {
    const exploded = this.baseMap?.showFeature(features)
    if (firstTime) {
      await this.baseMap?.centerOnAllFeatures()
      this.historyManager = new HistoryManager(exploded)
    }
  }
}

if (!customElements.get('map-component')) {
  customElements.define('map-component', MapComponent)
}
if (!customElements.get('map-options')) {
  customElements.define('map-options', MapOptions)
}
if (!customElements.get('map-edit-mode')) {
  customElements.define('map-edit-mode', MapEditMode)
}
if (!customElements.get('keyboard-editor')) {
  customElements.define('keyboard-editor', KeyboardEditor)
}
if (!customElements.get('base-map')) {
  customElements.define('base-map', BaseMap)
}
