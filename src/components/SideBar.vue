<template>
  <div ref="container">
    <div v-if="!drawerOpen" @click="toggleDrawer" class="open-tab">
      <el-icon><el-icon-arrow-left /></el-icon>
    </div>
    <el-drawer
      class="side-bar my-drawer"
      v-model="drawerOpen"
      :teleported="false"
      :modal-append-to-body="false"
      size="550"
      :with-header="false"
      :wrapperClosable="false"
      :modal="false"
    >
      <div class="box-card">
        <div v-if="drawerOpen" @click="close" class="close-tab">
          <el-icon><el-icon-arrow-right /></el-icon>
        </div>
        <div class="sidebar-container">
          <tabs
            v-if="tabs.length > 1"
            :tabTitles="tabs"
            :activeId="activeId"
            @titleClicked="tabClicked"
          />
          <template v-for="tab in tabs" key="tab.id">
            <sidebar-content
              class="sidebar-content-container"
              v-show="tab.id === activeId"
              :contextCardEntry="tab.contextCard"
              :envVars="envVars"
              :ref="tab.id"
              @search-changed="searchChanged(tab.id, $event)"
            />
          </template>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import {
  ArrowLeft as ElIconArrowLeft,
  ArrowRight as ElIconArrowRight,
} from '@element-plus/icons-vue'
/* eslint-disable no-alert, no-console */
import { ElDrawer as Drawer, ElIcon as Icon } from 'element-plus'
import SidebarContent from './SidebarContent.vue'
import EventBus from './EventBus.js'
import Tabs from './Tabs.vue'

export default {
  components: {
    SidebarContent,
    Tabs,
    ElIconArrowLeft,
    ElIconArrowRight,
    Drawer,
    Icon
  },
  name: 'SideBar',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    envVars: {
      type: Object,
      default: () => {},
    },
    tabs: {
      type: Array,
      default: () => [{ title: 'flatmap', id: 1 }],
    },
    activeId: {
      type: Number,
      default: 1,
    },
    openAtStart: {
      type: Boolean,
      default: false,
    },
  },
  data: function () {
    return {
      drawerOpen: false,
    }
  },
  methods: {
    searchChanged: function (id, data) {
      this.$emit('search-changed', { ...data, id: id })
    },
    close: function () {
      this.drawerOpen = false
    },
    toggleDrawer: function () {
      this.drawerOpen = !this.drawerOpen
    },
    openSearch: function (facets, query) {
      this.drawerOpen = true
      // Because refs are in v-for, nextTick is needed here
      this.$nextTick(() => {
        this.$refs[this.activeId][0].openSearch(facets, query)
      })
    },
    addFilter: function (filter) {
      this.drawerOpen = true
      filter.AND = true // When we add a filter external, it is currently only with an AND boolean

      // Because refs are in v-for, nextTick is needed here
      this.$nextTick(() => {
        this.$refs[this.activeId][0].addFilter(filter)
      })
    },
    openNeuronSearch: function (neuron) {
      this.drawerOpen = true
      // Because refs are in v-for, nextTick is needed here
      this.$nextTick(() => {
        this.$refs[this.activeId][0].openSearch(
          '',
          undefined,
          'scicrunch-query-string/',
          { field: '*organ.curie', curie: neuron }
        )
      })
    },
    getAlgoliaFacets: async function () {
      return await this.$refs[this.activeId][0].getAlgoliaFacets()
    },
    setDrawerOpen: function (value = true) {
      this.drawerOpen = value
    },
    tabClicked: function (id) {
      this.$emit('tabClicked', id)
    },
  },
  created: function () {
    this.drawerOpen = this.openAtStart
  },
  mounted: function () {
    EventBus.on('PopoverActionClick', (payLoad) => {
      this.$emit('actionClick', payLoad)
    })
    EventBus.on('available-facets', (payLoad) => {
      this.$emit('search-changed', {
        type: 'available-facets',
        value: payLoad,
      })
    })
    EventBus.on('contextUpdate', (payLoad) => {
      this.$emit('contextUpdate', payLoad)
    })
  },
}
</script>

<style lang="scss" scoped>
@use 'element-plus/theme-chalk/src/drawer';
@use 'element-plus/theme-chalk/src/icon';

.box-card {
  flex: 3;
  height: 100%;
  overflow: hidden;
  pointer-events: auto;
}

.side-bar {
  position: relative;
  height: 100%;
  pointer-events: none;
}

.side-bar :deep(.el-drawer:focus) {
  outline: none;
}

.sidebar-container {
  height: 100%;
  flex-flow: column;
  display: flex;
}

.open-tab {
  width: 20px;
  height: 40px;
  z-index: 8;
  position: absolute;
  top: calc(50vh - 80px);
  right: 0px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
  border: solid 1px $app-primary-color;
  background-color: #f9f2fc;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  pointer-events: auto;
}

.el-icon-arrow-left,
.el-icon-arrow-right {
  font-weight: 600;
  margin-top: 12px;
  color: $app-primary-color;
  cursor: pointer;
  pointer-events: auto;
  transform: scaleY(2);
  text-align: center;
  vertical-align: middle;
}

.close-tab {
  float: left;
  flex: 1;
  width: 20px;
  height: 40px;
  z-index: 8;
  margin-top: calc(50vh - 80px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
  border: solid 1px $app-primary-color;
  background-color: #f9f2fc;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  pointer-events: auto;
}

.box-card {
  flex: 3;
  height: 100%;
  overflow: hidden;
  pointer-events: auto;
}

:deep(.my-drawer) {
  background: rgba(0, 0, 0, 0);
  box-shadow: none;
}

:deep(.my-drawer .el-drawer__body) {
  height: 100%;
}

.sidebar-content-container {
  flex: 1 1 auto;
}
</style>
