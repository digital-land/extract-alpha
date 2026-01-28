/* eslint-env browser */
import type { MapComponent } from '../map-component'

export class MapOptions extends HTMLElement {
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
        .map-options__container {
          align-items: flex-start;
          display: flex;
          gap: 15px;
        }
      </style>

      <details class="govuk-details govuk-!-margin-bottom-0">
        <summary class="govuk-details__summary">
          <span class="govuk-details__summary-text">Map options</span>
        </summary>
        <div class="govuk-details__text map-options__container">
          
          <div class="govuk-form-group govuk-!-margin-bottom-0">
            <fieldset class="govuk-fieldset">
              <legend class="govuk-fieldset__legend govuk-fieldset__legend--s">
                <h2 class="govuk-fieldset__heading">Tile type:</h2>
              </legend>
              <div class="govuk-radios govuk-radios--inline govuk-radios--small" data-module="govuk-radios">
                <div class="govuk-radios__item">
                  <input class="govuk-radios__input" id="tile-type-1-${this._id}" name="tileType" type="radio" value="os" checked>
                  <label class="govuk-label govuk-radios__label" for="tile-type-1-${this._id}">OS</label>
                </div>
                <div class="govuk-radios__item">
                  <input class="govuk-radios__input" id="tile-type-2-${this._id}" name="tileType" type="radio" value="satellite">
                  <label class="govuk-label govuk-radios__label" for="tile-type-2-${this._id}">Satellite</label>
                </div>
              </div>
            </fieldset>
          </div>

          ${this.hasAttribute('editing-enabled')
          ? `
            <div class="govuk-form-group govuk-!-margin-bottom-0">
              <fieldset class="govuk-fieldset">
                <legend class="govuk-fieldset__legend govuk-fieldset__legend--s">
                  <h2 class="govuk-fieldset__heading">Snapping:</h2>
                </legend>
                <div class="govuk-checkboxes govuk-checkboxes--small" data-module="govuk-checkboxes">
                  <div class="govuk-checkboxes__item">
                    <input class="govuk-checkboxes__input" id="snap-${this._id}" type="checkbox" value="snap">
                    <label class="govuk-label govuk-checkboxes__label" for="snap-${this._id}">Enable snapping</label>
                  </div>
                </div>
              </fieldset>
            </div>
          `
          : ''}

        </div>
      </details>
    `
  }

  #setupEventListeners () {
    // Tile type
    (this.querySelectorAll('input[name="tileType"]') as NodeListOf<HTMLInputElement>).forEach((input: HTMLInputElement) => { // eslint-disable-line no-undef
      input.addEventListener('change', () => {
        this.reactiveStore.tileType.set(input.value as 'os' | 'satellite')
      })
    })

    // Snapping
    const snapInput = this.querySelector(`#snap-${this._id}`) as HTMLInputElement
    snapInput.addEventListener('change', () => {
      this.reactiveStore.snap.set(snapInput.checked)
    })
  }
}
