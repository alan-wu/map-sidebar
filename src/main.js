import { createApp } from 'vue'
import App from './App.vue'
import MapSideBar from './components/SideBar.vue'

const app = createApp(App);

app.component('MapSideBar', MapSideBar)

app.mount("#app");
