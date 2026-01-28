/* eslint-env browser */
import type { MapComponent } from '../map-component'

export class KeyboardEditor extends HTMLElement {
  #MOVEMENT_AMOUNT = 0.5
  #host: MapComponent | null = null

  connectedCallback () {
    this.#host = this.closest('map-component') as MapComponent
    this.#render()
    document.body.addEventListener('keydown', this.#boundHandleKeyDown)
    // switch off keyboard edit mode when edit mode is disabled
    this.#host.reactiveStore.editEnabled.subscribe((editEnabled: boolean) => {
      if (!editEnabled) {
        this.#toggleKeyboardEditMode(false)
      }
    })
  }

  disconnectedCallback () {
    document.body.removeEventListener('keydown', this.#boundHandleKeyDown)
  }

  #render () {
    this.innerHTML = `

      <style>
        .map__map-libre {
          position: relative;
        }
        .map__keyboard-mode-alert {
          background-color: var(--govuk-focus-colour);
          position: absolute;
          top: 1px;
          left: 1px;
          padding: 2px;
          z-index: 999;
          visibility: hidden;
        }
        .keyboard-pointer {
          display: none;
          position: absolute;
          top: 50%;
          left: 50%;
          pointer-events: none;
          z-index: 1000;
          width: 40px;
          height: 40px;
        }
        .keyboard-editor---edit-mode .keyboard-pointer {
          display: block;
        }
        .keyboard-pointer__inner {
          position: relative;
          top: -50%;
          left: -50%;
        }
        .keyboard-pointer__horizontal {
          background-color: red;
          position: absolute;
          left: 0;
          top: 18px;
          width: 40px;
          height: 2px;
        }
        .keyboard-pointer__vertical {
          background-color: red;
          position: relative;
          top: 0;
          left: 18px;
          width: 2px;
          height: 40px;
        }
      </style>

      <div class="map__keyboard-mode-alert govuk-body" aria-live="assertive">Keyboard edit mode enabled</div>
      <div class="keyboard-pointer" style="top: 50%; left: 50%;">
        <div class="keyboard-pointer__inner">
          <div class="keyboard-pointer__horizontal"></div>
          <div class="keyboard-pointer__vertical"></div>
        </div>
      </div>
    `
  }

  #getPointerCoords = () => {
    const keyboardPointer = this.querySelector('.keyboard-pointer') as HTMLDivElement
    const rect = keyboardPointer.getBoundingClientRect()
    return {
      x: rect.left,
      y: rect.top
    }
  }

  #dispatchMouseMove = () => {
    const newCoords = this.#getPointerCoords()
    const mouseMoveEvent = new MouseEvent('mousemove', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: newCoords.x,
      clientY: newCoords.y
    })
    document.elementFromPoint(
      newCoords.x,
      newCoords.y
    )?.dispatchEvent(mouseMoveEvent)
  }

  // To ensure `this` is passed to #handleKeyDown
  #boundHandleKeyDown = (event: KeyboardEvent) => {
    this.#handleKeyDown(event)
  }

  #toggleKeyboardEditMode (makeActive: boolean) {
    if (makeActive) {
      this.classList.add('keyboard-editor---edit-mode')
      this.#host?.querySelector('canvas')?.focus()
      this.#host?.baseMap?.getMap()?.keyboard.disable()
      this.#showAlert('Keyboard edit mode enabled')
    } else {
      this.classList.remove('keyboard-editor---edit-mode')
      this.classList.remove('keyboard-editor---edit-mode')
      this.#host?.baseMap?.getMap()?.keyboard.enable()
      this.#showAlert('Keyboard edit mode disabled')
    }
  }

  #handleKeyDown (event: KeyboardEvent) {
    if (!this.#host?.reactiveStore.editEnabled.get()) {
      return
    }

    const keyboardPointer = this.querySelector('.keyboard-pointer') as HTMLDivElement

    if (this.classList.contains('keyboard-editor---edit-mode')) {
      event.preventDefault()
    }

    const movementAmount = this.#MOVEMENT_AMOUNT * (event.shiftKey ? 10 : 1)

    // toggle keyboard edit mode
    if (event.key.toLowerCase() === 'm') {
      this.#toggleKeyboardEditMode(!this.classList.contains('keyboard-editor---edit-mode'))

    // arrow keys
    } else if (event.key === 'ArrowUp') {
      const currentTop = parseFloat(keyboardPointer.style.top)
      const newPos = Math.max(0, currentTop - movementAmount)
      if (newPos === 0) {
        this.#host.baseMap?.getMap()?.panBy([0, -100])
      }
      keyboardPointer.style.top = `${newPos}%`
      this.#dispatchMouseMove()
    } else if (event.key === 'ArrowDown') {
      const currentTop = parseFloat(keyboardPointer.style.top)
      const newPos = Math.min(100, currentTop + movementAmount)
      if (newPos === 100) {
        this.#host.baseMap?.getMap()?.panBy([0, 100])
      }
      keyboardPointer.style.top = `${newPos}%`
      this.#dispatchMouseMove()
    } else if (event.key === 'ArrowLeft') {
      const currentLeft = parseFloat(keyboardPointer.style.left)
      const newPos = Math.max(0, currentLeft - movementAmount)
      if (newPos === 0) {
        this.#host.baseMap?.getMap()?.panBy([-100, 0])
      }
      keyboardPointer.style.left = `${newPos}%`
      this.#dispatchMouseMove()
    } else if (event.key === 'ArrowRight') {
      const currentLeft = parseFloat(keyboardPointer.style.left)
      const newPos = Math.min(100, currentLeft + movementAmount)
      if (newPos === 100) {
        this.#host.baseMap?.getMap()?.panBy([100, 0])
      }
      keyboardPointer.style.left = `${newPos}%`
      this.#dispatchMouseMove()

    // zoom keys
    } else if (event.key === '-') {
      this.#host.baseMap?.getMap()?.zoomOut()
    } else if (event.key === '+' || event.key === '=') {
      this.#host.baseMap?.getMap()?.zoomIn()

    // enter key
    } else if (event.key === 'Enter' || event.key === ' ') {
      // check what type of event we want to dispatch (based on the edit mode)
      const editMode = this.#host?.reactiveStore.editMode.get()
      if (editMode === 'cut' || editMode === 'polygon' || editMode === 'magic_wand' || editMode === 'delete') {
        keyboardPointer.dataset.mode = 'click'
      } else if (keyboardPointer.dataset.mode === 'mousedown') {
        keyboardPointer.dataset.mode = 'mouseup'
      } else {
        keyboardPointer.dataset.mode = 'mousedown'
      }

      // trigger the mouse event
      const coords = this.#getPointerCoords()
      const mouseClickEvent = new MouseEvent(keyboardPointer.dataset.mode, {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: coords?.x,
        clientY: coords?.y
      })

      document.elementFromPoint(
        coords?.x,
        coords?.y
      )?.dispatchEvent(mouseClickEvent)
    }
  }

  #showAlert (message: string) {
    const alert = this.querySelector('.map__keyboard-mode-alert') as HTMLDivElement
    alert.textContent = message
    alert.style.visibility = 'visible'
    window.setTimeout(() => {
      alert.style.visibility = 'hidden'
    }, 3000)
  }
}
