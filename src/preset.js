// Default Options
export const defaultObserver = {
  target: ".motion--subscribe"
};

// Subscribe Setting
export const defaultSetting = {
  // Axis Directive
  axis: "both", // x or y

  // Grid Axis Pixel
  grid: {
    x: 1,
    y: 1
  },

  parent: {
    width: 414,
    height: 736
  },

  // Grid Mode
  snapToGrid: true,

  // Parent Limit
  parentLim: false, // true,
  // Aspect Ratio
  aspectRatio: false,

  // Is Draggable
  draggable: true,
  // Is Resizable
  resizable: true
};

// Subscribe Options
export const defaultSubscribe = {
  // Axes
  axes: {
    w: 100,
    h: 100,
    x: 0,
    y: 0
  },

  // Limit
  limit: {
    minw: 0,
    minh: 0
  },

  // Active
  active: false
};

// Set Bus
const BUS = window; // window.Vue || window.App || window;

// Preset Active
BUS.active = BUS.active || null;

// Preset Sticky
BUS.sticky = BUS.sticky || false;

// Export
export const bus = BUS;
