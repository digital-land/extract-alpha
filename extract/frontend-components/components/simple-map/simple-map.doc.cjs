module.exports = {
  name: "Simple Map",
  description: "Component that shows a simple map using MapLibre GL JS.",
  properties: [
    {
      name: "title",
      type: "String",
      values: "Title",
      required: true,
    },
    {
      name: "lat",
      type: "String",
      values: "51.501364",
      required: true,
    },
    {
      name: "lng",
      type: "String",
      values: "-0.1444649",
      required: true,
    },
    {
      name: "zoom",
      type: "String",
      values: "15",
      required: true,
    },
    {
      name: "enableToggle",
      type: "Boolean",
      required: false,
    },
  ],
  examples: [
    {
      title: "Toggle disabled",
      description: "An example of the simple map with toggle disabled.",
      template: `
       <simple-map
          title="Generated map"
          lat="51.501364"
          lng="-0.1444649"
          zoom="15"
        ></simple-map>`,
    },
    {
      title: "Loaded",
      description: "An example of the simple map with toggle enabled.",
      template: `
       <simple-map
          title="Generated map"
          lat="51.501364"
          lng="-0.1444649"
          zoom="15"
          enableToggle="true"
        ></simple-map>`,
    },
  ],
};

