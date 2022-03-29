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

.vdrAnchor {
  :deep(.vdr-stick) {
    opacity: 0.375;
    pointer-events: none;
  }
}

.vdr-stick {
    background: #fff;
    border: 1px solid #6c6c6c;
    -webkit-box-shadow: 0 0 2px #bbb;
    box-shadow: 0 0 2px #bbb;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    font-size: 1px;
    position: absolute
}

.inactive .vdr-stick {
    display: none
}

.vdr-stick-br,.vdr-stick-tl {
    cursor: nwse-resize
}

.vdr-stick-bm,.vdr-stick-tm {
    cursor: ns-resize;
    left: 50%
}

.vdr-stick-bl,.vdr-stick-tr {
    cursor: nesw-resize
}

.vdr-stick-ml,.vdr-stick-mr {
    cursor: ew-resize;
    top: 50%
}

.vdr-stick.not-resizable {
    display: none
}

.resizable {
  top: 0;
  left: 0
}

</style>

<style>
.vdr-stick {
    background: #fff;
    border: 1px solid #6c6c6c;
    -webkit-box-shadow: 0 0 2px #bbb;
    box-shadow: 0 0 2px #bbb;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    font-size: 1px;
    position: absolute
}

.inactive .vdr-stick {
    display: none
}

.vdr-stick-br,.vdr-stick-tl {
    cursor: nwse-resize
}

.vdr-stick-bm,.vdr-stick-tm {
    cursor: ns-resize;
}

.vdr-stick-bl,.vdr-stick-tr {
    cursor: nesw-resize
}

.vdr-stick-ml,.vdr-stick-mr {
    cursor: ew-resize;
    top: 50%
}

.vdr-stick.not-resizable {
    display: none
}
</style>

<template>
  <div id="subscribe" class="motion--subscribe" @drop="subscribeDrop" @dragover="observerDragover" @dragleave="subscribeLeave">
    <vue-draggable-resizable
      :style="selectStyle(rect.isSelected)"
      v-for="(rect, index) in subscribeSource"
      classNameHandle="vdr-stick"
      :class="{ vdrSmooth: settings.smooth, vdrAnchor: !settings.anchor }"
      :key="rect.id"
      :w="rect.axes.w"
      :h="rect.axes.h"
      :x="rect.axes.x"
      :y="rect.axes.y"
      :minHeight="rect.axes.minH" 
      :minWidth="rect.axes.minW"
      :grid="[settings.grid.x, settings.grid.y]"
      :z-index="rect.zIndex"
      :axis="settings.axis"
      :active="settings.active && rect.active"
      :draggable="settings.draggable"
      :resizable="settings.resizable"
      :lockAspectRatio="rect.axes.sync" 
      :parent="settings.parentLim" 
      :snap="true"
      :snapTolerance="10"
      @dragstop="(left, top) => dragstop(index, left, top)"
      @dragging="(left, top) => onDraggable(rect.id, left, top)" 
      @resizing="(x, y, width, height) => onResizable(index, x, y, width, height)"
      @activated="onFocusIn(index)" 
      @deactivated="onFocusOut(index)"
      @click="onClicked($event, rect, index)"
    >
      <slot name="item" :item="rect" />
    </vue-draggable-resizable>

     <!--辅助线-->
      <span class="ref-line v-line"
            v-for="item in vLine"
            :key="item"
            v-show="item.display"
            :style="{ left: item.position, top: item.origin, height: item.lineLength}"
      />
      <span class="ref-line h-line"
            v-for="item in hLine"
            :key="item"
            v-show="item.display"
            :style="{ top: item.position, left: item.origin, width: item.lineLength}"
       />
      <!--辅助线END-->
      
      <!-- grid -->
      <div class="motion--light" :style="lightStyle" />
      <div class="motion--grid" :style="gridStyle" />
  </div>
</template>

<script>
// Motion base on VueDragResize
import vueDraggableResizable from './components/vue-draggable-resizable.vue';
import './components/vue-draggable-resizable.css';

// Use Closest Find
import closest from 'closest-find';

// Use Mixins
import mixins from './mixins.js';

// Use Kits
import { paint, target, px, offset, ratio, ext, rect2axes, wait } from './kit';

// Use Preset
import { bus, defaultSetting, defaultSubscribe } from './preset';

import _ from 'lodash';

// component status
// active 拖拽激活事件
// isSelected 多选选中状态

// Component
export default {
  mixins: [mixins],

  components: {
    vueDraggableResizable,
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

    // Unit as One
    unit: {
      type: [Object],
      default() {
        return {
          x: 1,
          y: 1,
        };
      },
    },

    // Space of Vertax -- Hard Code
    space: {
      type: [Number, String],
      default() {
        return 0;
      },
    },
  },
  
  data() {
    return {
      draggingId: null,
      prevOffsetX: 0,
      prevOffsetY: 0,
      vLine: [],
      hLine: [],
      //frame selection
      selectedItemNum: 0,
      // startX: 0, //X of the mouse (begin to move)
      // startY: 0,
      // initX: 0, //X of the mouse (moving)
      // initY: 0,
      // scrollX: 0,
      // scrollY: 0,
      // rectX: 0, //X of the rectangle selection
      // rectY: 0,
      // rectWidth: 0, //width of the rectangle selection
      // rectHeight: 0,
      // rectShow: false, //weather to show the rectangle selection

      sync: false,
      clipboard: null
    }
  },

  computed: {
    settings() {
      return Object.assign(defaultSetting, this.subscribe);
    },

    subscribeSource() {
      return this.source.map(rect => ext(defaultSubscribe, rect));
    },

    // ! 此属性引发警告 ⚠️
    // grid() {
    //   return this.settings.grid;
    // },

    gridStyle() {
      // Set Image & Size as Grid
      const { image, size } = paint(this.settings.grid);

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

    draggingElement() {
      if (!this.draggingId) return;
      return this.source.find((el) => el.id === this.draggingId);
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
        let { x, y } = offset(element, { x: e.clientX, y: e.clientY }, this.offset);

        // Get Space
        let { w, h } = bus.active.axes || this.settings.grid;

        // Set VertexSpace
        const vertexSpace = this.space * this.unit.y;

        // Reset Y
        y = y - vertexSpace;

        // Set Coordinate
        this.doset({
          x: ratio(x, this.unit.x, { min: 0, max: element.offsetWidth }) * this.unit.x,
          y: ratio(y, this.unit.y, { min: 0, max: element.offsetHeight }) * this.unit.y,
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
      
      if (this.sync) {
        this.source[index].isSelected = true;
        this.selectedItemNum++;
      }
      
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

    onDraggable( id, left, top) {

      this.draggingId = id;

      const offsetX = left - this.draggingElement.axes.x;
      const offsetY = top - this.draggingElement.axes.y;

      const deltaX = this.deltaX(offsetX);
      const deltaY = this.deltaY(offsetY);

       // 如果拖动对象没有被选中，则清除其他组件选中状态
      if(!this.sync && !this.draggingElement.isSelected){
        this.source.map((el) => { el.isSelected = false; });
        this.selectedItemNum=0;
        return;
      };

      this.source.map((el) => {
        if (el.id !== id && el.isSelected === true) {
          el.axes.x += deltaX;
          el.axes.y += deltaY;
        }
        return el;
      });
     //  Object.assign(this.source[index].axes, rect2axes(rect));
    },

    dragstop(index, left, top) {      
      this.draggingId = null;
      this.prevOffsetX = 0;
      this.prevOffsetY = 0;

      this.source[index].axes.x = left;
      this.source[index].axes.y = top;
    },

    deltaX(offsetX) {
      const ret = offsetX - this.prevOffsetX;

      this.prevOffsetX = offsetX;

      return ret;
    },

    deltaY(offsetY) {
      const ret = offsetY - this.prevOffsetY;
      this.prevOffsetY = offsetY;
      return ret;
    },

    onResizable(index, x, y, w, h) {
      Object.assign(this.source[index].axes, {x, y, w, h});
    },

    onSticky(e) {
      // Set Strike
      bus.sticky = true;

      // Set Sticky
      this.sticky = !!closest(e.target, '.vdr, .panel', true);

      // Clean
      if (!this.sticky) {
        this.clean(this.source);
      }
    },

    selectStyle(isSelected) {
      return isSelected ? 'border:1px solid blue !important' : '';
    },

    // 如果点击事件在选中组件内部，则是拖动，不然就清除选中状态
    mouseDown(e) {
      
      // 多选不触发
      if(this.sync) return;

      // 判断点击事件是否在组件内
      const sticky = !!closest(e.target, '.vdr', true);
    
      if(sticky) {
        // if sync is true and draggingElement is not null
        if(!this.sync && this.draggingElement && !this.draggingElement.isSelected){
          this.source.map((el) => { el.isSelected = false; });
          this.selectedItemNum=0;
        };
        return
      };

      //clear all selected elements
      if (this.selectedItemNum > 0) {
        this.source.map((el) => { el.isSelected = false; });
        this.selectedItemNum=0;
        return;
      }

      this.clean(this.source);

      this.draggingId = null;
      this.prevOffsetX = 0;
      this.prevOffsetY = 0;
    },

    copy() {
      this.clipboard = [];

      // foreach source
      this.subscribeSource.forEach(element => {
        // copey select or active component
        if(element.active || element.isSelected) {
          // reset component
          const arr = _.cloneDeep(element);
          arr.active = false;
          arr.isSelected = false;
          arr.axes.x = 0;
          arr.axes.y = 0;

          // add clipboard
          this.clipboard.push(arr);
        }
      });
    },

    // 粘贴
    plaster() {
      if(!(this.clipboard && this.clipboard.length)) return;
      
      // clone
      const target = _.cloneDeep(this.clipboard);

      // get new id
      target.map(e => e.id = new Date().getTime())

      // push
      this.source.push(...target);
    },

     // 辅助线回调事件
    getRefLineParams (params) {
      const { vLine, hLine } = params;
      this.vLine = vLine
      this.hLine = hLine
    }
  },

  beforeDestroy() {
    document.removeEventListener('mousedown', this.mouseDown)
  },

  mounted() {
    if (!bus.sticky) {
      document.addEventListener('mousedown', e => this.onSticky(e));
    }

    const isMac = /macintosh|mac os x/i.test(navigator.userAgent);;

    document.addEventListener('mousedown', this.mouseDown)

    document.addEventListener('keydown', (e) => {
      // ~metaKey mac command  ~ctrlKey windows ctrl
      const {metaKey, ctrlKey, keyCode} = e;
      
      if (isMac && metaKey || ctrlKey) {
        this.sync = true;
      }
      
      // copy event
      if((metaKey || ctrlKey) && keyCode === 67) {
        this.copy();
      }

      // plaster event
      if((metaKey || ctrlKey) && keyCode === 86) {
        this.plaster();
      }

    });

    window.addEventListener('keyup', (e) => {
      this.sync = false;
    });
  },
};
</script>
