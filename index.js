// Use Component
import VueDragResizeMotionObserver from "./src/observer.vue";
import VueDragResizeMotionSubscribe from "./src/subscribe.vue";

// Set Install for `app.use`
function install(app) {
  // If is Installed
  if (install.installed) {
    return;
  }

  // is Install
  install.installed = true;

  // Register Component name `VueDragResizeMotionObserver`
  app.component("VueDragResizeMotionObserver", VueDragResizeMotionObserver);

  // Register Component name `VueDragResizeMotionSubscribe`
  app.component("VueDragResizeMotionSubscribe", VueDragResizeMotionSubscribe);
}

// Export as Plugin
export const motionPlugin = { install };

/**
 * Register Component in Vue2 for Async
 * ========== ========== ==========
 */

// Set Global
let Global = null;

// in Window
if (typeof window !== "undefined") {
  Global = window;
}

// in Global
if (typeof global !== "undefined") {
  Global = global;
}

// Set GlobalVue
let GlobalVue = Global.App || Global.Vue;

// do Register
if (GlobalVue && GlobalVue.use) {
  // Register Plugin
  GlobalVue.use(plugin);
}

// Export Component
export default {
  VueDragResizeMotionObserver,
  VueDragResizeMotionSubscribe
};
