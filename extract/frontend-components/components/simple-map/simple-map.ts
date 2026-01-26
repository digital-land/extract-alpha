import ml from "maplibre-gl";
import {
  Geoman,
  type GeoJsonImportFeature,
  type GmOptionsPartial,
} from "@geoman-io/maplibre-geoman-free";

// const FEATURE_FLAGS = {
//   enablePopups: true,
//   enableHoverHighlight: true
// }

export class SimpleMap extends HTMLElement {
  static observedAttributes = ["title"];

  el: Element | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map: any | null = null; // ml.Map or MapInstanceWithGeoman??
  geoman: Geoman | null = null;

  mapLibreStyle: ml.StyleSpecification = {
    version: 8,
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    sources: {
      "osm-tiles": {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors",
      },
    },
    layers: [
      {
        id: "osm-tiles-layer",
        type: "raster",
        source: "osm-tiles",
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  };

  connectedCallback() {
    this.#render();
    this.#initMap();
    this.#initGeoman();
  }

  #render() {
    this.innerHTML = `
      <style>
        .simple-map__top:has(#show-map:not(:checked)) ~ .simple-map__simple-map { display: none; }
        .simple-map__top:has(#show-map:checked) ~ .simple-map__simple-map { display: block; }
        .simple-map .simple-map__simple-map { width: 100%; }
        .simple-map .simple-map__map, .simple-map #map { border: 1px solid #000; width: 100%; height: 400px; }
      </style>
      <div class="simple-map">
        <div class="simple-map__top">
          <h2 class="govuk-heading-m">${this.getAttribute("title")}</h2>
          ${this.#renderActions()}
        </div>
        <div class="simple-map__simple-map">
          <div id="map" class="simple-map__map"></div>
        </div>
      </div>
    `;

    this.el = this.querySelector(".simple-map");
  }

  #renderActions() {
    return `
      <div class="simple-map__actions">
        <p class="govuk-body">
          <a href="${this.getAttribute("basePath")}/map" class="govuk-link govuk-link--no-visited-state" rel="noreferrer noopener" target="_blank">Open <span class="govuk-visually-hidden">map</span> in new window</a>
        </p>
        <fieldset class="govuk-fieldset">
          <legend class="govuk-fieldset__legend govuk-fieldset__legend--m govuk-visually-hidden">
            Show and hide map preview
          </legend>
          <div class="govuk-checkboxes govuk-checkboxes--small" data-module="govuk-checkboxes">
            <div class="govuk-checkboxes__item">
              <input class="govuk-checkboxes__input" id="show-map" name="show-map" type="checkbox" value="show-map" checked="checked">
              <label class="govuk-label govuk-checkboxes__label" for="show-map">
                Show map
              </label>
            </div>
          </div>
        </fieldset>
      </div>
    `;
  }

  #initMap() {
    if (!this.el) return;
    const mapDiv = this.el.querySelector("#map");
    this.map = new ml.Map({
      container: mapDiv as HTMLElement,
      // style: "http://localhost:8081/api/map-style-os",
      style: this.mapLibreStyle,
      center: [0, 51],
      zoom: 5,
    });
  }

  #initGeoman() {
    if (!this.map) return;

    const gmOptions: GmOptionsPartial = {
      // geoman options here
    };

    this.geoman = new Geoman(this.map, gmOptions);

    this.map.on("gm:loaded", () => {
      console.log("Geoman fully loaded");

      const test: GeoJsonImportFeature = {
        type: "Feature",
        properties: {},
        geometry: {
          coordinates: [
            [
              [-0.14355876973726822, 51.49391648836419],
              [-0.14102432762049943, 51.49391648836419],
              [-0.14102432762049943, 51.49940032655593],
              [-0.14355876973726822, 51.49940032655593],
              [-0.14355876973726822, 51.49391648836419],
            ],
          ],
          type: "Polygon",
        },
      };

      this.map?.gm?.features.importGeoJsonFeature(test);

      // Here you can add your geojson shapes for example
      const shapeGeoJson: GeoJsonImportFeature = {
        type: "Feature",
        geometry: { type: "Point", coordinates: [0, 51] },
        properties: {},
      };
      // add a geojson shape to the map
      this.geoman?.features.importGeoJsonFeature(shapeGeoJson);

      const shapeGeoJson2: GeoJsonImportFeature = {
        type: "Feature",
        geometry: { type: "Point", coordinates: [3, 52] },
        properties: {},
      };
      // geoman instance is also available on the map object
      this.map?.gm?.features.importGeoJsonFeature(shapeGeoJson2);
    });
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    console.log(
      `Attribute ${name} has changed from ${oldValue} to ${newValue}.`
    );
  }
}

customElements.define("simple-map", SimpleMap);
