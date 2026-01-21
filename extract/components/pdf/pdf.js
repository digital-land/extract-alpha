/* eslint-env browser */

import { Checkboxes, createAll } from 'govuk-frontend'

const FEATURE_FLAGS = {
  enableFullscreen: false,
  enableShowPdfToggle: true,
  enableOpenInNewWindow: true
}

class PdfComponent extends HTMLElement {
  static observedAttributes = ['url']

  constructor () {
    super()
    this.#render()
    this.#initGovUkFrontend()
    this.#initActions()
  }

  #render () {
    this.innerHTML = `
      <style>
        .pdf-container__top:has(#show-pdf:not(:checked)) ~ .pdf-container__pdf-container { display: none; }
        .pdf-container__top:has(#show-pdf:checked) ~ .pdf-container__pdf-container { display: block; }
        .pdf-container .pdf-container__pdf-container { width: 100%; }
        .pdf-container .pdf-container__pdf { border: 1px solid #000; width: 100%; height: 80vh; }
        .pdf__fullscreen { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #fff; z-index: 9999; }
      </style>
      <div class="pdf-container">
        <div class="pdf-container__top">
          ${this.#renderActions()}
        </div>
        <div class="pdf-container__pdf-container">
          <iframe class="pdf-container__pdf" src="${this.getAttribute('url')}"></iframe>
        </div>
      </div>
      <button class="pdf__fullscreen-exit govuk-button govuk-button--secondary govuk-!-margin-bottom-0" style="display:none;position:fixed;top:1rem;right:1rem;z-index:10000;" id="exit-fullscreen">Exit full screen</button>
    `
  }

  #renderActions () {
    return `
      <div class="pdf-container__actions">
        ${
          FEATURE_FLAGS.enableOpenInNewWindow
            ? `
          <p class="govuk-body">
            <a href="${this.getAttribute('url')}" class="govuk-link govuk-link--no-visited-state" rel="noreferrer noopener" target="_blank">Open <span class="govuk-visually-hidden">PDF</span> in new window</a>
          </p>
        `
            : ''
        }
        ${
          FEATURE_FLAGS.enableFullscreen
            ? `
          <button class="pdf__fullscreen-button govuk-button govuk-button--secondary govuk-!-margin-bottom-0" id="fullscreen">Full screen</button>
        `
            : ''
        }
        ${
          FEATURE_FLAGS.enableShowPdfToggle
            ? `
          <fieldset class="govuk-fieldset">
            <legend class="govuk-fieldset__legend govuk-fieldset__legend--m govuk-visually-hidden">
              Show and hide PDF preview
            </legend>
            <div class="govuk-checkboxes govuk-checkboxes--small" data-module="govuk-checkboxes">
              <div class="govuk-checkboxes__item">
                <input class="govuk-checkboxes__input" id="show-pdf" name="show-pdf" type="checkbox" value="show-pdf" checked="checked">
                <label class="govuk-label govuk-checkboxes__label" for="show-pdf">
                  Show PDF
                </label>
              </div>
            </div>
          </fieldset>
        `
            : ''
        }
      </div>
    `
  }

  #initGovUkFrontend () {
    createAll(Checkboxes)
  }

  #initActions () {
    if (FEATURE_FLAGS.enableFullscreen) {
      this.shadowRoot
        .getElementById('fullscreen')
        ?.addEventListener('click', () => this.#enterFullscreen())
      this.shadowRoot
        .getElementById('exit-fullscreen')
        ?.addEventListener('click', () => this.#exitFullscreen())
    }
  }

  #enterFullscreen () {
    const iframe = this.shadowRoot.querySelector('.pdf-container__pdf')
    if (iframe) {
      iframe.classList.add('pdf__fullscreen')
      this.shadowRoot.getElementById('exit-fullscreen').style.display = 'block'
      document.body.style.overflow = 'hidden'
    }
  }

  #exitFullscreen () {
    const iframe = this.shadowRoot.querySelector('.pdf-container__pdf')
    if (iframe) {
      iframe.classList.remove('pdf__fullscreen')
      this.shadowRoot.getElementById('exit-fullscreen').style.display = 'none'
      document.body.style.overflow = ''
    }
  }

  attributeChangedCallback (name, oldValue, newValue) {
    // Optionally re-render or update attributes
    console.log(
      `Attribute ${name} has changed from ${oldValue} to ${newValue}.`
    )
  }
}

customElements.define('pdf-component', PdfComponent)
