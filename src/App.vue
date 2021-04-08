<template>
  <div id="app">
    <link rel="stylesheet"
      href="https://fonts.googleapis.com/css?family=Asap:400,400i,500,600,700&display=swap">
    Click arrow to open sidebar
    <el-button @click="openSearch">search 'heart' from refs</el-button>
    <SideBar class="side-bar" ref="sideBar" :apiLocation=apiLocation :visible="sideBarVisibility" :activeId="activeId" @tabClicked="tabClicked" ></SideBar>
  </div>
</template>

<script>

// optionally import default styles
import SideBar from './components/SideBar'

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
      contextArray: [null,{
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
      apiLocation: process.env.VUE_APP_API_LOCATION,
      activeId: 1,
    }
  },
  methods:{
    tabClicked: function(id){
      this.activeId = id
    },
    openSearch: function(){
      this.$refs.sideBar.openSearch('heart', [{facet: 'All Species', term:'species'}] )
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
