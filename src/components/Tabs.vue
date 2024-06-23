<template>
  <div class="tab-container">
    <div
      class="title"
      v-for="title in tabTitles"
      :key="title.id"
      :class="{ 'active-tab': title.id == activeId }"
    >
      <div
        class="title-text-table"
        v-bind:class="{ highlightText: title.id == activeId }"
        v-on:click="titleClicked(title.id)"
      >
        <div class="title-text">
          {{ title.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */

export default {
  name: 'Tabs',
  props: {
    tabTitles: {
      type: Array,
      default: () => [],
    },
    activeId: {
      type: Number,
      default: 1,
    },
  },
  methods: {
    titleClicked: function (id) {
      this.$emit('titleClicked', id)
    },
  },
}
</script>

<style lang="scss" scoped>
.tab-container {
  height: 28px;
  padding-bottom: 1px;
  border-bottom: 1px solid $app-primary-color;
}

.title {
  height: 28px;
  border: 1px solid var(--el-border-color);
  border-bottom-color: $app-primary-color;
  background-color: white;
  display: inline-block;
}

.title:hover {
  cursor: pointer;
}

.title-text {
  text-align: center;
  display: table-cell;
  vertical-align: middle;
  font-size: 14px;
  padding: 0 1rem;
}

.title-text-table {
  display: table;
  height: 100%;
  width: 100%;
}

.parent-dialog:hover .title-text {
  color: $app-primary-color;
}

.active-tab {
  border-color: $app-primary-color;
  border-bottom-color: #292b66;
}

.highlightText {
  color: $app-primary-color;
}
</style>
