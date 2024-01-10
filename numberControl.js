const NumberControl = L.Control.extend({
  options: {
    initRe: 0,
    initIm: 0,
  },
  initialize: function (canvas, options) {
    L.setOptions(this, options);
    this._canvas = canvas;
  },

  onAdd: function (map) {
    const container = L.DomUtil.create(
        "div",
        "leaflet-control-layers leaflet-control-layers-expanded flex",
    );

    const title = document.createElement("span");
    title.innerHTML = "Re/Im ";

    const inputRe = document.createElement("input");
    inputRe.type = "number";
    inputRe.value = this.options.initRe;

    L.DomEvent.on(
        inputRe,
        "change",
        function () {
          this._canvas.setCr(+inputRe.value);
        },
        this,
    );

    const inputIm = document.createElement("input");
    inputIm.type = "number";
    inputIm.value = this.options.initIm;

    L.DomEvent.on(
        inputIm,
        "change",
        function () {
          this._canvas.setCi(+inputIm.value);
        },
        this,
    );

    container.appendChild(title);
    container.appendChild(inputRe);
    container.appendChild(inputIm);

    const predefined = [
      {re: -0.74543, im: 0.11301},
      {re: -0.75, im: 0.11},
      {re: -0.1, im: 0.651},
      {re: -0.4, im: 0.6},
      {re: -0.8, im: 0.156},
      {re: -1.118484848, im: 0.273636364},
      {re: -0.37, im: 0.6},
      {re: 0.285, im: 0.01},
      {re: -0.70176, im: -0.3842},
      {re: 0, im: -0.8},
      {re: 0.355, im: 0.355},
    ];

    const _this = this;

    predefined.forEach(function (p) {
      const predefinedJulia = L.DomUtil.create(
          "button",
          "fractal-palette-button",
      );
      predefinedJulia.innerHTML = `${p.re} + ${p.im}i`;
      predefinedJulia.re = p.re;
      predefinedJulia.im = p.im;

      L.DomEvent.on(
          predefinedJulia,
          "click",
          function () {
            this._canvas.setCrCi(predefinedJulia.re, predefinedJulia.im)
          },
          _this,
      );
      container.appendChild(predefinedJulia);
    });

    return container;
  },
});
