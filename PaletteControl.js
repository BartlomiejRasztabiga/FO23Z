const PaletteControl = L.Control.extend({
  options: {
    initPalette: "hsv",
  },
  initialize: function (canvas, options) {
    L.setOptions(this, options);
    this._canvas = canvas;
  },

  onAdd: function (map) {
    // create the control container with a particular class name
    const container = L.DomUtil.create(
        "div",
        "leaflet-control-layers leaflet-control-layers-expanded",
    );
    const _this = this;

    const title = document.createElement("span");
    title.innerHTML = "Palette ";

    const buttonsContainer = L.DomUtil.create("div", "fractal-palette-buttons");

    this._buttons = [];

    paletteController.forEach(function (paletteName) {
      const paletteButton = L.DomUtil.create(
          "button",
          "fractal-palette-button",
          buttonsContainer,
      );
      paletteButton.innerHTML = paletteName;
      paletteButton.paletteName = paletteName;

      _this._buttons.push(paletteButton);

      L.DomEvent.on(paletteButton, "click", function () {
        _this._update(this.paletteName);
      });
    });

    this._update(this.options.initPalette);

    container.appendChild(title);
    container.appendChild(buttonsContainer);

    return container;
  },

  _update: function (activePaletteName) {
    this._buttons.forEach(function (button) {
      if (button.paletteName !== activePaletteName) {
        L.DomUtil.removeClass(button, "fractal-palette-button-active");
      } else {
        L.DomUtil.addClass(button, "fractal-palette-button-active");
      }
    });

    this._canvas.setPalette(activePaletteName);
  },
});
