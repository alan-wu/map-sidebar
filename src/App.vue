<template>
  <div id="app">
    <link rel="stylesheet"
      href="https://fonts.googleapis.com/css?family=Asap:400,400i,500,600,700&display=swap">
    Click arrow to open sidebar
    <el-button @click="openSearch">search 'heart' from refs</el-button>
    <el-button @click="singleFacets">Add to Filter</el-button>
    <el-button @click="multiFacets">multiple facets</el-button>
    <el-button @click="neuronSearch">open neuron search</el-button>
    <SideBar :envVars="envVars" class="side-bar" ref="sideBar" :visible="sideBarVisibility"
      :tabs="tabs" :activeId="activeId" @tabClicked="tabClicked"
      @search-changed="searchChanged($event)" @actionClick="action"/>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
// optionally import default styles
import SideBar from './components/SideBar'

let testContext = {
    "version": "0.1.0",
    "heading": "Generic mouse colon scaffold",
    "description": "Annotated mouse colon scaffold available for registration of segmented neural anatomical-functional mapping of enteric neural circuits.",
    "samples": [],
    "views": [
        {
            "annotation": "UBERON:0008971",
            "id": "View 1",
            "path": "derivative/distalColon_view.json",
            "sample": "--",
            "thumbnail": "derivative/distalColon_thumbnail.jpeg"
        },
        {
            "annotation": "UBERON:0008972",
            "id": "View 2",
            "path": "derivative/proximalColon_view.json",
            "sample": "--",
            "thumbnail": "derivative/proximalColon_thumbnail.jpeg"
        },
        {
            "annotation": "UBERON:0001157",
            "id": "View 3",
            "path": "derivative/transverseColon_view.json",
            "sample": "--",
            "thumbnail": "derivative/transverseColon_thumbnail.jpeg"
        }
    ]
}

export default {
  name: 'app',
  components: {
    SideBar
  },
  computed: {
    tabs: function(){
      let temp = [...this.tabArray]
      for(let i in this.tabArray){
        temp[i].contextCard = this.contextArray[i]
      }
      return temp
    }
  },
  data: function(){
    return {
      tabArray: [{title: 'Flatmap', id:1},{title: 'Heart Scaffold', id:2},{title: 'Stomach Scaffold', id:3}],
      contextArray: [testContext,{
        title: "Neural paths mapped to a heart scaffold",
        description: "Points are mapped to their positions on a 3d heart that is mapped to the data.",
        bannerImage: 'https://image.prntscr.com/image/aNIksBFARaKwlKhpnDCKbA.png',
        keys: [{
          image: "https://image.prntscr.com/image/VqNcZ8fSQJu5TJEf9ahwvA.png",
          text: "Neural path"
        }],
      },{
        title: "ICN fitted Scaffold",
        description: "Points are mapped to their positions on a 3d heart that is mapped to the data.",
        bannerImage: 'https://image.prntscr.com/image/BKgqmjSaQjK-B9hy_W7haQ.png',
        keys: [{
          image: "https://image.prntscr.com/image/DO_ZZXl7RtOXgVDv-Vw6yA.png",
          text: "Data type 1"
        },{
          image: "https://image.prntscr.com/image/tsnuRyFZTbmYfSjrMHTK8w.png",
          text: "Data type 2"
        },{
          image: "https://image.prntscr.com/image/DO_ZZXl7RtOXgVDv-Vw6yA.png",
          text: "Data type 3"
        },{
          image: "https://image.prntscr.com/image/tsnuRyFZTbmYfSjrMHTK8w.png",
          text: "Data type 4"
        }
        ]
      }],
      sideBarVisibility: true,
      envVars: {
        API_LOCATION: process.env.VUE_APP_API_LOCATION,
        ALGOLIA_KEY: process.env.VUE_APP_ALGOLIA_KEY,
        ALGOLIA_ID: process.env.VUE_APP_ALGOLIA_ID,
        ALGOLIA_INDEX: process.env.VUE_APP_ALGOLIA_INDEX,
        PENNSIEVE_API_LOCATION: process.env.VUE_APP_PENNSIEVE_API_LOCATION
      },
      activeId: 1,
    }
  },
  methods:{
    searchChanged: function(data){
      console.log(data);
    },
    tabClicked: function(id){
      this.activeId = id
    },
    action: function(val){
      console.log("action fired: ", val)
    },
    openSearch: function(){
      this.$refs.sideBar.openSearch('heart', [])
    },
    singleFacets: function(){
      this.$refs.sideBar.addFilter({facet: 'Heart', term:'Anatomical structure', facetPropPath: 'anatomy.organ.name'})
    },
    multiFacets: function(){
      this.$refs.sideBar.openSearch([{facet: 'Male', term:'Sex', facetPropPath:'attributes.subject.sex.value'}, {facet: 'Heart', term:'Anatomical structure', facetPropPath: 'anatomy.organ.name'}], '')
    },
    neuronSearch: function(){
      this.$refs.sideBar.openNeuronSearch('neuron-type-keast-10')
    }
  }
}
</script>

<style>
#app {
  height:100%;
  width: 100%;
  position:absolute;
  font-family: "Asap",sans-serif;
}
body {
  margin:0px;
}
</style>
