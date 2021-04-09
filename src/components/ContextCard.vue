<template>
  <div class="context-card-container"  ref="container">
    <div v-show="showDetails" class="hide" @click="showDetails = !showDetails">Hide information<i class="el-icon-arrow-up"></i></div>
    <div v-show="!showDetails" class="hide" @click="showDetails = !showDetails">Show information<i class="el-icon-arrow-down"></i></div>
    <el-card v-show="showDetails" class="context-card card" :body-style="{ padding: '0px', 'background-color': 'white', display: 'flex', width: '516px'}">
      <img :src="entry.bannerImage" class="context-image card-left">
      <div class="card-right">
        <div class="title">{{entry.title}}</div>
        <div>{{entry.description}}</div>
        <template v-for="key in entry.keys">
          <br v-bind:key="key.text"/>
          <span v-bind:key="key.text + 1"><img :src="key.image" style="height: 20px;"> {{key.text}}</span>
        </template>
      </div>
    </el-card>
  </div>
</template>


<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import { Link, Icon, Card, Button, Select, Input } from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";

locale.use(lang);
Vue.use(Link);
Vue.use(Icon);
Vue.use(Card);
Vue.use(Button);
Vue.use(Select);
Vue.use(Input);



export default {
  name: "contextCard",
  props: {
    /**
     * Object containing information for
     * the required viewing.
     */
    entry: Object,
  },
  data: function () {
    return {
      showDetails: true
    };
  },
  computed: {

  },
  methods: {
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.hide{
  color: #e4e7ed;
  cursor: pointer;
}

.context-card{
  background-color: white;
}

.context-image{
  width: 250px
}

.card {
  padding-top: 18px;
  margin-bottom: 18px;
  position: relative;
  border: solid 1px #e4e7ed;
  display: flex;
}

.card-left{
  flex: 1
}

.card-right {
  flex: 1.3;
  padding-left: 6px;
}

.title{
  font-weight: bold;
}
</style>
