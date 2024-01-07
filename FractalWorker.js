let palette = null;

//functions return number from 0 to (maxIter-1)
function julia(cx, cy, maxIter, cr, ci) {
  let iter, xn, yn;

  for (iter = 0; iter < maxIter; iter++) {
    xn = cx * cx - cy * cy + cr;
    yn = cx * cy * 2 + ci;

    if (xn * xn + yn * yn > 4) {
      break;
    }
    cx = xn;
    cy = yn;
  }

  return iter;
}

const commands = {
  palette: function (data, _) {
    palette = new Uint32Array(data.palette);
  },
  render: function (data, callback) {
    const scale = Math.pow(2, data.z - 1);
    const x0 = data.x / scale - 1;
    const y0 = data.y / scale - 1;
    const d = 1 / (scale << 8);
    const pixels = new Array(65536);
    const MAX_ITER = data.maxIter;

    let cx, cy, px, py, iter;
    let i = 0;

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
    callback(data, [data.pixels]);
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
