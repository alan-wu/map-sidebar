<template>
  <div class="history-container" v-if="searchHistory.length">
    <!-- <span v-if="reversedSearchHistory.length > 0" class="title"> Search History </span> -->
    <div class="saved-search-history" v-if="savedSearchHistory.length">
      <template v-for="(item, i) in savedSearchHistory">
        <el-tag
          class="search-tag"
          v-if="i < 2"
          v-bind:key="i"
          @click="search(item)"
          size="large"
        >
          {{ searchHistoryItemLabel(item) }}
        </el-tag>
      </template>
    </div>
    <div v-else>
      <span class="empty-saved-search">No Saved Searches</span>
    </div>
    <el-dropdown trigger="click">
      <span class="el-dropdown-select">
        Search history
        <el-icon class="el-icon--right">
          <el-icon-arrow-down />
        </el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="(item, i) in cascaderOptions">
            {{ item.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import {
  ElTag as Tag,
  ElSelect as Select,
  ElDropdown as Dropdown,
  ElIcon as Icon,
} from 'element-plus'

import EventBus from './EventBus.js'

// remove duplicates by stringifying the objects
const removeDuplicates = function (arrayOfAnything) {
  return [...new Set(arrayOfAnything.map((e) => JSON.stringify(e)))].map((e) =>
    JSON.parse(e)
  )
}

export default {
  name: 'SearchHistory',
  components: {
    Tag,
    Select
  },
  data() {
    return {
      searchHistory: [],
    }
  },
  computed: {
    reversedSearchHistory: function () {
      return removeDuplicates(
        this.searchHistory
          .slice()
          .reverse()
      )
    },
    savedSearchHistory: function () {
      return this.reversedSearchHistory.filter((item) => item.saved);
    },
    cascaderOptions: function () {
      return this.reversedSearchHistory.map((item) => {
        return {
          value: item.search,
          label: this.searchHistoryItemLabel(item),
          item: item
        }
      })
    },
  },
  methods: {
    getSearchHistory() {
      if (localStorage.getItem('sparc.science-sidebar-search-history')) {
        this.searchHistory = JSON.parse(
          localStorage.getItem('sparc.science-sidebar-search-history')
        )
      } else {
        this.searchHistory = []
      }
    },
    clearSearchHistory() {
      localStorage.removeItem('sparc.science-sidebar-search-history')
      this.searchHistory = []
    },
    addSearchToHistory(filters = [], search) {
      search = search.trim() // remove whitespace
      let searchHistory = JSON.parse(
        localStorage.getItem('sparc.science-sidebar-search-history')
      )
      if (searchHistory) {
        searchHistory.push({
          filters: filters,
          search: search,
          saved: false,
        });
        this.searchHistory = removeDuplicates(searchHistory)
        localStorage.setItem(
          'sparc.science-sidebar-search-history',
          JSON.stringify(this.searchHistory)
        )
      } else {
        localStorage.setItem(
          'sparc.science-sidebar-search-history',
          JSON.stringify([{
            filters: filters,
            search: search,
            saved: false,
          }])
        )
      }
    },
    search: function (item) {
      this.$emit('search', item)
    },
    searchHistoryItemLabel: function (item) {
      let label = item.search;
      const filterItems = item.filters.filter((filterItem) => filterItem.facet !== 'Show all');
      if (!label) {
        label = filterItems.length ? filterItems[0].facet : 'Unknown search';
      }
      return label;
    },
  },
  mounted: function () {
    this.getSearchHistory()
    EventBus.on('search-changed', (data) => {
      this.setSearchHistory(data)
    })
  },
}
</script>

<style lang="scss" scoped>
.history-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 6px;
}

.empty-saved-search {
  font-style: italic;
  font-size: 14px;
  font-weight: 400;
  color: var(--el-text-color-secondary);
}

.saved-search-history {
  display: flex;
  align-items: center;
  gap: 6px;
}

.search-tag.el-tag {
  margin: 0;
  cursor: pointer;
  background: #f9f2fc!important;
  border-color: $app-primary-color!important;
  color:$app-primary-color!important;

  .el-tag__content {
    max-width: 15ch;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.title {
  font-size: 14px;
  font-weight: bold;
  margin-right: 5px;
  // center text vertically
  display: flex;
  align-items: center;
}

.el-dropdown {
  width: 180px;
  position: relative;
  box-sizing: border-box;
  cursor: pointer;
  text-align: left;
  font-size: 14px;
  padding: 4px 12px;
  min-height: 32px;
  line-height: 24px;
  border-radius: var(--el-border-radius-base);
  background-color: var(--el-fill-color-blank);
  transition: var(--el-transition-duration);
  transform: translateZ(0);
  box-shadow: 0 0 0 1px var(--el-border-color) inset;
  cursor: pointer;
}

.el-dropdown-select {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  .el-icon {
    transform: rotate(0deg);
    transition: transform 0.25s linear;
  }

  &[aria-expanded="true"] {
    .el-icon {
      transform: rotate(180deg);
    }
  }
}
</style>

<style lang="scss">
.el-dropdown__popper {
  font-family: Asap;
  font-size: 14px;
  font-weight: 400;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  color: #292b66;
  width: 180px;
  max-width: 200px;
}
</style>
