<template>
  <div id="app">
    <link rel="stylesheet"
      href="https://fonts.googleapis.com/css?family=Asap:400,400i,500,600,700&display=swap">
    Click arrow to open sidebar
    <SideBar class="side-bar" ref="sideBar" :apiLocation=apiLocation :visible="sideBarVisibility"><div>Hello!</div></SideBar>
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
  data: function(){
    return {
      sideBarVisibility: true,
      apiLocation: process.env.VUE_APP_API_LOCATION
    }
  },
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
