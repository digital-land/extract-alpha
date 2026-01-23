class l extends HTMLElement {
  static get observedAttributes() {
    return ["color", "label"];
  }
  constructor() {
    super(), this.attachShadow({ mode: "open" }), this.render();
  }
  attributeChangedCallback() {
    this.render();
  }
  render() {
    const t = this.getAttribute("color") || "#0078d4", s = this.getAttribute("label") || "Coloured Box";
    this.shadowRoot && (this.shadowRoot.innerHTML = `
        <style>
          .box {
            width: 200px;
            height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            border: 2px solid #333;
            font-size: 1.2rem;
            color: #fff;
            background: ${t};
          }
        </style>
        <div class="box">${s}</div>
      `);
  }
}
customElements.define("my-box", l);
class n extends HTMLElement {
  // props
  static POLL_INTERVAL = 2e3;
  // ms
  static observedAttributes = ["job-id", "job-title", "api-path"];
  static jobStatusList = [
    "awaiting_start",
    "in_progress",
    "completed",
    "failed"
  ];
  #e = null;
  #i = null;
  #a = null;
  // elements
  #s = null;
  #t = null;
  // state
  #o = !1;
  #n = "unknown";
  #r = null;
  constructor() {
    super();
  }
  /**
   * Handle component being added to the DOM.
   */
  connectedCallback() {
    this.#h(), this.#l(), this.#e && this.#i && this.#a && (this.polling = !0);
  }
  /**
   * Handle component being removed from the DOM.
   */
  disconnectedCallback() {
    this.#p();
  }
  /**
   * Handle attribute changes.
   * @param name The name of the attribute that changed.
   * @param _oldValue The old value of the attribute.
   * @param newValue The new value of the attribute.
   */
  attributeChangedCallback(t, s, e) {
    t === "job-id" && (this.#e = e), t === "job-title" && (this.#i = e), t === "api-path" && (this.#a = e), this.#e && this.#i && this.#a && (this.#h(), this.#l(), this.polling = !0);
  }
  /**
   * Initialise the status checker component so that it
   * has the structure and elements it needs for the rest
   * of the component to function
   * @returns void
   */
  #h() {
    if (this.classList.add("status-checker"), this.#e && this.#i && this.#a) {
      this.#s = this.#f();
      const t = this.#s.textContent?.trim() || "unknown";
      this.#n = n.jobStatusList.includes(
        t
      ) ? t : "unknown", this.querySelector(".status-checker__alert") ? this.#t = this.querySelector(
        ".status-checker__alert"
      ) : (this.#t = this.#b(), this.appendChild(this.#t)), this.#c();
    }
  }
  /**
   * Apply Govuk Tag styles to the status element based on current status.
   * @returns void
   */
  #c() {
    if (this.#s && this.#s.classList.contains("govuk-tag") !== !1)
      switch (this.#s.classList.remove(
        "govuk-tag--green",
        "govuk-tag--red",
        "govuk-tag--grey"
      ), this.#n) {
        case "completed":
          this.#s.classList.add("govuk-tag--green");
          break;
        case "failed":
          this.#s.classList.add("govuk-tag--red");
          break;
        default:
          this.#s.classList.add("govuk-tag--grey");
      }
  }
  /**
   * Reset the status checker to its initial state.
   * @returns void
   */
  #p() {
    this.classList.remove("status-checker"), this.removeChild(this.#t), this.#s = null, this.#t = null, this.#n = "unknown", this.#d();
  }
  /**
   * Update the status element and alert region with the current status.
   * @returns void
   */
  #l() {
    this.#n !== "unknown" && (this.#s && (this.#s.textContent = this.#n.trim(), this.#c()), this.#t && (this.#t.textContent = `${this.#i || "Job"} is ${this.#n.trim()}`));
  }
  /**
   * Get or set the polling state.
   */
  get polling() {
    return this.#o;
  }
  /**
   * Set the polling state.
   * @param value The new polling state.
   */
  set polling(t) {
    this.#o !== t && (this.#o = t, t ? this.#u() : this.#d());
  }
  /**
   * Start polling the backend for job status.
   * @returns void
   */
  async #u() {
    this.classList.add("status-checker--active"), this.#t && (this.#t.setAttribute("aria-busy", "true"), this.#t.textContent = "Checking status…");
    const { status: t } = await this.#g();
    this.#t && this.#t.setAttribute("aria-busy", "false"), this.#n = t, this.#l(), t !== "completed" && t !== "failed" && t !== "unknown" ? this.#r = window.setTimeout(
      () => this.#u(),
      n.POLL_INTERVAL
    ) : this.#r = null;
  }
  /**
   * Stop polling the backend for job status.
   * @returns void
   */
  #d() {
    this.classList.remove("status-checker--active"), this.#r !== null && (clearTimeout(this.#r), this.#r = null);
  }
  /**
   * Fetch the job status from the backend API.
   * @returns JobStatusResponse The job status response.
   */
  async #g() {
    const t = {
      id: this.#e || "",
      jobType: "",
      status: "unknown"
    }, s = `${this.#a?.replace(/\/$/, "")}/${this.#e}`;
    if (!s) return t;
    try {
      const e = await fetch(s);
      if (!e.ok) throw new Error("Network error");
      const i = await e.json(), a = n.jobStatusList.includes(
        i.status
      ) ? i.status : "unknown";
      return await new Promise((o) => setTimeout(o, 5e3)), {
        id: i.id,
        jobType: i.job_type,
        status: a
      };
    } catch (e) {
      return console.error("Error fetching status:", e), t;
    }
  }
  /**
   * Create the alert region for screen readers.
   * @returns HTMLSpanElement The created alert region element.
   */
  #b() {
    const t = document.createElement("span");
    return t.className = "status-checker__alert", t.setAttribute("aria-live", "polite"), t.setAttribute("aria-busy", "false"), t.setAttribute("role", "alert"), t.textContent = `${this.#i || "Job"} is ${this.#n?.trim() || "unknown"}`, t;
  }
  /**
   * Returns the element that contains the status text, if its not wrapped already then it will wrap it in a span.
   * Also removes any existing text nodes and returns the status tag element.
   * @returns HTMLSpanElement The status tag element.
   */
  #f() {
    let t = this.querySelector(
      ":scope > *:not(.status-checker__alert)"
    );
    if (!t) {
      const s = this.textContent?.trim() || "";
      for (; this.firstChild; )
        this.removeChild(this.firstChild);
      t = document.createElement("span"), t.textContent = s, this.appendChild(t);
    }
    return t;
  }
}
customElements.define("status-checker", n);
class h extends HTMLElement {
  #e = 5e3;
  #i = {
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
  };
  connectedCallback() {
    this.#a(), this.#o(), this.querySelector(".loading-spinner__pause-button")?.addEventListener(
      "click",
      this.#s
    );
  }
  disconnectedCallback() {
    this.querySelector(".loading-spinner__pause-button")?.removeEventListener(
      "click",
      this.#s
    );
  }
  #a() {
    this.classList.add("loading-spinner"), this.innerHTML = `
      <div class="loading-spinner__spinner loading-spinner__spinner--active">
        <div class="loading-spinner__spinner-inner"></div>
        <button class="loading-spinner__pause-button govuk-link govuk-!-margin-top-2">Stop spinner animation</button>
        <span class="loading-spinner__pause-message govuk-body-s govuk-!-margin-top-2 govuk-!-margin-bottom-0" tabindex="-1">Animation stopped. This will not affect the extraction process.</span>
      </div>
      <div class="loading-spinner__message govuk-body-l govuk-!-margin-top-5" aria-live="assertive"></div>
    `;
  }
  #s = () => this.#t();
  #t(t = !1) {
    const s = this.querySelector(".loading-spinner__spinner");
    s?.classList.remove("loading-spinner__spinner--active"), t ? s?.remove() : this.querySelector(
      ".loading-spinner__pause-message"
    )?.focus();
  }
  /**
   * Check the job status from the backend and update the message.
   */
  async #o() {
    const t = this.querySelector(".loading-spinner__message"), s = this.getAttribute("fetch-url");
    if (!(!this.isConnected || !t || !s))
      try {
        const e = await fetch(s);
        if (!e.ok)
          throw new Error("Error with extraction status response");
        const i = await e.json(), a = i.status, o = this.#i[i.status];
        o && (t.innerHTML = o), a === "completed" || a === "failed" ? this.#t(!0) : window.setTimeout(() => this.#o(), this.#e);
      } catch (e) {
        console.error(`Error fetching extraction status: ${e}`), window.setTimeout(() => this.#o(), this.#e);
      }
  }
}
customElements.define("loading-spinner", h);
export {
  h as LoadingSpinner,
  l as MyBox,
  n as StatusChecker
};
