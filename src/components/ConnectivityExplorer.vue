<template>
  <el-card :body-style="bodyStyle" class="content-card">
    <template #header>
      <div class="header">
        <el-input
          class="search-input"
          placeholder="Search"
          v-model="searchInput"
          @keyup="searchEvent"
          clearable
          @clear="clearSearchClicked"
        ></el-input>
        <el-button
          type="primary"
          class="button"
          @click="searchEvent"
          size="large"
        >
          Search
        </el-button>
      </div>
    </template>
    <div class="content scrollbar" ref="content">
      <div class="error-feedback" v-if="results.length === 0">
        No results found - Please change your search / filter criteria.
      </div>
      <div
        v-for="result in paginatedResults"
        :key="result.id"
        class="step-item"
      >
        <ConnectivityCard
          class="dataset-card"
          :entry="result"
          @mouseenter="hoverChanged(result)"
          @mouseleave="hoverChanged(undefined)"
        />
      </div>
      <el-pagination
        class="pagination"
        v-model:current-page="page"
        hide-on-single-page
        large
        layout="prev, pager, next"
        :page-size="numberPerPage"
        :total="numberOfHits"
        @current-change="pageChange"
      ></el-pagination>
    </div>
  </el-card>
</template>

<script>
const filterConnectivityKnowledge = (knowledge, sckanVersion) => {
  return knowledge.filter((item) => {
    if (item?.source && item.source === sckanVersion) {
      if ("connectivity" in item) {
        return true;
      }
    }
    return false;
  });
};

/* eslint-disable no-alert, no-console */
import { markRaw } from "vue";
import {
  ElButton as Button,
  ElCard as Card,
  ElIcon as Icon,
  ElInput as Input,
  ElPagination as Pagination,
} from "element-plus";
import ConnectivityCard from "./ConnectivityCard.vue";
import {
  FlatmapQueries,
  findTaxonomyLabels,
} from "@abi-software/map-utilities/src/services/flatmapQueries.js";
import {
  getReferenceConnectivitiesFromStorage,
  loadAndStoreKnowledge,
  refreshFlatmapKnowledgeCache,
  getKnowledgeSource,
  getReferenceConnectivitiesByAPI,
} from "@abi-software/map-utilities/src/services/flatmapKnowledge.js";

var initial_state = {
  filters: [],
  searchInput: "",
  lastSearch: "",
  results: [],
  numberOfHits: 0,
  filter: [],
  loadingCards: false,
  numberPerPage: 10,
  page: 1,
  start: 0,
};

export default {
  components: {
    ConnectivityCard,
    Button,
    Card,
    Icon,
    Input,
    Pagination,
  },
  name: "ConnectivityExplorer",
  props: {
    sckanVersion: {
      type: String,
      default: "",
    },
    entry: {
      type: Object,
      default: () => initial_state,
    },
    envVars: {
      type: Object,
      default: () => {},
    },
  },
  data: function () {
    return {
      ...this.entry,
      mapServer: "",
      flatmapQueries: undefined,
      flatmapKnowledge: [],
      paginatedResults: [],
      bodyStyle: {
        flex: "1 1 auto",
        "flex-flow": "column",
        display: "flex",
      },
    };
  },
  watch: {
    sckanVersion: function () {
      this.loadFlatmapKnowledge();
    },
  },
  methods: {
    hoverChanged: function (data) {
      this.$emit("hover-changed", data);
    },
    resetSearch: function () {
      this.numberOfHits = 0;
      this.results = [];
      this.loadingCards = false;
    },
    openSearch: function (search = "") {
      this.searchInput = search;
      this.resetPageNavigation();
      this.resetSearch();
      this.searchKnowledge(search);
    },
    clearSearchClicked: function () {
      this.searchInput = "";
      this.searchAndFilterUpdate();
    },
    searchEvent: function (event = false) {
      if (event.keyCode === 13 || event instanceof MouseEvent) {
        this.searchInput = this.searchInput.trim();
        this.searchAndFilterUpdate();
      }
    },
    searchAndFilterUpdate: function () {
      this.resetPageNavigation();
      this.searchKnowledge(this.searchInput);
    },
    searchKnowledge: function (query = "") {
      this.resetSearch();
      this.loadingCards = true;
      if (query === "") {
        this.results = this.flatmapKnowledge;
      } else {
        for (const value of this.flatmapKnowledge) {
          const lowerCase = query.toLowerCase();
          const myJSON = JSON.stringify(value).toLowerCase();
          if (myJSON.includes(lowerCase)) {
            this.results.push(value);
          }
        }
      }
      this.numberOfHits = this.results.length;
      this.paginatedResults = this.results.slice(
        this.start,
        this.start + this.numberPerPage
      );
      this.loadingCards = false;
      this.scrollToTop();
      this.lastSearch = query;
    },
    numberPerPageUpdate: function (val) {
      this.numberPerPage = val;
      this.pageChange(1);
    },
    pageChange: function (page) {
      this.start = (page - 1) * this.numberPerPage;
      this.page = page;
      this.searchKnowledge(this.searchInput);
    },
    scrollToTop: function () {
      if (this.$refs.content) {
        this.$refs.content.scroll({ top: 0, behavior: "smooth" });
      }
    },
    resetPageNavigation: function () {
      this.start = 0;
      this.page = 1;
    },
    loadFlatmapKnowledge: function () {
      if (this.mapServer && this.sckanVersion) {
        this.flatmapQueries = markRaw(new FlatmapQueries());
        this.flatmapQueries.initialise(this.mapServer);
        const sql = `select knowledge from knowledge
        where source="${this.sckanVersion}"
        order by source desc`;
        this.flatmapQueries.flatmapQuery(sql).then((response) => {
          const mappedData = response.values.map((x) => x[0]);
          const parsedData = mappedData.map((x) => JSON.parse(x));
          this.flatmapKnowledge = filterConnectivityKnowledge(
            parsedData,
            this.sckanVersion
          );
          this.openSearch(this.searchInput);
        });
      }
    },
  },
  mounted: function () {
    this.mapServer = this.envVars.FLATMAPAPI_LOCATION;
    this.loadFlatmapKnowledge();
  },
};
</script>

<style lang="scss" scoped>
.dataset-card {
  position: relative;

  &::before {
    content: "";
    display: block;
    width: calc(100% - 15px);
    height: 100%;
    position: absolute;
    top: 7px;
    left: 7px;
    border-style: solid;
    border-radius: 5px;
    border-color: transparent;
  }

  &:hover {
    &::before {
      border-color: var(--el-color-primary);
    }
  }
}

.content-card {
  height: 100%;
  flex-flow: column;
  display: flex;
  border: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.step-item {
  font-size: 14px;
  margin-bottom: 18px;
  text-align: left;
}

.search-input {
  width: 298px !important;
  height: 40px;
  padding-right: 14px;

  :deep(.el-input__inner) {
    font-family: inherit;
  }
}

.header {
  .el-button {
    font-family: inherit;

    &:hover,
    &:focus {
      background: $app-primary-color;
      box-shadow: -3px 2px 4px #00000040;
      color: #fff;
    }
  }
}

.pagination {
  padding-bottom: 16px;
  background-color: white;
  padding-left: 95px;
  font-weight: bold;
}

.pagination :deep(button) {
  background-color: white !important;
}

.pagination :deep(li) {
  background-color: white !important;
}

.pagination :deep(li.is-active) {
  color: $app-primary-color;
}

.error-feedback {
  font-family: Asap;
  font-size: 14px;
  font-style: italic;
  padding-top: 15px;
}

.content-card :deep(.el-card__header) {
  background-color: #292b66;
  padding: 1rem;
}

.content-card :deep(.el-card__body) {
  background-color: #f7faff;
  overflow-y: hidden;
  padding: 1rem;
}

.content {
  // width: 515px;
  flex: 1 1 auto;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
  border: solid 1px #e4e7ed;
  background-color: #ffffff;
  overflow-y: scroll;
  scrollbar-width: thin;
  border-radius: var(--el-border-radius-base);
}

.content :deep(.el-loading-spinner .path) {
  stroke: $app-primary-color;
}

.content :deep(.step-item:first-child .seperator-path) {
  display: none;
}

.content :deep(.step-item:not(:first-child) .seperator-path) {
  width: 455px;
  height: 0px;
  border: solid 1px #e4e7ed;
  background-color: #e4e7ed;
}

.scrollbar::-webkit-scrollbar-track {
  border-radius: 10px;
  background-color: #f5f5f5;
}

.scrollbar::-webkit-scrollbar {
  width: 12px;
  right: -12px;
  background-color: #f5f5f5;
}

.scrollbar::-webkit-scrollbar-thumb {
  border-radius: 4px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.06);
  background-color: #979797;
}

:deep(.el-input__suffix) {
  padding-right: 0px;
}

:deep(.my-drawer) {
  background: rgba(0, 0, 0, 0);
  box-shadow: none;
}
</style>
