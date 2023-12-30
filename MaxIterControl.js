const MaxIterControl = L.Control.extend({
  options: {
    initMaxIter: 500,
  },
  initialize: function (fractalLayers, options) {
    L.setOptions(this, options);
    this._fractalLayers = fractalLayers;
  },

  onAdd: function (map) {
    // create the control container with a particular class name
    const container = L.DomUtil.create(
      "div",
      "leaflet-control-layers leaflet-control-layers-expanded",
    );

    const title = document.createElement("span");
    title.innerHTML = "Max Iterations ";

    const input = document.createElement("input");
    input.type = "number";
    input.value = this.options.initMaxIter;

    L.DomEvent.on(
      input,
      "change",
      function () {
        this._update(input.value);
      },
      this,
    );

    container.appendChild(title);
    container.appendChild(input);

    return container;
  },

  _update: function (maxIter) {
    console.log(maxIter);
    for (const l in this._fractalLayers) {
      this._fractalLayers[l].setMaxIter(maxIter);
    }
  },
});
