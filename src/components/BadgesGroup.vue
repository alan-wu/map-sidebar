<template>
  <div v-if="categories['All'].size > 1" class="container"  ref="container">
    <template v-for="(item, key) in categories" >
        <el-badge v-if="item.size > 0" :value="item.size" class="badge-item" :key="key">
          <el-button
            :class="[{ 'active': key == active},'badges-button']"
            @click="categoryClicked(key)"
            size="small">{{ key }}
          </el-button>
        </el-badge>
    </template>
  </div>
</template>


<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import { Badge, Button } from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";

locale.use(lang);
Vue.use(Badge);
Vue.use(Button);

export default {
  name: "BadgesGroup",
  props: {
    /**
     * Object containing information for
     * the required viewing.
     */
    additionalLinks: {
      type: Array,
      default: () => {
        return [];
      },
    },
    datasetBiolucida: {
      type: Object,
      default: () => {
        return {};
      },
    },
    entry:  {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data: function () {
    return {
      categories: { "All": {size: 1} },
      active: "All"
    };
  },
  methods: {
    addToCategories: function (array, name) {
      if (array && array.length > 0) {
        this.categories[name] = { size: array.length };
        this.categories["All"].size += array.length;
      }
    },
    addSimulationsToCategories: function (array) {
      if (array) {
        let size = 0;

        array.forEach(item => {
          if (item.description == "SED-ML file" || item.description == "CellML file") {
            size = 1;
          }
        });
        if (size > 0) {
          this.categories["Simulations"] = { size };
          this.categories["All"].size += size;
        }
      }
    },
    categoryClicked: function(name) {
      this.active = name;
      this.$emit("categoryChanged", name);
    }
  },
  watch: {
    datasetBiolucida: {
      deep: true,
      immediate: true,
      handler: function (biolucidaData) {
        if ("dataset_images" in biolucidaData) {
          this.addToCategories(biolucidaData["dataset_images"], "Biolucida Images");
        }
      }
    },
    entry: {
      deep: true,
      immediate: true,
      handler: function () {
        this.addToCategories(this.entry.scaffolds, 'Scaffolds');
        this.addToCategories(this.entry.segmentation, 'Segmentations');
        this.addSimulationsToCategories(this.additionalLinks);
        /** disable the following
        this.addToCategories(this.entry.images, 'Images');
        this.addToCategories(this.entry.videos, 'Videos');
        **/
      }
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.badges-button,
.badges-button:hover,
.badges-button:focus
{
  border-radius: 3px;
  font-size: 0.75rem;
  padding: 0.2rem 0.2rem;
  background: #f9f2fc;
  border: 1px solid #8300BF;
  color: #8300BF;
}

.badges-button.active
{
  background: #8300BF;
  border: 1px solid #8300BF;
  color: #fff;
}

.badge-item {
  margin-top: 0.5rem;
  margin-right: 1rem;
}

.badge-item >>> .el-badge__content {
  background: #8300BF;
}

</style>
