/* eslint-env browser */
import type { MapComponent } from '../map-component'

export class NonEditFunctionsController {
  constructor (private readonly host: MapComponent) {
    this.host = host
  }

  hostConnected () {
    this.#render()
    this.#addEventListeners()
  }

  #render () {
    const resetShapeButton = this.host.querySelector(
      '.map__reset-shape-button'
    ) as HTMLButtonElement | null
    if (resetShapeButton) {
      resetShapeButton.insertAdjacentHTML(
        'afterend',
        `
        <button class="map__find-shape-button govuk-button govuk-button--secondary govuk-!-margin-bottom-0">Find shape</button>
      `
      )
    }

    // Render the locate shape button here too
    const container = this.host.querySelector(
      '.map__buttons-right'
    ) as HTMLDivElement | null
    if (!container) {
      return
    }

    container.innerHTML = `

      <style>
        .map__buttons-right {
          .govuk-button-group {
            display: flex;
            align-items: center;
          }
          .govuk-checkboxes__label {
            min-width: 85px;
          }
        }

        /* Fullscreen */
        .map__exit-fullscreen-button, .map__fullscreen-button {
          display: none;
        }
        @media (min-width: 1020px) {
          .map__fullscreen-button {
            display: block;
          }
        }
        .map:fullscreen {
          height: 100vh;
          .map__fullscreen-button {
            display: none;
          }
          .map__exit-fullscreen-button {
            display: block;
          }
          .map__main-container {
            height: 100vh;
          }
          .map__options {
            margin-top: 10px;
          }
          .map__options, .map__buttons {
            padding: 0 10px;
          }
          /* In fullscreen, allow the map/PDF to expand to fill the container */
          .map__map-libre, .map__pdf {
            height: auto;
          }
        }
      </style>

      <div class="govuk-button-group">
        ${
          this.host.getAttribute('data-pdf')
            ? `
          <div class="govuk-checkboxes govuk-checkboxes--small" data-module="govuk-checkboxes">
            <div class="govuk-checkboxes__item">
              <input class="govuk-checkboxes__input" id="show-pdf-${this.host._id}" type="checkbox" value="show-pdf">
              <label class="govuk-label govuk-checkboxes__label" for="show-pdf-${this.host._id}">Show PDF</label>
            </div>
          </div>
        `
            : ''
        }
        <button class="map__fullscreen-button govuk-button govuk-button--secondary govuk-!-margin-bottom-0">Full screen</button>
        <button class="map__exit-fullscreen-button govuk-button govuk-button--secondary govuk-!-margin-bottom-0">Exit full screen</button>
      </div>
    `
  }

  #addEventListeners () {
    this.host
      .querySelector('.map__fullscreen-button')
      ?.addEventListener('click', () => {
        this.host.requestFullscreen()
        window.setTimeout(() => {
          (
            this.host.querySelector(
              '.map__exit-fullscreen-button'
            ) as HTMLButtonElement
          )?.focus()
        }, 100)
      })

    this.host
      .querySelector('.map__exit-fullscreen-button')
      ?.addEventListener('click', () => {
        document.exitFullscreen()
      })

    // Recenter map on current shape(s)
    this.host
      .querySelector('.map__find-shape-button')
      ?.addEventListener('click', () => {
        this.host.baseMap?.centerOnAllFeatures()
      })
  }
}
