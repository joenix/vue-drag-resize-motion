<style lang="less" scoped>
.motion--subscribe {
  overflow: hidden;
  position: relative;
}

.motion--grid {
  width: 100%;
  height: 100%;
}

.motion--light {
  transition: all 0.1s;
  top: 0;
  left: 0;
  position: absolute;
  pointer-events: none;
  border: #1890ff;
  background-color: rgba(#1890ff, 25%);
}

.vdrSmooth {
  &,
  & > .content-container {
    transition: all 0.1s;
  }
}
</style>

<template>
  <div id="subscribe" class="motion--subscribe" @drop="subscribeDrop" @dragover="observerDragover" @dragleave="subscribeLeave">
    <div class="motion--light" :style="lightStyle" />
    <div class="motion--grid" :style="gridStyle" />

    <vue-drag-resize
      v-for="(rect, index) in subscribeSource"
      :class="{ vdrSmooth: settings.smooth }"
      :key="rect.id"
      :w="rect.axes.w"
      :h="rect.axes.h"
      :x="rect.axes.x"
      :y="rect.axes.y"
      :z="rect.zIndex"
      :isActive="settings.active && rect.active"
      :minw="rect.limit.minw"
      :minh="rect.limit.minh"
      :contentClass="rect.class"
      :axis="settings.axis"
      :gridX="settings.grid.x"
      :gridY="settings.grid.y"
      :snapToGrid="settings.snapToGrid"
      :parentLimitation="settings.parentLim"
      :aspectRatio="rect.axes.sync"
      :sticks="rect.sticks"
      :isDraggable="settings.draggable"
      :isResizable="settings.resizable"
      v-on:activated="onFocusIn(index)"
      v-on:deactivated="onFocusOut(index)"
      v-on:dragging="onDraggable($event, index)"
      v-on:resizing="onResizable($event, index)"
      v-on:clicked="onClicked($event, rect, index)"
    >
      <slot name="item" :item="rect" />
    </vue-drag-resize>
  </div>
</template>

<script>
// Motion base on VueDragResize
import VueDragResize from 'vue-drag-resize/src';

// Use Closest Find
import closest from 'closest-find';

// Use Mixins
import mixins from './mixins.js';

// Use Kits
import { paint, target, px, offset, ratio, ext, rect2axes, wait } from './kit';

// Use Preset
import { bus, defaultSetting, defaultSubscribe } from './preset';

// Component
export default {
  mixins: [mixins],

  components: {
    VueDragResize,
  },

  props: {
    // Source of Motion
    source: {
      type: [Array],
      default() {
        return [];
      },
    },

    // Subscribe as Drop
    subscribe: {
      type: [Object],
      default() {
        return defaultSetting;
      },
    },

    // Clone Handler
    clone: {
      type: [Function, Object],
      default() {
        return null;
      },
    },

    // Offset for Light
    offset: {
      type: [Object],
      default() {
        return {
          x: 0,
          y: 0,
        };
      },
    },
  },

  computed: {
    settings() {
      return Object.assign(defaultSetting, this.subscribe);
    },

    subscribeSource() {
      return this.source.map(rect => ext(defaultSubscribe, rect));
    },

    grid() {
      return this.settings.grid;
    },

    gridStyle() {
      // Set Image & Size as Grid
      const { image, size } = paint(this.grid);

      // for Usage
      return {
        backgroundImage: this.settings.snapToGrid ? image : 'none',
        backgroundSize: size,
      };
    },

    lightStyle() {
      return {
        width: px(this.coordinate.w),
        height: px(this.coordinate.h),
        transform: `translate(${px(this.coordinate.x)}, ${px(this.coordinate.y)})`,
        transition: this.settings.smooth ? `all 0.12s` : 'none',
      };
    },
  },

  methods: {
    observerDragover(e) {
      // Stop Event Bubbling Up
      e.preventDefault();

      if (bus.active) {
        // Get Element
        const element = closest(e.target, '.motion--subscribe', true);

        // Has Element
        if (!element) {
          return this.reset();
        }

        // Get Coordinate
        const { x, y } = offset(element, { x: e.clientX, y: e.clientY }, this.offset);

        // Get Space
        const { w, h } = bus.active.axes || this.grid;

        // Set Coordinate
        this.doset({
          x: ratio(x, this.grid.x, { min: 0, max: element.offsetWidth }) * this.grid.x,
          y: ratio(y, this.grid.y, { min: 0, max: element.offsetHeight }) * this.grid.y,
          w,
          h,
        });
      }
    },

    subscribeLeave(e) {
      // Stop Event Bubbling Up
      e.preventDefault();

      // Reset Observer
      this.reset();
    },

    subscribeDrop(e) {
      // Stop Event Bubbling Up
      e.preventDefault();

      // Emit Event
      if (bus.active) {
        // Cloner
        if (this.clone) {
          const cloner = this.clone(bus.active, { ...this.coordinate });

          // Set Active as Cloner
          if (cloner) {
            bus.active = cloner;
          }

          // Insert
          this.source.push(cloner);
        }

        // As Dropable
        this.$emit('dropable', bus.active, { ...this.coordinate });
      }

      // Reset Observer
      this.reset();
    },

    onClicked(event, rect, index) {
      this.clean(this.source, index);
      this.$emit('clicked', event, rect, index);
    },

    onFocusIn(index) {
      this.$emit('focusIn', this.source[index]);
    },

    onFocusOut(index) {
      wait(0).then(() => {
        if (this.sticky) {
          return;
        }
        this.clean(this.source, index, true);
      });

      this.$emit('focusOut', this.source[index]);
    },

    onDraggable(rect, index) {
      Object.assign(this.source[index].axes, rect2axes(rect));
    },
    onResizable(rect, index) {
      Object.assign(this.source[index].axes, rect2axes(rect));
    },

    onSticky(e) {
      // Set Strike
      bus.sticky = true;

      // Set Sticky
      this.sticky = !!closest(e.target, '.vdr, .panel', true);

      // Clean
      if (!this.sticky) {
        this.clean();
      }
    },
  },

  mounted() {
    if (!bus.sticky) {
      document.addEventListener('mousedown', e => this.onSticky(e));
    }
  },
};
</script>
