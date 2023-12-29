var palette = null;

//functions return number from 0 to (maxIter-1)
function julia(cx, cy, maxIter, cr, ci) {
  let iter;
  let xn;
  let yn;
  let x = cx;
  let y = cy;
  for (iter = 0; iter < maxIter; iter++) {
    xn = x * x - y * y + cr;
    yn = x * y * 2 + ci;
    if (xn * xn + yn * yn > 4) {
      break;
    }
    x = xn;
    y = yn;
  }

  return iter;
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

    let scale = Math.pow(2, data.z - 1);
    let x0 = data.x / scale - 1;
    let y0 = data.y / scale - 1;
    let d = 1 / (scale << 8);
    let pixels = new Array(65536);
    let MAX_ITER = data.maxIter;
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
