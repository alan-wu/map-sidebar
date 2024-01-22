import Vue from 'vue'
import App from './App.vue'
// import ElementUI from 'element-ui';
// import 'element-ui/lib/theme-chalk/index.css';
// Vue.use(ElementUI);
import vueCustomElement from 'vue-custom-element'
Vue.use(vueCustomElement)

Vue.config.productionTip = false
Vue.customElement('map-side-bar', App)

new Vue({
    render: (h) => h(App),
  }).$mount('#app');
