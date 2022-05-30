<style lang="less" scoped>
.motion--observer {
  & {
    overflow: hidden;
  }

  &--title {
    &:before {
      content: '';

      margin-right: 8px;
      padding: 0 2px;
      border-radius: 2px;
      background-color: #00a6c9;

      display: inline;
    }
  }

  &--grouper {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
  }
}
.motion--item {
  flex: 1;
}
</style>

<template>
  <visual-gui-pack id="observer" class="motion--observer" :style="{ ...css }" :namespace="keys">
    <visual-gui-part :title="key" v-for="(collage, key, idx) in group" :key="key">
      <div class="motion--observer--grouper">
        <div class="motion--item" :style="{ flex: `0 0 ${100 / span}%` }" v-for="(item, index) in collage" :key="index" :draggable="!(item.meta || {}).disabled" ref="observer" @dragstart="e => observerDragstart(e, item, index)" @dragend="e => observerDragend(e, item)">
          <slot name="item" :item="item" :index="idx" />
        </div>
      </div>
    </visual-gui-part>
  </visual-gui-pack>
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

    // drage change
    change: {
      type: [Function],
      default() {
        return {}
      }
    }
  },

  computed: {
    keys() {
      return Object.keys(this.group);
    },

    group() {
      // Set Keys
      const keys = {};

      // Get Keys from Source
      this.source.forEach(item => {
        // Get Metas
        const { group } = item.meta;

        // Set Group into Keys
        keys[group] = keys[group] || [];

        // Set Item into Group
        keys[group].push(item);
      });

      // Exports
      return keys;
    },
  },

  methods: {
    observerDragstart(e, item, index) {
      bus.active = item;
      
      this.change(item, index)
    },

    observerDragend(e, item) {
      bus.active = null;

      // Reset Observer
      this.reset();
    },
  },
};
</script>
