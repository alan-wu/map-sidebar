<template>
  <div v-if="visible" class="container" ref="container">
    <div v-if="displayText">View data types:</div>
    <template v-for="(item, key) in categories">
      <el-button
        v-if="item.size > 0"
        :class="[{ active: key == active }, 'tag-button']"
        @click="categoryClicked(key)"
        size="small"
        :key="key"
        >{{ key + ' (' + item.size + ')' }}
      </el-button>
    </template>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import { ElButton as Button } from 'element-plus'

export default {
  name: 'BadgesGroup',
  components: { Button },
  props: {
    /**
     * Object containing information for
     * the required viewing.
     */
    additionalLinks: {
      type: Array,
      default: () => {
        return []
      },
    },
    displayDataset: {
      type: Boolean,
      default: true,
    },
    displayText: {
      type: Boolean,
      default: true,
    },
    items: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data: function () {
    return {
      //Always start with 1 image - the dataset thumbnail itself
      categories: { },
      active: 'All',
      totalSize: 0,
    }
  },
  computed: {
    // This computed property populates filter data's entry object with $data from this sidebar
    visible: function () {
      return (this.displayDataset && this.totalSize > 1) ||
        (!this.displayDataset && this.totalSize > 0)
    }
  },
  methods: {
    addToCategories: function (name) {
      const array = this.items[name]
      if (array && array.length > 0) {
        this.categories[name] = { size: array.length }
        this.totalSize += array.length
      }
    },
    categoryClicked: function (name) {
      this.active = name
      this.$emit('categoryChanged', name)
    },
  },
  watch: {
    items: {
      deep: true,
      immediate: true,
      handler: function () {
        this.categories = {}
        this.totalSize = 0
        let keys = ['Flatmaps', 'Plots', 'Protocol Data', 'Scaffolds', 'Simulations']
        keys.forEach(key => this.addToCategories(key))
        if (this.displayDataset) {
          this.totalSize += 1
          this.categories.All = { size: this.totalSize }
          this.categories.Dataset = { size: 1 }
        } else {
          const keys = Object.keys(this.categories)
          if (keys.length > 1) {
            this.categories.All = { size: this.totalSize }
          } else if (keys.length === 1) {
            this.categoryClicked(keys[0])
          }
        }
        this.categories = Object.keys(this.categories).sort().reduce(
          (obj, key) => {
            obj[key] = this.categories[key];
            return obj;
          },
          {}
        );
        /** disable the following
        this.addToCategories(this.entry.images, 'Images');
        this.addToCategories(this.entry.videos, 'Videos');
        **/
      },
    },
  },
}
</script>

<style lang="scss" scoped>
.container {
  .tag-button.el-button {
    border-radius: 4px!important;
    font-size: 0.75rem!important;
    padding: 0.2rem 0.2rem!important;
    margin: 0.5rem 0 0 0!important;
    margin-right: 0.75rem !important;
    background: #f9f2fc!important;
    border: 1px solid $app-primary-color!important;
    color: $app-primary-color!important;
    &.active {
      background: $app-primary-color!important;
      border: 1px solid $app-primary-color!important;
      color: #fff!important;
    }
  }

  .tag-button + .tag-button {
    margin-left: 0!important;
  }
}
</style>
