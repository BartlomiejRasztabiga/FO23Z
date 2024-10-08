const paletteController = {
  _paletteGenerators: {
    hsv: function (colorIndex) {
      let h = colorIndex * 360;
      const s = 1 - colorIndex < 1e-2 ? 0 : 0.75;
      const v = 0.75 * 255;
      const vi = Math.floor(v);
      let rgb, i
      let data = [];
      if (s === 0) {
        rgb = [
          Math.floor(0.75 * 255),
          Math.floor(0.1875 * 255),
          Math.floor(0.75 * 255),
        ];
      } else {
        h = h / 60;
        i = Math.floor(h);
        data = [
          Math.floor(v * (1 - s)),
          Math.floor(v * (1 - s * (h - i))),
          Math.floor(v * (1 - s * (1 - (h - i)))),
        ];
        switch (i) {
          case 0:
            rgb = [vi, data[2], data[0]];
            break;
          case 1:
            rgb = [data[1], vi, data[0]];
            break;
          case 2:
            rgb = [data[0], vi, data[2]];
            break;
          case 3:
            rgb = [data[0], data[1], vi];
            break;
          case 4:
            rgb = [data[2], data[0], vi];
            break;
          default:
            rgb = [vi, data[0], data[1]];
            break;
        }
      }
      rgb[3] = 255;
      return rgb;
    },
    green: function (colorIndex) {
      return [0, Math.floor(colorIndex * 255), 0, 255];
    },
  },
  addPalette: function (paletteName, paletteGenerator) {
    this._paletteGenerators[paletteName] = paletteGenerator;
  },
  getPaletteAsBuffer: function (paletteName, numIndexes) {
    if (!(paletteName in this._paletteGenerators)) {
      return;
    }

    const generator = this._paletteGenerators[paletteName];

    const res = new Array(numIndexes + 1);

    for (let c = 0; c < numIndexes + 1; c++) {
      const color = generator(c / numIndexes);
      res[c] = color[0] + (color[1] << 8) + (color[2] << 16) + (color[3] << 24);
    }

    return new Uint32Array(res).buffer;
  },
  forEach: function (callback) {
    for (const p in this._paletteGenerators) {
      callback(p);
    }
  },
};
