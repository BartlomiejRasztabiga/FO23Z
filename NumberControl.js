const NumberControl = L.Control.extend({
  options: {
    initRe: 0,
    initIm: 0
  },
  initialize: function (fractalLayers, options) {
    L.setOptions(this, options);
    this._fractalLayers = fractalLayers;
  },

  onAdd: function (map) {
    // create the control container with a particular class name
    const container = L.DomUtil.create(
        "div",
        "leaflet-control-layers leaflet-control-layers-expanded flex",
    );

    const title = document.createElement("span");
    title.innerHTML = "Re/Im ";

    const inputRe = document.createElement("input");
    inputRe.type = "number";
    inputRe.value = this.options.initRe;

    L.DomEvent.on(inputRe, "change", function () {
      this._update(inputRe.value, "re");
    }, this);

    const inputIm = document.createElement("input");
    inputIm.type = "number";
    inputIm.value = this.options.initIm;

    L.DomEvent.on(inputIm, "change", function () {
      this._update(inputIm.value, "im");
    }, this);

    // TODO make generic
    const predefinedJulia = L.DomUtil.create("button", "fractal-palette-button");
    predefinedJulia.innerHTML = "-0.75 + 0.11i";
    predefinedJulia.re = -0.75;
    predefinedJulia.im = 0.11;

    L.DomEvent.on(predefinedJulia, "click", function () {
      this._update(predefinedJulia.re, "re");
      this._update(predefinedJulia.im, "im");
    }, this);

    container.appendChild(title);
    container.appendChild(inputRe);
    container.appendChild(inputIm);
    container.appendChild(predefinedJulia);

    return container
  },

  _update: function (value, type) {
    console.log(value);
    console.log(type);
    for (const l in this._fractalLayers) {
      if (type === "re") {
        this._fractalLayers[l].setCr(+value);
      } else {
        this._fractalLayers[l].setCi(+value);
      }
    }
  },
});
