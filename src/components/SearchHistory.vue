<template>
  <div>
    <div> Search History </div>
    <template v-for="(item, i) in reversedSearchHistory">
      <el-tag class="search-tag" v-if="i < 3" v-bind:key="i" @click="search(item)">{{ item.search }} </el-tag>
    </template>
  </div>

</template>

<script>
import Vue from "vue";
import {
  Tag
} from "element-ui";

Vue.use(Tag);
import EventBus from './EventBus';


export default {
  name: 'SearchHistory',
  data() {
      return {
          searchHistory: []
      }
  },
  computed: {
    reversedSearchHistory: function(){
      return this.searchHistory.slice().reverse();
    }
  },
  methods: {
    getSearchHistory() {
      if (localStorage.getItem('sparc.science-sidebar-search-history')) {
        this.searchHistory = JSON.parse(localStorage.getItem('sparc.science-sidebar-search-history'));
      } else {
        this.searchHistory = [];
      }
    },
    clearSearchHistory() {
      localStorage.removeItem('sparc.science-sidebar-search-history');
      this.searchHistory = [];
    },
    addSearchToHistory(filters, search) {
      let searchHistory = JSON.parse(localStorage.getItem('sparc.science-sidebar-search-history'));
      if (searchHistory) {
        searchHistory.push({filters: filters, search: search});
        this.searchHistory = searchHistory
        localStorage.setItem('sparc.science-sidebar-search-history', JSON.stringify(searchHistory));
      } else {
        localStorage.setItem('sparc.science-sidebar-search-history', JSON.stringify([{filters: filters, search: search}]));
      }
    },
    search(item) {
      this.$emit("search", item);
    }
  },
  mounted: function () {
    this.getSearchHistory();
    EventBus.$on('search-changed', (data) => {
      this.setSearchHistory(data);
    })
  }
}
</script>

<style scoped lang="scss">
@import "~element-ui/packages/theme-chalk/src/tag";

.search-tag {
  margin: 0 5px 5px 0;
  cursor: pointer;
}
</style>