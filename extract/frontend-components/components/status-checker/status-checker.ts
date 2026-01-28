/* eslint-env browser */

const CHECK_INTERVAL = 2000

/**
 * Web component for monitoring and displaying the status of a job (AI extraction task).
 *
 * This polls the backend for job status, updates the tag,
 * and announces status changes using an aria-live region.
 *
 * Attributes:
 * - job-id:     The ID of the job to check.
 * - job-title:  The title of the job being displayed, used in the accessible status updates.
 *
 * Expects to find a Govuk Tag as a child, which it colors and updates with the current status.
 *
 * Example usage:
 *   <status-checker job-id="1234" job-title="Article 4 Direction">
 *     <strong class="govuk-tag govuk-tag--grey">queued</strong>
 *   </status-checker>
 */
class StatusChecker extends HTMLElement {
  private tag: HTMLElement | null = null
  private alert: HTMLSpanElement | null = null
  private polling = false

  connectedCallback (): void {
    // Find the tag and add the alert region if not present
    this.tag = this.querySelector('strong')
    if (!this.tag) return

    // Create alert region if it doesn't exist
    this.alert = this.querySelector(
      '.status-checker__alert'
    ) as HTMLSpanElement
    if (!this.alert) {
      this.alert = document.createElement('span')
      this.alert.className = 'govuk-visually-hidden status-checker__alert'
      this.alert.setAttribute('aria-live', 'assertive')
      this.appendChild(this.alert)
    }

    // Set initial status color and start polling if needed
    this.#setStatusColour()
    if (this.tag.textContent?.trim() !== 'completed') {
      this.polling = true
      this.#checkStatus()
    }
  }

  /**
   * Stop polling when the element is removed from the DOM.
   */
  disconnectedCallback (): void {
    this.polling = false
  }

  /**
   * Handle attribute changes.
   * @param name
   * @param oldValue
   * @param newValue
   */
  attributeChangedCallback (
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    // If job-id changes, restart polling
    if (name === 'job-id' && oldValue !== newValue && this.polling) {
      this.#checkStatus()
    }
    // If job-title changes, update alert text
    if (name === 'job-title' && this.alert) {
      this.#setAlert(this.tag?.textContent || '')
    }
  }

  /**
   * Check the job status from the backend and update the tag and alert.
   * @returns
   */
  async #checkStatus (): Promise<void> {
    if (!this.polling || !this.tag || !this.getAttribute('job-id')) return

    try {
      const response = await fetch(`/api/jobs/${this.getAttribute('job-id')}`)
      if (!response.ok) throw new Error('Network error')
      const data = await response.json()
      const statusText = data.status || 'unknown'

      this.tag.textContent = statusText.replace('_', ' ')
      this.#setAlert(this.tag.textContent || '')
      this.#setStatusColour()

      if (
        statusText !== 'completed' &&
        statusText !== 'failed' &&
        this.polling
      ) {
        window.setTimeout(() => this.#checkStatus(), CHECK_INTERVAL)
      }
    } catch (err) {
      this.tag.textContent = 'error'
      this.#setAlert('error')
      this.#setStatusColour()
    }
  }

  /**
   * Set the color of the status tag based on the current status.
   * @returns
   */
  #setStatusColour (): void {
    if (!this.tag) return
    const statusText = this.tag.textContent?.trim()
    this.tag.classList.remove(
      'govuk-tag--green',
      'govuk-tag--red',
      'govuk-tag--grey'
    )
    if (statusText === 'completed') {
      this.tag.classList.add('govuk-tag--green')
    } else if (statusText === 'failed' || statusText === 'error') {
      this.tag.classList.add('govuk-tag--red')
    } else {
      this.tag.classList.add('govuk-tag--grey')
    }
  }

  /**
   * Set the alert text for screen readers.
   * @param statusText The current status text to be announced.
   */
  #setAlert (statusText: string): void {
    if (this.alert) {
      this.alert.textContent = `${
        this.getAttribute('job-title') || 'Job'
      } is ${statusText}`
    }
  }
}

customElements.define('status-checker', StatusChecker)
