// Paint Line as Grid
export function paint(grid = {}, line = `1px`, colour = `rgba(0, 0, 0, 0.1)`) {
  // inSet Deg
  const deg = { x: `90deg`, y: `180deg` };

  // Set Gradient
  const gradient = {
    x: `linear-gradient(${deg.x}, ${colour} ${line}, transparent, ${line}) 0% 0% / ${grid.x}px ${grid.y}px`,
    y: `linear-gradient(${deg.y}, ${colour} ${line}, transparent ${line}) 0% 0% / ${grid.x}px ${grid.y}px`,
  };

  // Set Background Image
  const image = `linear-gradient(${deg.x}, ${colour} ${line}, transparent ${line}), linear-gradient(${deg.y}, ${colour} ${line}, transparent ${line})`;

  // Set Background Size
  const size = `${grid.x}px ${grid.y}px, ${grid.x}px ${grid.y}px`;

  // Export
  return { image, size };
}

// Get Target
export function target(id) {
  return document.querySelector(`#${id}`);
}

// Check Instance
export function check(target, type = 'Object') {
  return Object.prototype.toString.call(target) === `[object ${type}]`;
}

// Wait
export function wait(time = 0) {
  return new Promise((resolve, reject, outer) => {
    outer = setTimeout(() => {
      resolve();
      clearTimeout(outer);
    }, time);
  });
}

// Extension Object
export function ext() {
  const extension = {};
  let deep = false;
  let i = 0;

  if (check(arguments[0], 'Boolean')) {
    deep = arguments[0];
    i++;
  }

  const merge = function(target) {
    // Loop
    for (let prop in target) {
      // No Property
      if (!target.hasOwnProperty(prop)) {
        continue;
      }

      // Set Value
      const value = target[prop];

      // Extension Value
      extension[prop] = deep && check(value) ? ext(extension[prop], value) : value;
    }
  };

  for (; i < arguments.length; i++) {
    merge(arguments[i]);
  }

  return extension;
}

// Pixel Add
export function px(value) {
  return /^[\d\.]+$/.test(value) ? `${value}px` : value;
}

// Foreach
export function foreach(source, callback) {
  Object.values(source).forEach((item, index) => callback(item, index));
}

// Set Ratio
export function ratio(origin, odds, limit = {}) {
  if (origin < limit.min) {
    origin = limit.min;
  }

  if (origin > limit.max - 1) {
    origin = limit.max - 1;
  }

  return Math.floor(origin / odds).toFixed(4) - 0;
}

// Offset Calcute
export function offset(target, { x, y }, offset = {}) {
  return {
    x: x - (target.offsetLeft + offset.x),
    y: y - (target.offsetTop + offset.y),
  };
}

// Rect to Axes
export function rect2axes(rect) {
  return {
    w: rect.width,
    h: rect.height,
    x: rect.left,
    y: rect.top,
  };
}
