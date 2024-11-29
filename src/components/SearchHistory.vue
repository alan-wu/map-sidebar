<template>
  <div class="history-container" v-if="searchHistory.length">
    <div class="saved-search-history" v-if="savedSearchHistory.length">
      <template v-for="(item, i) in savedSearchHistory">
        <el-tag
          class="search-tag"
          v-if="i < 2"
          v-bind:key="i"
          @click="search(item)"
          size="large"
        >
          <template v-if="item.label.length > 15">
            <el-popover
              width="auto"
              trigger="hover"
              popper-class="popover-dropdown"
            >
              <template #reference>
                {{ item.label }}
              </template>
              {{ item.label }}
            </el-popover>
          </template>
          <template v-else>
            {{ item.label }}
          </template>
        </el-tag>
      </template>
    </div>
    <div v-else>
      <span class="empty-saved-search">No Saved Searches</span>
    </div>
    <el-dropdown trigger="click" :max-height="350" :hide-on-click="false">
      <span class="el-dropdown-select">
        Search history
        <el-icon class="el-icon--right">
          <el-icon-arrow-down />
        </el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="(item, i) in searchHistory">
            <div>
              <template v-if="item.label.length > 23">
                <el-popover
                  width="auto"
                  trigger="hover"
                  popper-class="popover-dropdown"
                >
                  <template #reference>
                    {{ item.label }}
                  </template>
                  {{ item.label }}
                </el-popover>
              </template>
              <template v-else>
                {{ item.label }}
              </template>
            </div>
            <div>
              <el-popover
                width="auto"
                trigger="hover"
                :teleported="true"
                :show-after="100"
                popper-class="popover-dropdown"
              >
                <template #reference>
                  <el-button circle text size="small"
                    @click="toggleSavedSearch(item)"
                    :disabled="savedSearchHistory.length > 1 && !item.saved"
                  >
                    <el-icon color="#8300BF">
                      <el-icon-star-filled v-if="item.saved" />
                      <el-icon-star v-else />
                    </el-icon>
                  </el-button>
                </template>
                <span v-if="savedSearchHistory.length > 1 && !item.saved">
                  Please unsave one before adding another.
                </span>
                <span v-else-if="item.saved">
                  Remove from saved searches.
                </span>
                <span v-else>
                  Add up to two saved searches.
                </span>
              </el-popover>
              <el-popover
                width="auto"
                trigger="hover"
                :teleported="true"
                :show-after="100"
                popper-class="popover-dropdown"
              >
                <template #reference>
                  <el-button circle text size="small" @click="removeFromSavedSearch(item)">
                    <el-icon color="#8300BF">
                      <el-icon-delete />
                    </el-icon>
                  </el-button>
                </template>
                <span>
                  Remove from search history.
                </span>
              </el-popover>
            </div>
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

function generateUUID() {
  const arr = new Uint8Array(16);
  window.crypto.getRandomValues(arr);

  arr[6] = (arr[6] & 0x0f) | 0x40;
  arr[8] = (arr[8] & 0x3f) | 0x80;

  const hex = Array.from(arr)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
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
      savedSearchHistory: [],
    }
  },
  mounted: function () {
    this.getSearchHistory()
    EventBus.on('search-changed', (data) => {
      this.setSearchHistory(data)
    });
    this.updateSearchHistory();
    this.savedSearchHistory = this.searchHistory.filter((item) => item.saved);
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
    addSearchToHistory(filters = [], search = '') {
      search = search.trim() // remove whitespace

      const isExistingItem = this.searchHistory.some((item) => (
        item.search === search &&
        JSON.stringify(item.filters) === JSON.stringify(filters)
      ));

      if (!isExistingItem) {
        const newItem = {
          filters: filters,
          search: search,
          saved: false,
          label: this.searchHistoryItemLabel(search, filters),
          id: generateUUID(),
          updated: (new Date()).getTime(),
        };

        this.searchHistory.push(newItem);

        // Save new data
        localStorage.setItem(
          'sparc.science-sidebar-search-history',
          JSON.stringify(this.searchHistory)
        );
      }
    },
    updateSearchHistory: function () {
      // Update for missing attributes
      this.searchHistory.forEach((item) => {
        if (!item.id) {
          item['id'] = generateUUID();
        }
        if (!item.label) {
          item['label'] = this.searchHistoryItemLabel(item.search, item.filters);
        }
        if (!item.saved) {
          item['saved'] = false;
        }
        if (!item.updated) {
          item['updated'] = (new Date()).getTime();
        }
      });

      // Sort by saved and updated
      this.searchHistory = this.searchHistory.sort((a, b) => {
        if (a.saved !== b.saved) {
          return b.saved - a.saved;
        }
        if (a.updated !== b.updated) {
          return a.updated - b.updated;
        }
        return 0;
      });

      // Save updated data
      localStorage.setItem(
        'sparc.science-sidebar-search-history',
        JSON.stringify(this.searchHistory)
      )
    },
    search: function (item) {
      this.$emit('search', item)
    },
    searchHistoryItemLabel: function (search, filters) {
      let label = search ? `"${search.trim()}"` : '';
      let filterItems = [];

      if (filters) {
        filterItems = filters.filter((filterItem) => filterItem.facet !== 'Show all');
      }

      if (label && filterItems.length) {
        label += ` (+${filterItems.length})`;
      }

      if (!label && filterItems.length) {
        label = filterItems[0].facet;

        if (filterItems.length > 1) {
          label += ` (+${filterItems.length - 1})`;
        }
      }

      if (!label) {
        label = 'Unknown search';
      }

      return label;
    },
    toggleSavedSearch: function (item) {
      this.searchHistory.forEach((_item) => {
        if (_item.id === item.id) {
          _item.saved = !_item.saved;
        }
      });
      this.savedSearchHistory = this.searchHistory.filter((item) => item.saved);
      this.updateSearchHistory();
    },
    removeFromSavedSearch: function (item) {
      const itemIndex = this.searchHistory.findIndex((_item) => _item.id === item.id);
      this.searchHistory.splice(itemIndex, 1);
      this.savedSearchHistory = this.searchHistory.filter((item) => item.saved);
      this.updateSearchHistory();
    },
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

  :deep(.el-tag__content) {
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

:deep(.el-dropdown-menu__item) {
  justify-content: space-between;
  gap: 0.5rem;
  cursor: default;
  position: relative;

  > div:first-child {
    max-width: 148px;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  + .el-dropdown-menu__item {
    &::before {
      content: "";
      display: block;
      width: calc(100% - 32px);
      border-top: 1px solid var(--el-border-color);
      position: absolute;
      top: 0;
    }
  }

  &:hover,
  &:focus,
  &:active {
    color: inherit;
    background-color: var(--el-bg-color-page);
  }

  i {
    margin: 0;
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
  min-width: 180px;
  width: fit-content;

  .el-button + .el-button {
    margin: 0;
  }
}

.el-popover.el-popper.popover-dropdown {
  padding: 4px 10px;
  min-width: max-content;
  font-family: Asap;
  font-size: 12px;
  color: inherit;
  background: #f3ecf6 !important;
  border: 1px solid $app-primary-color;

  & .el-popper__arrow::before {
    border: 1px solid;
    border-color: $app-primary-color;
    background: #f3ecf6;
  }
}
</style>
