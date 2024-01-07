let palette = null;

importScripts("http://unpkg.com/complex.js@2.1.1")

//functions return number from 0 to (maxIter-1)
function julia(cx, cy, maxIter, cr, ci) {
  let z = new Complex(cx, cy);

  for (let iter = 0; iter < maxIter; iter++) {
    let newZ = z.pow(2, 0).add(cr, ci)

    if (newZ.abs() > 2) {
      return iter;
    }

    z = newZ;
  }

  return maxIter;
}

const commands = {
  palette: function (data, cb) {
    palette = new Uint32Array(data.palette);
  },
  render: function (data, cb) {
    if (!palette) {
      cb();
      return;
    }

    const scale = Math.pow(2, data.z - 1);
    const x0 = data.x / scale - 1;
    const y0 = data.y / scale - 1;
    const d = 1 / (scale << 8);
    const pixels = new Array(65536);
    const MAX_ITER = data.maxIter;
    let cx;
    let cy;
    let iter;
    let i = 0;
    let px;
    let py;

    while (i < 65536) {
      px = i % 256;
      py = (i - px) >> 8;
      cx = x0 + px * d;
      cy = y0 + py * d;
      iter = julia(cx, cy, MAX_ITER, data.cr, data.ci);
      pixels[i++] = palette[iter];
    }
    const array = new Uint32Array(pixels);
    data.pixels = array.buffer;
    cb(data, [data.pixels]);
  },
};

function callBack(a, b) {
  self.postMessage(a, b);
}

self.onmessage = function (e) {
  const commandName = e.data.command;

  if (commandName in commands) {
    commands[commandName](e.data, callBack);
  }
};
