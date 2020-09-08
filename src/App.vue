<template>
  <div id="app">
    Click arrow to open sidebar
    <SideBar class="side-bar" ref="sideBar" :visible="sideBarVisibility"></SideBar>
  </div>
</template>

<script>
import "element-ui/lib/theme-chalk/index.css";

// optionally import default styles
import 'vue-draggable-resizable/dist/VueDraggableResizable.css'
import SideBar from './components/SideBar'

export default {
  name: 'app',
  components: {
    SideBar
  },
  data: function(){
    return {
      sideBarVisibility: true
    }
  },
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height:90%;
  width: 90%;
  position:absolute;
}

</style>
