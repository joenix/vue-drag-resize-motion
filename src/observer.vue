<style lang="less" scoped>
.motion--observer {
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}
.motion--item {
  flex: 1;
}
</style>

<template>
  <div id="observer" class="motion--observer" :style="{ ...css }">
    <div class="motion--item" :style="{ flex: `0 0 ${100 / span}%` }" v-for="(item, index) in source" :key="index" :draggable="!(item.meta || {}).disabled" ref="observer" @dragstart="e => observerDragstart(e, item, index)" @dragend="e => observerDragend(e, item)">
      <slot name="item" :item="item" />
    </div>
  </div>
</template>

<script>
// Use Mixins
import mixins from './mixins.js';

// Use Preset
import { bus, defaultObserver } from './preset';

// Component
export default {
  mixins: [mixins],

  props: {
    // Source of Motion
    source: {
      type: [Array],
      default() {
        return [];
      },
    },

    // Observer as Drag
    observer: {
      type: [Object],
      default() {
        return defaultObserver;
      },
    },

    // Span as Flex
    span: {
      type: [Number],
      default() {
        return 1;
      },
    },

    // Css
    css: {
      type: [Object],
      default() {
        return {};
      },
    },
  },

  methods: {
    observerDragstart(e, item, index) {
      bus.active = item;
    },

    observerDragend(e, item) {
      bus.active = null;

      // Reset Observer
      this.reset();
    },
  },
};
</script>
