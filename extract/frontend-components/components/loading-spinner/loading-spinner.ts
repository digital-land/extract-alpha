/* eslint-env browser */

type JobStatus = 'awaiting_start' | 'in_progress' | 'completed' | 'failed'

/**
 * Web component for monitoring and displaying the status of a job (AI extraction task).
 *
 * This polls the backend for job status, updates the message,
 * and announces status changes using an aria-live region.
 *
 * Attributes:
 * - fetch-url:     The URL to fetch the job status from
 *
 * Any HTML added inside the component will be displayed if the javascript is not available.
 *
 * Example usage:
 *   <loading-spinner fetch-url="/api/jobs/job-in-progress">
 *     <p class="govuk-body-l">Your PDF is being processed. This may take a few minutes. Please refresh the page to check the status.</p>
 *   </loading-spinner>
 */
class LoadingSpinner extends HTMLElement {
  #CHECK_INTERVAL = 5000

  #messages: Record<JobStatus, string> = {
    awaiting_start: `
      <p class="govuk-body-l">The service is busier than usual. Your extraction is in the queue.</p>
    `,
    in_progress: `
      <p class="govuk-body-l">Your PDF is being processed. This may take a few minutes.</p>
    `,
    completed: `
      <p class="govuk-body-l">Your PDF has been processed. <span class="govuk-visually-hidden">Click the button below this message or reload the page to continue.</span></p>
      <a href="${window.location.href}" class="govuk-button">View extraction</a>
    `,
    failed: `
      <p class="govuk-body-l">Your PDF has failed to process. Please <a href="/upload">try uploading again</a>.</p>
    `
  }

  connectedCallback (): void {
    this.#render()
    this.#checkStatus()
    this.querySelector('.loading-spinner__pause-button')?.addEventListener('click', this.#stopSpinnerHandler)
  }

  disconnectedCallback (): void {
    this.querySelector('.loading-spinner__pause-button')?.removeEventListener('click', this.#stopSpinnerHandler)
  }

  #render (): void {
    this.classList.add('loading-spinner')
    this.innerHTML = `
      <div class="loading-spinner__spinner loading-spinner__spinner--active">
        <div class="loading-spinner__spinner-inner"></div>
        <button class="loading-spinner__pause-button govuk-link govuk-!-margin-top-2">Stop spinner animation</button>
        <span class="loading-spinner__pause-message govuk-body-s govuk-!-margin-top-2 govuk-!-margin-bottom-0" tabindex="-1">Animation stopped. This will not affect the extraction process.</span>
      </div>
      <div class="loading-spinner__message govuk-body-l govuk-!-margin-top-5" aria-live="assertive"></div>
    `
  }

  #stopSpinnerHandler = () => this.#stopSpinner()
  #stopSpinner (remove: boolean = false): void {
    const spinner = this.querySelector('.loading-spinner__spinner')
    spinner?.classList.remove('loading-spinner__spinner--active')
    if (remove) {
      spinner?.remove()
    } else {
      (this.querySelector('.loading-spinner__pause-message') as HTMLSpanElement | null)?.focus()
    }
  }

  /**
   * Check the job status from the backend and update the message.
   */
  async #checkStatus (): Promise<void> {
    const statusMessage = this.querySelector('.loading-spinner__message')
    const fetchUrl = this.getAttribute('fetch-url')

    // If the component gets removed from the DOM, it will stop polling
    if (!this.isConnected || !statusMessage || !fetchUrl) return

    try {
      const response = await fetch(fetchUrl)
      if (!response.ok) {
        throw new Error('Error with extraction status response')
      }
      const data = await response.json()
      const statusText = data.status as JobStatus

      const message = this.#messages[data.status as JobStatus]
      if (message) {
        statusMessage.innerHTML = message
      }

      if (statusText === 'completed' || statusText === 'failed') {
        this.#stopSpinner(true)
      } else {
        window.setTimeout(() => this.#checkStatus(), this.#CHECK_INTERVAL)
      }
    } catch (err) {
      console.error(`Error fetching extraction status: ${err}`)
      window.setTimeout(() => this.#checkStatus(), this.#CHECK_INTERVAL)
    }
  }
}

customElements.define('loading-spinner', LoadingSpinner)
