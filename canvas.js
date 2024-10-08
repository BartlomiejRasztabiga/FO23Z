L.TileLayer.FractalLayer = L.TileLayer.Canvas.extend({
  options: {
    async: true,
    maxZoom: 23,
    continuousWorld: true,
  },
  initialize: function (colorController, numWorkers) {
    this.numWorkers = numWorkers;
    this._workers = [];
    this._colorController = colorController;

    this.messages = {};
    this.queue = {total: numWorkers};
    this.cr = 0;
    this.ci = 0;
    this.maxIter = 500;
    this._paletteName = null;
    this._paletteSent = false;
  },
  onAdd: function (map) {
    const _this = this;
    let i = 0;
    let next;
    this.queue.free = [];
    this.queue.len = 0;
    this.queue.tiles = [];
    this._workers = new Array(this.numWorkers);

    while (i < this.numWorkers) {
      this.queue.free.push(i);
      this._workers[i] = new Worker("worker.js");

      this._workers[i].onmessage = function (e) {
        if (!e.data) {
          return;
        }

        let canvas;
        if (_this.queue.len) {
          _this.queue.len--;
          next = _this.queue.tiles.shift();
          _this._renderTile(next[0], next[1], e.data.workerID);
        } else {
          _this.queue.free.push(e.data.workerID);
        }
        if (e.data.tileID in _this.messages) {
          canvas = _this.messages[e.data.tileID];
        } else {
          return;
        }

        const array = new Uint8Array(e.data.pixels);
        const ctx = canvas.getContext("2d", {willReadFrequently: true});
        const imagedata = ctx.getImageData(0, 0, 256, 256);
        imagedata.data.set(array);
        ctx.putImageData(imagedata, 0, 0);
        _this.tileDrawn(canvas);
      };
      i++;
    }

    this._sendPalette();

    this.on("tileunload", function (e) {
      if (e.tile._tileIndex) {
        const pos = e.tile._tileIndex;
        const tileID = [pos.x, pos.y, pos.z].join(":");
        if (tileID in _this.messages) {
          delete _this.messages[tileID];
        }
      }
    });

    map.on(
        "zoomstart",
        function () {
          this.queue.len = 0;
          this.queue.tiles = [];
        },
        this,
    );

    return L.TileLayer.Canvas.prototype.onAdd.call(this, map);
  },
  onRemove: function (map) {
    this.messages = {};
    this._workers.forEach((worker) => {
      worker.terminate();
    });
    this._workers = [];
    this._paletteSent = false;
    return L.TileLayer.Canvas.prototype.onRemove.call(this, map);
  },

  drawTile: function (canvas, tilePoint) {
    if (!this._paletteName) {
      this.tileDrawn(canvas);
      return;
    }

    if (!this.queue.free.length) {
      this.queue.tiles.push([canvas, tilePoint]);
      this.queue.len++;
    } else {
      this._renderTile(canvas, tilePoint, this.queue.free.pop());
    }
  },
  setPalette: function (paletteName) {
    this._paletteName = paletteName;

    this._paletteSent = false;
    this._sendPalette();

    this.queue.len = 0;
    this.queue.tiles = [];
    if (this._map) {
      this.redraw();
    }
  },

  setMaxIter: function (maxIter) {
    this.maxIter = maxIter;

    this.queue.len = 0;
    this.queue.tiles = [];
    if (this._map) {
      this.redraw();
    }
  },

  setCr: function (cr) {
    this.cr = cr;

    this.queue.len = 0;
    this.queue.tiles = [];
    if (this._map) {
      this.redraw();
    }
  },

  setCi: function (ci) {
    this.ci = ci;

    this.queue.len = 0;
    this.queue.tiles = [];
    if (this._map) {
      this.redraw();
    }
  },

  setCrCi: function (cr, ci) {
    this.cr = cr;
    this.ci = ci;

    this.queue.len = 0;
    this.queue.tiles = [];
    if (this._map) {
      this.redraw();
    }
  },

  _sendPalette: function () {
    if (this._paletteSent || !this._workers.length || !this._paletteName) {
      return;
    }

    const palette = this._colorController.getPaletteAsBuffer(
        this._paletteName,
        this.maxIter,
    );
    this._workers.forEach((worker) => {
      const paletteClone = palette.slice(0);
      worker.postMessage(
          {
            command: "palette",
            palette: paletteClone,
          },
          [paletteClone],
      );
    });

    this._paletteSent = true;
  },

  _renderTile: function (canvas, tilePoint, workerID) {
    const z = this._map.getZoom();
    canvas._tileIndex = {x: tilePoint.x, y: tilePoint.y, z: z};
    const tileID = tilePoint.x + ":" + tilePoint.y + ":" + z;
    this.messages[tileID] = canvas;
    this._workers[workerID].postMessage({
      command: "render",
      x: tilePoint.x,
      y: tilePoint.y,
      z: z,
      tileID: tileID,
      workerID: workerID,
      cr: this.cr,
      ci: this.ci,
      maxIter: this.maxIter,
    });
  },
});
