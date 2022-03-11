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

// let testContext = {
//   "description": "3D digital tracings of the enteric plexus obtained from seven subjects (M11, M16, M162, M163, M164, M168) are mapped randomly on mouse proximal colon. The data depicts individual neural wiring patterns in enteric microcircuits, and revealed both neuron and fiber units wired in a complex organization.",
//   "heading": "Digital tracings of enteric plexus",
//   "id": "sparc.science.context_data",
//   "samples": [
//     {
//       "annotation": "",
//       "description": "Neuronal soma and fibers in a myenteric ganglion in this subject are annotated into the following groups to highlight their interactions:\n\nNeuron1,2,3 Connex: Connections between 3 neurons and cross-ganglionic fibers\n\nNeuron4_Connex: A small neuron contacts fibers passing the ganglion\n\nNeuron5: Multiple projections of a neuron in an myenteric ganglion\n\nNeuron5,3,7 Connex: Connections between 3 neurons, nerve fibers, IGNEx (complex type of intraganglionic nerve endings) and fibers in the circular muscles.\n\nNeuron8,9,10 Connex: Connections of 3 neurons with each other and with long passing fibers. \n\nIntraganglionic Nerve Ending (IGNE): Digital traces of neurites consist of complex intraganglionic nerve endings. The blue fiber has branched terminals, more likely the afferent nerve endings; the violet and cyan terminals also interweave into the fiber nest; the orange, pink and peach fibers and one process of the neuron cross the IGNE to make 1-2 conjunctions. \n",
//       "doi": "",
//       "heading": "Digital tracing for subject M11",
//       "id": "Sample 1",
//       "path": "files/derivative/sub-M11/sam-pCm11/digital-traces/pC PHPS XFP M11 20XZ 180425_180713_2_NL_20.xml",
//       "view": "View 1"
//     },
//     {
//       "annotation": "",
//       "description": "This digital trace demonstrates some types of wiring. A long process of the green neuron terminates in the intraganglionic nerve endings (IGNE) while in contact with a nerve fiber (cyan),  soma of a neuron (peach) and processes of 3 neurons (magenta, yellow and red). Two neurons and one fiber are traced to an IGNE. ",
//       "doi": "",
//       "heading": "Digital tracing for subject M16",
//       "id": "Sample 2",
//       "path": "files/derivative/sub-M16/sam-pCm16/digital-traces/pC PHPS XFP M16 20XZ 180425_180524.xml",
//       "view": "View 2"
//     }
//   ],
//   "version": "0.1.0",
//   "views": [
//     {
//       "annotation": "--",
//       "description": "Digital tracing of neurons for subject M11.",
//       "id": "View 1",
//       "path": "files/derivative/Scaffolds/M11_view.json",
//       "sample": "Sample 1",
//       "thumbnail": "files/derivative/Scaffolds/M11_thumbnail.jpeg"
//     },
//     {
//       "annotation": "--",
//       "description": "Digital tracing of neurons for subject M16.",
//       "id": "View 2",
//       "path": "files/derivative/Scaffolds/M16_view.json",
//       "sample": "Sample 2",
//       "thumbnail": "files/derivative/Scaffolds/M16_thumbnail.jpeg"
//     }
//   ]
// }
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
      contextArray: [null,null,null],
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
      this.$refs.sideBar.openSearch('', [{facet: 'Male', term:'Sex', facetPropPath:'attributes.subject.sex.value'}, {facet: 'Heart', term:'Anatomical structure', facetPropPath: 'anatomy.organ.name'}])
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
