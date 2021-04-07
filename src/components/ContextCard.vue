<template>
  <div class="dataset-card-container"  ref="container">
    <el-card class="context-card card" :body-style="{ padding: '0px', 'background-color': 'white', display: 'flex', width: '516px'}">
                <img src="https://image.prntscr.com/image/BKgqmjSaQjK-B9hy_W7haQ.png" class="context-image card-left">
        
                <div class="card-right">
                  <div>ICN Scaffold</div>
                  <div>Points are mapped to their positions on a 3d heart that is mapped to the data.</div>
                  <br/>
                  <span><img src="https://image.prntscr.com/image/DO_ZZXl7RtOXgVDv-Vw6yA.png" style="height: 20px;"> Data type 1</span>
                  <br/>
                  <span><img src="https://image.prntscr.com/image/tsnuRyFZTbmYfSjrMHTK8w.png" style="height: 27px;"> Data type 2</span>
                </div>
    </el-card>
  </div>
</template>


<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import { Link, Icon, Card, Button, Select, Input } from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
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
</style>
