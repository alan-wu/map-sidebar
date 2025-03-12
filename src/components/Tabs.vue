<template>
  <div class="tabs-container">
    <div
      class="tab"
      v-for="tab in tabs"
      :key="tab.id"
      :class="{ 'active-tab': tab.id == activeId }"
      @click="tabClicked(tab)"
    >
      <span class="tab-title">{{ tab.title }} </span>
      <el-icon
        v-if="tab.closable"
        @click="tabClosed(tab)"
        class="tab-close-icon"
      >
        <el-icon-close />
      </el-icon>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import { Close as ElIconClose } from "@element-plus/icons-vue";

export default {
  name: "Tabs",
  props: {
    tabEntries: {
      type: Array,
      default: () => [],
    },
    activeId: {
      type: Number,
      default: 1,
    },
  },
  computed: {
    tabs: function () {
      const permanent = this.tabEntries.filter((t) => !t.closable);
      const temporary = this.tabEntries.filter((t) => t.closable);
      return permanent.concat(temporary);
    },
  },
  methods: {
    tabClicked: function (tab) {
      this.$emit("tabClicked", { id: tab.id, type: tab.type });
    },
    tabClosed: function (tab) {
      this.$emit("tabClosed", tab.id);
    },
  },
};
</script>

<style lang="scss" scoped>
.tabs-container {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
}

.tab {
  height: 30px;
  border: 1px solid var(--el-border-color);
  border-top-color: transparent;
  border-bottom-color: transparent;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.tab:hover,
.active-tab {
  background-color: #f9f2fc;
  border: 1px solid #8300bf;
  color: #8300bf;
  font-weight: 500;
}

.tab-title {
  text-align: center;
  font-size: 14px;
  padding: 0 1rem;
}

.tab-close-icon {
  width: 20px !important;
  height: 20px !important;
  font-size: 20px !important;
  padding-right: 4px !important;
  color: $app-primary-color !important;
}
</style>
