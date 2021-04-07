<template>
  <div>
    <div v-if="!drawerOpen" @click="close" class="open-tab">
      <i class="el-icon-arrow-left"></i>
    </div>
    <el-drawer
      custom-class="my-drawer"
      class="side-bar"
      :visible.sync="drawerOpen"
      :appendToBody="false"
      :modal-append-to-body="false"
      size=550
      :with-header="false"
      :wrapperClosable="false"
      :modal="false"
    >
    <div class="box-card">
      <div v-if="drawerOpen" @click="close" class="close-tab">
        <i class="el-icon-arrow-right"></i>
      </div>
      <el-row class="tab-content" v-if="tabs.length > 1"> 
        <tabs :tabTitles="tabs" :activeId="activeId" @titleClicked="titleClicked"/>
      </el-row>
        <template v-for="tab in tabs">
          <sidebar-content v-show="tab.id===activeId" :contextCardEntry="tab.contextCard" :apiLocation="apiLocation" v-bind:key="tab.id"/>
        </template>
      </div>
    </el-drawer>
  </div>
</template>


<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import {
  Button,
  Card,
  Drawer,
  Icon,
  Input,
  Loading,
  Pagination,
} from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
import SidebarContent from './SidebarContent.vue';
import Tabs from './Tabs'

locale.use(lang);
Vue.use(Button);
Vue.use(Card);
Vue.use(Drawer);
Vue.use(Icon);
Vue.use(Input);
Vue.use(Loading);
Vue.use(Pagination);

var initial_state = {
      searchInput: "",
      lastSearch: "",
      results: [],
      drawerOpen: false,
      numberOfHits: 0,
      filter:{},
      filterFacet: undefined,
      loadingCards: false,
      numberPerPage: 10,
      page: 1,
      pageModel: 1,
      start: 0,
      hasSearched: false,
      sciCrunchError: false
}

export default {
  components: {SidebarContent, Tabs },
  name: "SideBar",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    isDrawer: {
      type: Boolean,
      default: true
    },
    entry: {
      type: Object,
      default: () => (initial_state)
    },
    apiLocation: {
      type: String,
      default: ""
    },
    tabs: {
      type: Array,
      default: () => []
    },
    activeId: {
      type: Number,
      default: 1
    }
  },
  data: function () {
    return {
      ...this.entry,
    }
  },
  methods: {
    close: function () {
      this.drawerOpen = !this.drawerOpen;
    },
    titleClicked: function(id) {
      this.activeId = id
      this.$emit("titleClicked", id);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.box-card {
  flex: 3;
  height: 100%;
  overflow: hidden;
  pointer-events: auto;
}


.side-bar{
  position: relative;
  height: 100%;
  pointer-events: none;
}

.side-bar >>> .el-drawer:focus{
  outline:none;
}

.open-tab{
  width: 20px;
  height: 40px;
  z-index: 8;
  position: absolute;
  top: calc(50vh - 80px);
  right: 0px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
  border: solid 1px #e4e7ed;
  background-color: #F7FAFF;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  pointer-events: auto;
}

.el-icon-arrow-left{
  font-size: 20px;
  padding-top: 8px;
  color: #292b66;
}

.el-icon-arrow-right{
  font-size: 20px;
  padding-top: 8px;
  color: #292b66;
  cursor: pointer;
  pointer-events: auto;
}

.close-tab{
  float: left;
  flex: 1;
  width: 20px;
  height: 40px;
  z-index: 8;
  margin-top: calc(50vh - 80px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
  border: solid 1px #e4e7ed;
  border-right: 0;
  background-color: #F7FAFF;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  pointer-events: auto;
}

.button{
  background-color: #8300bf;
  border: #8300bf;
  color: white;
}

.box-card {
  flex: 3;
  height: 100%;
  overflow: hidden;
  pointer-events: auto;
}

.step-item {
  font-size: 14px;
  margin-bottom: 18px;
  text-align: left;
}

.search-input {
  width: 298px!important;
  height: 40px;
  padding-right: 14px;
  align-items: left;
}

.header {
  border: solid 1px #292b66;
  background-color: #292b66;
  text-align: left;
}

.pagination {
  padding-bottom: 16px;
  background-color: white;
  text-align:center;
}

.pagination>>>button{
  background-color: white !important;
}
.pagination>>>li{
  background-color: white !important;
}
.pagination>>>li.active{
  color: #8300bf;
}

.error-feedback{
  font-family: Asap;
  font-size: 14px;
  font-style: italic;
  padding-top: 15px;
}

>>> .el-card__header {
  background-color: #292b66;
  border: solid 1px #292b66;
}

>>> .el-card__body {
  background-color: #f7faff;
  height: calc(100% - 8rem);
  overflow-y: hidden;
}

.content {
  width: 518px;
  height: calc(100vh - 20rem);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
  border: solid 1px #e4e7ed;
  background-color: #ffffff;
  overflow-y: scroll;
  scrollbar-width: thin;
}

>>> .my-drawer {
  background: rgba(0,0,0,0);
  box-shadow: none;
}

</style>
