/* eslint-env browser */
import type { MapComponent } from '../map-component'
import * as turf from '@turf/turf'

export class EditModeController {
  public capabilities: Record<string, any>
  // Prevent multiple rapid reset confirmations
  #resetInProgress: boolean = false
  // Features at the start of edit mode, used for cancel
  #initialEditState: any[] | undefined = undefined

  constructor (private readonly host: MapComponent, capabilities: Record<string, any>) {
    this.host = host
    this.capabilities = capabilities
  }

  hostConnected () {
    this.#render()
    this.#addEventListeners()
  }

  #render () {
    const buttonsContainer = this.host.querySelector('.map__buttons-left') as HTMLDivElement | null
    if (!buttonsContainer) {
      return
    }
    buttonsContainer.innerHTML = `

      <style>
        .map__cancel-button, .map__save-button, .map__reset-shape-button, .map__undo-button, .map__redo-button {
          display: none;
        }
        .map__reset-confirm, .map__cancel-confirm, .map__save-error {
          display: none;
        }
        .map--edit-mode {
          .map__edit-button {
            display: none;
          }
          .map__cancel-button, .map__save-button, .map__reset-shape-button {
            display: block;
          }
          &.map--save-error .map__save-error {
            display: block;
          }
          .map__undo-button-container {
            min-width: 69px;
          }
          &.map--has-undos .map__undo-button, &.map--has-redos .map__redo-button {
            display: block;
          }
          &.map--confirm-reset .map__reset-confirm {
            display: block;
          }
          &.map--confirm-cancel .map__cancel-confirm {
            display: block;
          }
        }
      </style>

      <div class="govuk-button-group">
        ${this.host.hasAttribute('data-save-endpoint')
        ? `
          <button class="map__edit-button govuk-button govuk-!-margin-bottom-0" aria-expanded="false" aria-controls="edit-controls-${this.host._id}">Edit</button>
          <button class="map__cancel-button govuk-button govuk-button--secondary govuk-!-margin-bottom-0" aria-expanded="false" aria-controls="cancel-confirmation-${this.host._id}">Cancel</button>
          <button class="map__save-button govuk-button govuk-!-margin-bottom-0">Save changes</button>
          <button class="map__reset-shape-button govuk-button govuk-button--warning govuk-!-margin-bottom-0" aria-controls="reset-confirmation-${this.host._id}" aria-expanded="false">Reset shape</button>
          <div class="map__undo-button-container">
            <button class="map__undo-button govuk-button govuk-button--secondary govuk-!-margin-bottom-0">Undo</button>
          </div>
          <button class="map__redo-button govuk-button govuk-button--secondary govuk-!-margin-bottom-0">Redo</button>
        `
        : ''}
      </div>
      <div id="save-error-${this.host._id}" class="map__save-error govuk-error-summary" role="alert" aria-labelledby="save-error-title-${this.host._id}" tabindex="-1">
        <h2 class="govuk-error-summary__title" id="save-error-title-${this.host._id}">There was a problem saving your changes</h2>
        <div class="govuk-error-summary__body">
          <p class="govuk-body" id="save-error-body-${this.host._id}">Try again. If the problem continues, refresh the page and try again later.</p>
        </div>
      </div>
      <div id="reset-confirmation-${this.host._id}" class="map__reset-confirm">
        <div class="govuk-warning-text govuk-!-margin-bottom-2">
          <span class="govuk-warning-text__icon" aria-hidden="true">!</span>
          <strong class="govuk-warning-text__text">
            <span class="govuk-warning-text__assistive">Warning</span>
            Reset to the original shape? You will lose all your modifications.
          </strong>
        </div>
        <div class="govuk-button-group">
          <button class="map__confirm-reset-button govuk-button govuk-button--warning">Yes, reset</button>
          <button class="map__cancel-reset-confirm-button govuk-button govuk-button--secondary">Cancel</button>
        </div>
      </div>
      <div id="cancel-confirmation-${this.host._id}" class="map__cancel-confirm">
        <div class="govuk-warning-text govuk-!-margin-bottom-2">
          <span class="govuk-warning-text__icon" aria-hidden="true">!</span>
          <strong class="govuk-warning-text__text">
            <span class="govuk-warning-text__assistive">Warning</span>
            You have unsaved changes. If you cancel now, your changes will be lost.
          </strong>
        </div>
        <div class="govuk-button-group">
          <button class="map__confirm-cancel-button govuk-button govuk-button--warning">Yes, discard changes</button>
          <button class="map__cancel-cancel-confirm-button govuk-button govuk-button--secondary">Keep editing</button>
        </div>
      </div>
    `
  }

  #addEventListeners () {
    const editButton = this.host.querySelector('.map__edit-button') as HTMLButtonElement | null
    const cancelButton = this.host.querySelector('.map__cancel-button') as HTMLButtonElement | null
    const resetButton = this.host.querySelector('.map__reset-shape-button') as HTMLButtonElement | null

    editButton?.addEventListener('click', () => {
      // Capture the current state as the starting point for this edit session
      this.#initialEditState = this.host.baseMap?.collectFeatureEntries()
      this.host.reactiveStore.editEnabled.set(true)
      window.setTimeout(() => {
        cancelButton?.focus()
      }, 100)
      // only show the relevant edit buttons
      if (this.host.originalFeatures?.[0].geometry.type.includes('Polygon')) {
        this.host.reactiveStore.entityType.set('polygon')
      } else {
        this.host.reactiveStore.entityType.set('marker')
      }
      // Default selection per mode: Change for polygons, Move otherwise
      const changeRadio = this.host.querySelector('.map__edit-map-change-input') as HTMLInputElement | null
      const dragRadio = this.host.querySelector('.map__edit-map-drag-input') as HTMLInputElement | null
      if (this.host.reactiveStore.entityType.get() === 'polygon') {
        if (changeRadio) { changeRadio.checked = true }
      } else {
        if (dragRadio) { dragRadio.checked = true }
      }
      this.host.baseMap?.setEditMode()
    })

    // Show reset confirmation
    resetButton?.addEventListener('click', () => {
      this.host.classList.add('map--confirm-reset')
      resetButton.setAttribute('aria-expanded', 'true')
      window.setTimeout(() => {
        (this.host.querySelector('.map__confirm-reset-button') as HTMLButtonElement | null)?.focus()
      }, 100)
    })
    // Cancel reset confirmation
    this.host.querySelector('.map__cancel-reset-confirm-button')?.addEventListener('click', () => {
      this.host.classList.remove('map--confirm-reset')
      resetButton?.setAttribute('aria-expanded', 'false')
      window.setTimeout(() => {
        resetButton?.focus()
      }, 100)
    })
    // Confirm reset: restore original features and clear history
    this.host.querySelector('.map__confirm-reset-button')?.addEventListener('click', () => {
      this.#confirmReset()
    })

    cancelButton?.addEventListener('click', () => {
      // If there are unsaved edits, ask for confirmation
      if (this.host.classList.contains('map--has-undos')) {
        this.#openCancelConfirm()
        return
      }
      this.#performCancel(editButton)
    })

    // Cancel confirmation handlers
    this.host.querySelector('.map__confirm-cancel-button')?.addEventListener('click', () => {
      this.#closeCancelConfirm()
      this.#performCancel(editButton)
    })
    this.host.querySelector('.map__cancel-cancel-confirm-button')?.addEventListener('click', () => {
      this.#closeCancelConfirm()
      window.setTimeout(() => {
        cancelButton?.focus()
      }, 100)
    })

    this.host.querySelector('.map__save-button')?.addEventListener('click', async () => {
      const ok = await this.#saveFeatures()
      if (!ok) {
        // Keep edit mode open and focus error summary
        this.host.classList.add('map--save-error')
        // Fallback: focus the first error summary we find
        ;(this.host.querySelector('.map__save-error') as HTMLElement | null)?.focus()
        return
      }
      // Success: clear error, exit edit mode
      this.host.classList.remove('map--save-error')
      this.#closeCancelConfirm()
      this.host.historyManager?.clear()
      this.host.reactiveStore.editEnabled.set(false)
      this.host.classList.remove('map--has-undos', 'map--has-redos')
      this.host.baseMap?.getGeoman()?.disableAllModes()
      this.host.baseMap?.removeInsideDragInterceptors()
      // Ensure reset confirmation is closed if open
      this.host.classList.remove('map--confirm-reset')
      resetButton?.setAttribute('aria-expanded', 'false')
      window.setTimeout(() => {
        editButton?.focus()
      }, 100)
    })

    this.host.querySelector('.map__undo-button')?.addEventListener('click', () => {
      this.#handleHistoryAction('undo')
    })

    this.host.querySelector('.map__redo-button')?.addEventListener('click', () => {
      this.#handleHistoryAction('redo')
    })
  }

  #handleHistoryAction (type: 'undo' | 'redo') {
    const result = type === 'undo'
      ? this.host.historyManager?.undo()
      : this.host.historyManager?.redo()
    if (result == null) {
      return
    }
    // Prevent global event listener from pushing new history while replaying snapshot
    this.host.suppressHistoryCapture = true
    try {
      this.host.baseMap?.clearFeatures()
      this.capabilities.showFeature(result.state)
      if (type === 'undo') {
        if (result.undoStackLength === 0) {
          this.host.classList.remove('map--has-undos')
        }
        if (result.redoStackLength > 0) {
          this.host.classList.add('map--has-redos')
        } else {
          this.host.classList.remove('map--has-redos')
        }
      } else {
        if (result.redoStackLength === 0) {
          this.host.classList.remove('map--has-redos')
        }
        if (result.undoStackLength > 0) {
          this.host.classList.add('map--has-undos')
        } else {
          this.host.classList.remove('map--has-undos')
        }
      }
      this.host.baseMap?.setEditMode()
    } finally {
      this.host.suppressHistoryCapture = false
    }
  }

  #confirmReset () {
    if (this.#resetInProgress) {
      return
    }
    this.#resetInProgress = true
    try {
      try {
        this.host.suppressHistoryCapture = true
        this.host.baseMap?.clearFeatures()
        if (this.host.originalFeatures) {
          this.capabilities.showFeature(this.host.originalFeatures)
        }

        // Set the baseline history state to the original features and clear stacks
        this.host.historyManager?.addState(this.host.baseMap?.collectFeatureEntries())
        this.host.historyManager?.clear()
        this.host.classList.remove('map--has-undos', 'map--has-redos')
      } finally {
        this.host.suppressHistoryCapture = false
      }

      // Re-apply current edit sub-mode
      this.host.baseMap?.getGeoman()?.disableAllModes()
      this.host.baseMap?.removeInsideDragInterceptors()
      this.host.baseMap?.setEditMode()

      // Close the confirmation
      const resetButton = this.host.querySelector('.map__reset-shape-button') as HTMLButtonElement | null
      this.host.classList.remove('map--confirm-reset')
      resetButton?.setAttribute('aria-expanded', 'false')
      window.setTimeout(() => {
        resetButton?.focus()
      }, 100)
    } finally {
      this.#resetInProgress = false
    }
  }

  #openCancelConfirm () {
    this.host.classList.add('map--confirm-cancel')
    window.setTimeout(() => {
      (this.host.querySelector('.map__confirm-cancel-button') as HTMLButtonElement | null)?.focus()
    }, 100)
  }

  #closeCancelConfirm () {
    this.host.classList.remove('map--confirm-cancel')
  }

  #performCancel (editButton: HTMLButtonElement | null) {
    // Restore the state from when edit mode started (discard unsaved local edits)
    if (this.#initialEditState) {
      this.host.suppressHistoryCapture = true
      try {
        this.host.baseMap?.clearFeatures()
        this.capabilities.showFeature(this.#initialEditState)
      } finally {
        this.host.suppressHistoryCapture = false
      }
    }
    this.host.reactiveStore.editEnabled.set(false)
    this.host.classList.remove('map--has-undos', 'map--has-redos')
    this.host.historyManager?.clear()
    this.host.baseMap?.getGeoman()?.disableAllModes()
    this.host.baseMap?.removeInsideDragInterceptors()
    // Ensure reset/cancel confirmations are closed if open
    this.host.classList.remove('map--confirm-reset', 'map--confirm-cancel')
    this.host.querySelector<HTMLButtonElement>('.map__reset-shape-button')?.setAttribute('aria-expanded', 'false')
    window.setTimeout(() => {
      editButton?.focus()
    }, 100)
  }

  hostDisconnected () {
    // Ensure any custom listeners are detached on teardown
    // (prevents leaks and unintended interception after component removal)
    this.host.baseMap?.removeInsideDragInterceptors()
  }

  /**
   * Saves the current state of all features on the map to the server.
   * @returns {Promise<void>} Promise that resolves when the save request completes
   */
  async #saveFeatures (): Promise<boolean> {
    // Prevent saving while a draw is in progress to avoid losing the latest shape
    if (this.host.baseMap?.isDrawingActive) {
      this.#showSaveError('Finish drawing your shape, then try saving again.')
      return false
    }

    // Collect all current features as GeoJSON Features
    const allFeatures: any[] = []
    this.host.baseMap?.getGeoman()?.features.featureStore.forEach((entry) => {
      const feature = entry.getGeoJson()
      if (feature?.geometry?.type && feature?.geometry?.coordinates) {
        allFeatures.push(feature)
      }
    })

    if (allFeatures.length === 0) {
      this.#showSaveError('There are no shapes to save. Add a shape or cancel.')
      return false
    }

    // Determine expected base geometry type from the original feature
    const originalType = this.host.originalFeatures?.[0]?.geometry?.type || ''
    const expectedBaseType =
      originalType.includes('Polygon')
        ? 'Polygon'
        : originalType.includes('Point')
          ? 'Point'
          : originalType.includes('LineString')
            ? 'LineString'
            : ''

    // Filter features by expected base type if specified
    const filtered = expectedBaseType
      ? allFeatures.filter((f: any) => {
        const type = f?.geometry?.type || ''
        return type.includes(expectedBaseType)
      })
      : allFeatures

    if (filtered.length === 0) {
      this.#showSaveError('There are no shapes to save. Add a shape or cancel.')
      return false
    }

    // Use turf.combine() to automatically combine features of the same type into Multi* geometries
    const featureCollection = turf.featureCollection(filtered as any) as any
    const combined = turf.combine(featureCollection)

    if (!combined || !combined.features || combined.features.length === 0) {
      this.#showSaveError('There are no shapes to save. Add a shape or cancel.')
      return false
    }

    // Extract geometry from the first (and typically only) feature in the combined result
    let geometry: any = combined.features[0]?.geometry

    if (!geometry) {
      geometry = filtered[0]?.geometry ?? null
    }

    // Convert Multi* to single geometry if it contains only one element
    if (geometry?.type === 'MultiPolygon' && geometry.coordinates.length === 1) {
      geometry = { type: 'Polygon', coordinates: geometry.coordinates[0] } as any
    } else if (geometry?.type === 'MultiLineString' && geometry.coordinates.length === 1) {
      geometry = { type: 'LineString', coordinates: geometry.coordinates[0] } as any
    } else if (geometry?.type === 'MultiPoint' && geometry.coordinates.length === 1) {
      geometry = { type: 'Point', coordinates: geometry.coordinates[0] } as any
    }

    const payload = geometry
      ? [{ type: 'Feature', geometry, properties: {} }]
      : []

    if (payload.length === 0) {
      this.#showSaveError('There are no shapes to save. Add a shape or cancel.')
      return false
    }

    try {
      const response = await fetch(`${this.host.dataset.saveEndpoint}`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) {
        const text = await response.text().catch(() => '')
        this.#showSaveError(text || 'We could not save your changes.')
        return false
      }
      this.#hideSaveError()
      return true
    } catch (e: any) {
      this.#showSaveError(e?.message || 'We could not save your changes.')
      return false
    }
  }

  #showSaveError (message: string) {
    this.host.classList.add('map--save-error')
    const body = this.host.querySelector(`#save-error-body-${this.host._id}`) as HTMLParagraphElement | null
    if (body) {
      body.textContent = message
    }
    const container = this.host.querySelector('.map__save-error') as HTMLElement | null
    container?.setAttribute('role', 'alert')
    window.setTimeout(() => container?.focus(), 50)
  }

  #hideSaveError () {
    this.host.classList.remove('map--save-error')
  }
}
