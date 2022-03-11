<template>
  <div class="context-card-container"  ref="container">
    <div v-show="showDetails" class="hide" @click="showDetails = !showDetails">Hide information<i class="el-icon-arrow-up"></i></div>
    <div v-show="!showDetails" class="hide" @click="showDetails = !showDetails">Show information<i class="el-icon-arrow-down"></i></div>
    <el-card v-if="showDetails && Object.keys(contextData).length !== 0" class="context-card card" :body-style="{ padding: '0px', 'background-color': 'white', display: 'flex', width: '516px'}">
      <img :src="entry.banner" class="context-image card-left">
      <div class="card-right">
        <div class="title">{{contextData.heading}}</div>
        <div>{{contextData.description}}</div>
        <template v-for="(key, i) in contextData.views">
          <br v-bind:key="i"/>
          <span v-bind:key="i+'_1'"><img :src="getFileFromPath(key.thumbnail) " style="height: 25px;"> {{key.id}}</span>
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
      contextData: {},
      showDetails: true
    };
  },
  computed: {

  },
  methods: {
    getContextFile: function (contextFileUrl) {
      fetch(contextFileUrl)
        .then((response) =>{
          if (!response.ok){
            throw Error(response.statusText)
          } else {
             return response.json()
          }
        })
        .then((data) => {
          this.contextData = data
          console.log(this.contextData)
        })
        .catch(() => {
          //set defaults if we hit an error
          this.thumbnail = require('@/../assets/missing-image.svg')
          this.discoverId = undefined
        });
    },
    getFileFromPath: function(path){
      return  `${this.entry.apiLocation}s3-resource/${this.entry.discoverId}/${this.entry.version}/files/${path}`
    },
  },
  mounted: function(){
    this.getContextFile(this.entry.contextCardUrl)
  }
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
