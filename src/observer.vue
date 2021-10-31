<style lang="less" scoped>
.motion--observer {
  overflow: hidden;
}
</style>

<template>
  <div id="observer" class="motion--observer">
    <div
      class="motion--item"
      v-for="(item, index) in source"
      :key="index"
      :draggable="!(item.meta || {}).disabled"
      ref="observer"
      @dragstart="e => observerDragstart(e, item, index)"
      @dragend="e => observerDragend(e, item)"
    >
      <slot name="item" :item="item" />
    </div>
  </div>
</template>

<script>
// Use Mixins
import mixins from "./mixins.js";

// Use Preset
import { bus, defaultObserver } from "./preset";

// Component
export default {
  mixins: [mixins],

  props: {
    // Source of Motion
    source: {
      type: [Array],
      default() {
        return [];
      }
    },

    // Observer as Drag
    observer: {
      type: [Object],
      default() {
        return defaultObserver;
      }
    }
  },

  methods: {
    observerDragstart(e, item, index) {
      bus.active = item;
    },

    observerDragend(e, item) {
      bus.active = null;

      // Reset Observer
      this.reset();
    }
  }
};
</script>
