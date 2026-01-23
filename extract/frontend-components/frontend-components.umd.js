(function(i,o){typeof exports=="object"&&typeof module<"u"?o(exports):typeof define=="function"&&define.amd?define(["exports"],o):(i=typeof globalThis<"u"?globalThis:i||self,o(i.FrontendComponents={}))})(this,(function(i){"use strict";class o extends HTMLElement{static get observedAttributes(){return["color","label"]}constructor(){super(),this.attachShadow({mode:"open"}),this.render()}attributeChangedCallback(){this.render()}render(){const t=this.getAttribute("color")||"#0078d4",e=this.getAttribute("label")||"Coloured Box";this.shadowRoot&&(this.shadowRoot.innerHTML=`
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
        <div class="box">${e}</div>
      `)}}customElements.define("my-box",o);class a extends HTMLElement{static POLL_INTERVAL=2e3;static observedAttributes=["job-id","job-title","api-path"];static jobStatusList=["awaiting_start","in_progress","completed","failed"];#s=null;#i=null;#o=null;#e=null;#t=null;#a=!1;#n="unknown";#r=null;constructor(){super()}connectedCallback(){this.#h(),this.#l(),this.#s&&this.#i&&this.#o&&(this.polling=!0)}disconnectedCallback(){this.#p()}attributeChangedCallback(t,e,s){t==="job-id"&&(this.#s=s),t==="job-title"&&(this.#i=s),t==="api-path"&&(this.#o=s),this.#s&&this.#i&&this.#o&&(this.#h(),this.#l(),this.polling=!0)}#h(){if(this.classList.add("status-checker"),this.#s&&this.#i&&this.#o){this.#e=this.#b();const t=this.#e.textContent?.trim()||"unknown";this.#n=a.jobStatusList.includes(t)?t:"unknown",this.querySelector(".status-checker__alert")?this.#t=this.querySelector(".status-checker__alert"):(this.#t=this.#f(),this.appendChild(this.#t)),this.#c()}}#c(){if(this.#e&&this.#e.classList.contains("govuk-tag")!==!1)switch(this.#e.classList.remove("govuk-tag--green","govuk-tag--red","govuk-tag--grey"),this.#n){case"completed":this.#e.classList.add("govuk-tag--green");break;case"failed":this.#e.classList.add("govuk-tag--red");break;default:this.#e.classList.add("govuk-tag--grey")}}#p(){this.classList.remove("status-checker"),this.removeChild(this.#t),this.#e=null,this.#t=null,this.#n="unknown",this.#d()}#l(){this.#n!=="unknown"&&(this.#e&&(this.#e.textContent=this.#n.trim(),this.#c()),this.#t&&(this.#t.textContent=`${this.#i||"Job"} is ${this.#n.trim()}`))}get polling(){return this.#a}set polling(t){this.#a!==t&&(this.#a=t,t?this.#u():this.#d())}async#u(){this.classList.add("status-checker--active"),this.#t&&(this.#t.setAttribute("aria-busy","true"),this.#t.textContent="Checking status…");const{status:t}=await this.#g();this.#t&&this.#t.setAttribute("aria-busy","false"),this.#n=t,this.#l(),t!=="completed"&&t!=="failed"&&t!=="unknown"?this.#r=window.setTimeout(()=>this.#u(),a.POLL_INTERVAL):this.#r=null}#d(){this.classList.remove("status-checker--active"),this.#r!==null&&(clearTimeout(this.#r),this.#r=null)}async#g(){const t={id:this.#s||"",jobType:"",status:"unknown"},e=`${this.#o?.replace(/\/$/,"")}/${this.#s}`;if(!e)return t;try{const s=await fetch(e);if(!s.ok)throw new Error("Network error");const n=await s.json(),r=a.jobStatusList.includes(n.status)?n.status:"unknown";return await new Promise(l=>setTimeout(l,5e3)),{id:n.id,jobType:n.job_type,status:r}}catch(s){return console.error("Error fetching status:",s),t}}#f(){const t=document.createElement("span");return t.className="status-checker__alert",t.setAttribute("aria-live","polite"),t.setAttribute("aria-busy","false"),t.setAttribute("role","alert"),t.textContent=`${this.#i||"Job"} is ${this.#n?.trim()||"unknown"}`,t}#b(){let t=this.querySelector(":scope > *:not(.status-checker__alert)");if(!t){const e=this.textContent?.trim()||"";for(;this.firstChild;)this.removeChild(this.firstChild);t=document.createElement("span"),t.textContent=e,this.appendChild(t)}return t}}customElements.define("status-checker",a);class h extends HTMLElement{#s=5e3;#i={awaiting_start:`
      <p class="govuk-body-l">The service is busier than usual. Your extraction is in the queue.</p>
    `,in_progress:`
      <p class="govuk-body-l">Your PDF is being processed. This may take a few minutes.</p>
    `,completed:`
      <p class="govuk-body-l">Your PDF has been processed. <span class="govuk-visually-hidden">Click the button below this message or reload the page to continue.</span></p>
      <a href="${window.location.href}" class="govuk-button">View extraction</a>
    `,failed:`
      <p class="govuk-body-l">Your PDF has failed to process. Please <a href="/upload">try uploading again</a>.</p>
    `};connectedCallback(){this.#o(),this.#a(),this.querySelector(".loading-spinner__pause-button")?.addEventListener("click",this.#e)}disconnectedCallback(){this.querySelector(".loading-spinner__pause-button")?.removeEventListener("click",this.#e)}#o(){this.classList.add("loading-spinner"),this.innerHTML=`
      <div class="loading-spinner__spinner loading-spinner__spinner--active">
        <div class="loading-spinner__spinner-inner"></div>
        <button class="loading-spinner__pause-button govuk-link govuk-!-margin-top-2">Stop spinner animation</button>
        <span class="loading-spinner__pause-message govuk-body-s govuk-!-margin-top-2 govuk-!-margin-bottom-0" tabindex="-1">Animation stopped. This will not affect the extraction process.</span>
      </div>
      <div class="loading-spinner__message govuk-body-l govuk-!-margin-top-5" aria-live="assertive"></div>
    `}#e=()=>this.#t();#t(t=!1){const e=this.querySelector(".loading-spinner__spinner");e?.classList.remove("loading-spinner__spinner--active"),t?e?.remove():this.querySelector(".loading-spinner__pause-message")?.focus()}async#a(){const t=this.querySelector(".loading-spinner__message"),e=this.getAttribute("fetch-url");if(!(!this.isConnected||!t||!e))try{const s=await fetch(e);if(!s.ok)throw new Error("Error with extraction status response");const n=await s.json(),r=n.status,l=this.#i[n.status];l&&(t.innerHTML=l),r==="completed"||r==="failed"?this.#t(!0):window.setTimeout(()=>this.#a(),this.#s)}catch(s){console.error(`Error fetching extraction status: ${s}`),window.setTimeout(()=>this.#a(),this.#s)}}}customElements.define("loading-spinner",h),i.LoadingSpinner=h,i.MyBox=o,i.StatusChecker=a,Object.defineProperty(i,Symbol.toStringTag,{value:"Module"})}));
