<template>
  <div class="context-card-container"  ref="container">
    <div v-show="showContextCard">
      <div v-show="showDetails" class="hide" @click="showDetails = !showDetails">Hide information<i class="el-icon-arrow-up"></i></div>
      <div v-show="!showDetails" class="hide" @click="showDetails = !showDetails">Show information<i class="el-icon-arrow-down"></i></div>
      <el-card v-if="showDetails && Object.keys(contextData).length !== 0" v-loading="loading" class="context-card card" >
        <div class="card-left">
          <img :src="entry.banner" class="context-image">
        </div>
        <div class="card-right">
          <div class="title">{{contextData.heading}}</div>
          <div>{{contextData.description}}</div>
          <br/>
          <div v-if="contextData.views" class="subtitle">Scaffold Views</div>
          <template v-for="(view, i) in contextData.views">
            <br v-bind:key="i"/>
            <span v-bind:key="i+'_1'" @click="openViewFile(view)" class="context-card-item">
              <img class="key-image" :src="getFileFromPath(view.thumbnail)"> 
              {{view.description}}
            </span>
          </template>
          <div v-if="contextData.samples" class="subtitle">Samples on Scaffold</div>
          <template v-for="(sample, i) in contextData.samples">
            <br v-bind:key="i+'_2'"/>
            <span v-bind:key="i+'_3'" class="context-card-item" @click="toggleSampleDetails(i)">
              <img class="key-image" v-if="sample.thumbnail" :src="getFileFromPath(sample.thumbnail)">
              {{sample.heading}}
            </span>
            <div v-bind:key="i+'_4'" v-if="sampleDetails[i]">
              {{sample.description}}
            </div>
          </template>
        </div>
      </el-card>
    </div>
  </div>
</template>


<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import { Link, Icon, Card, Button, Select, Input } from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
import EventBus from "./EventBus"
import hardcoded_info from './hardcoded-context-info'

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
      showDetails: true,
      showContextCard: true,
      sampleDetails: {},
      loading: false
    };
  },
  watch: {
    'entry.contextCardUrl': {
      handler(val){
        if (val) {
          // used for hardcoding data
          if (val === true){
            this.contextData = hardcoded_info[this.entry.discoverId]
          } else {
            this.getContextFile(val)
            this.showContextCard = true
          }
        } else {
          this.showContextCard = false
        }
      },
      immediate: true
    }
  },
  methods: {
    getContextFile: function (contextFileUrl) {
      this.loading = true
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
          this.loading = false
        })
        .catch(() => {
          //set defaults if we hit an error
          this.thumbnail = require('@/../assets/missing-image.svg')
          this.discoverId = undefined
          this.loading = false
        });
    },
    removeDoubleFilesPath: function(path){
      if (path.includes('files/')){
        return path.replace('files/', '')
      } else {
        return path
      }
    },
    toggleSampleDetails: function(i){
      if (this.sampleDetails[i] === undefined){
        Vue.set(this.sampleDetails, i, true)
      } else {
        Vue.set(this.sampleDetails, i, !this.sampleDetails[i])
      }
    },
    getFileFromPath: function(path){
      // for hardcoded data
      if(this.entry.contextCardUrl === true){
        return path
      }
      path = this.removeDoubleFilesPath(path)
      return  `${this.entry.apiLocation}s3-resource/${this.entry.discoverId}/${this.entry.version}/files/${path}`
    },
    openViewFile: function(view){

      // note that we assume that the view file is in the same directory as the scaffold (viewUrls take relative paths)
      this.entry.viewUrl = view.path.split('/')[view.path.split('/').length-1]
      this.entry.type = 'Scaffold View'
      EventBus.$emit("PopoverActionClick", this.entry)
    }
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
  max-height: 10  50px;
}

.context-card-item{
  cursor: pointer;
  padding-bottom: 8px;
}

.key-image {
  width: 25px;
  height: auto;
}

.context-card >>> .el-card__body {
  padding: 0px;
  display: flex;
  width: 516px;   
}

.context-image{
  width: 250px;
  height: auto;
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

.cursor-pointer {
  cursor: pointer;
  height: 25px;
}

.title{
  font-weight: bold;
}

.subtitle{
  font-weight: bold;
}
</style>
