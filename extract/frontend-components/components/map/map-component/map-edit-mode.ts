/* eslint-env browser */
import type { MapComponent } from '../map-component'
import type { ModeName } from '@geoman-io/maplibre-geoman-free'

export class MapEditMode extends HTMLElement {
  private _id: string
  private reactiveStore: MapComponent['reactiveStore']

  constructor () {
    super()
    this._id = crypto.randomUUID().substring(0, 8)
    this.reactiveStore = (this.closest('map-component') as MapComponent).reactiveStore
  }

  connectedCallback () {
    this.#render()
    this.#setupEventListeners()
  }

  #render () {
    this.innerHTML = `

      <style>
        .map__edit-controls {
          border: 1px solid var(--govuk-border-colour);
          display: none;
          .govuk-radios__label {
            font-size: 16px;
            max-width: none;
          }
        }
        .govuk-radios__item:has([value="change"]), .govuk-radios__item:has([value="rotate"]), .govuk-radios__item:has([value="cut"]), .govuk-radios__item:has([value="magic_wand"]) {
          display: none;
        }
        .map--edit-mode {
          .map__edit-controls {
            display: block;
          }
          .map--polygon-mode {
            .govuk-radios__item:has([value="change"]), .govuk-radios__item:has([value="rotate"]), .govuk-radios__item:has([value="cut"]), .govuk-radios__item:has([value="magic_wand"]) {
              display: flex;
            }
          }
        }
      </style>

      <fieldset class="govuk-fieldset">
        <legend class="govuk-fieldset__legend govuk-fieldset__legend--s">
          <h2 class="govuk-fieldset__heading">Edit mode:</h2>
        </legend>
        <div class="govuk-radios govuk-radios--inline govuk-radios--small" data-module="govuk-radios">
          <div class="govuk-radios__item">
            <input class="govuk-radios__input" id="edit-map-change-${this._id}" name="editMap" type="radio" value="change" checked>
            <label class="govuk-label govuk-radios__label" for="edit-map-change-${this._id}">Change</label>
          </div>
          <div class="govuk-radios__item">
            <input class="govuk-radios__input" id="edit-map-drag-${this._id}" name="editMap" type="radio" value="drag">
            <label class="govuk-label govuk-radios__label" for="edit-map-drag-${this._id}">Move</label>
          </div>
          <div class="govuk-radios__item">
            <input class="govuk-radios__input" id="edit-map-rotate-${this._id}" name="editMap" type="radio" value="rotate">
            <label class="govuk-label govuk-radios__label" for="edit-map-rotate-${this._id}">Rotate</label>
          </div>
          <div class="govuk-radios__item">
            <input class="govuk-radios__input" id="edit-map-cut-${this._id}" name="editMap" type="radio" value="cut">
            <label class="govuk-label govuk-radios__label" for="edit-map-cut-${this._id}">Cut</label>
          </div>
          <div class="govuk-radios__item">
            <input class="govuk-radios__input" id="edit-map-add-${this._id}" name="editMap" type="radio" value="add">
            <label class="govuk-label govuk-radios__label" for="edit-map-add-${this._id}">Add (freeform)</label>
          </div>
          <div class="govuk-radios__item">
            <input class="govuk-radios__input" id="edit-map-magic-wand-${this._id}" name="editMap" type="radio" value="magic_wand">
            <label class="govuk-label govuk-radios__label" for="edit-map-magic-wand-${this._id}">Add (by area)</label>
          </div>
          <div class="govuk-radios__item">
            <input class="govuk-radios__input" id="edit-map-delete-${this._id}" name="editMap" type="radio" value="delete">
            <label class="govuk-label govuk-radios__label" for="edit-map-delete-${this._id}">Delete</label>
          </div>
        </div>
      </fieldset>
    `
  }

  #setupEventListeners () {
    this.querySelectorAll('.map__edit-controls input[type="radio"]')?.forEach((radio) => {
      radio.addEventListener('click', this.#setEditMode.bind(this))
    })

    const setPolygonClass = (entityType: 'polygon' | 'marker') => {
      if (entityType === 'polygon') {
        this.classList.add('map--polygon-mode')
      } else {
        this.classList.remove('map--polygon-mode')
      }
    }
    setPolygonClass(this.reactiveStore.entityType.get())
    this.reactiveStore.entityType.subscribe((entityType: 'polygon' | 'marker') => {
      setPolygonClass(entityType)
    })
  }

  /**
   * Sets the current edit mode based on the selected radio button
   */
  #setEditMode () {
    (this.querySelectorAll('.map__edit-controls input[type="radio"]') as NodeListOf<HTMLInputElement>)?.forEach((radio) => { // eslint-disable-line no-undef
      if (radio.checked) {
        let mode = radio.value as ModeName | 'add' | 'magic_wand'
        // Convert custom 'add' mode to actual Geoman draw mode
        if (mode === 'add') {
          mode = this.reactiveStore.entityType.get()
        }
        this.reactiveStore.editMode.set(mode)
      }
    })
  }
}
