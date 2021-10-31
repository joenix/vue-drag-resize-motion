// Use Closest Find
import closest from "closest-find";

// Use Kits
import { foreach } from "./kit";

// Set Mixins
const mixins = {
  data() {
    return {
      reduction: {
        x: `-100%`,
        y: `-100%`,
        w: 0,
        h: 0,
        sync: false
      },

      coordinate: {
        x: `-100%`,
        y: `-100%`,
        w: 0,
        h: 0,
        sync: false
      },

      sticky: false
    };
  },

  methods: {
    reset() {
      this.doset(this.reduction);
    },

    doset({ x, y, w, h, sync }) {
      this.coordinate.x = x;
      this.coordinate.y = y;
      this.coordinate.w = w;
      this.coordinate.h = h;
      this.coordinate.sync = sync || false;
    },

    clean(source = [], active = -1, reverse = false) {
      foreach(source, (item, index) => {
        if (reverse) {
          if (index === active) {
            item.active = false;
          }
          return;
        }

        item.active = index === active ? true : false;
      });
    },

    crack(element, { x, y, w, h } = {}) {
      // Merge Coordinate
      element.axes.x = x;
      element.axes.y = y;
      element.axes.w = w;
      element.axes.h = h;

      // Set Component
      const component = _.cloneDeep(element);

      // Create ID of Runtime
      component.id = new Date().getTime() + "";

      // Active for UE
      component.active = false;

      // Useage
      return component;
    }
  }
};

export default mixins;
