<template>
  <el-card :body-style="bodyStyle" class="content-card">
    <div slot="header" class="header">
      <context-card v-if="contextCardEntry" :entry="contextCardEntry" />
      <el-input
        class="search-input"
        placeholder="Search"
        v-model="searchInput"
        @keyup.native="searchEvent"
        clearable
        @clear="clearSearchClicked"
      ></el-input>
      <el-button class="button" @click="searchEvent">Search</el-button>
    </div>
    <SearchFilters
      class="filters"
      ref="filtersRef"
      :entry="filterEntry"
      :apiLocation="apiLocation"
      @filterResults="filterUpdate"
      @numberPerPage="numberPerPageUpdate"
    ></SearchFilters>
    <div class="content scrollbar" v-loading="loadingCards" ref="content">
      <div
        class="error-feedback"
        v-if="results.length === 0 && !loadingCards && !sciCrunchError"
      >No results found - Please change your search / filter criteria.</div>
      <div class="error-feedback" v-if="sciCrunchError">{{sciCrunchError}}</div>
      <div v-for="o in results" :key="o.id" class="step-item">
        <DatasetCard :entry="o" :apiLocation="apiLocation"></DatasetCard>
      </div>
      <el-pagination
        class="pagination"
        :current-page.sync="page"
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
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import {
  Button,
  Card,
  Drawer,
  Icon,
  Input,
  Loading,
  Pagination
} from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
import SearchFilters from "./SearchFilters";
import DatasetCard from "./DatasetCard";
import ContextCard from "./ContextCard.vue";

import createAlgoliaClient from '../algolia/algolia.js'
import { facetPropPathMapping, getAlgoliaFacets } from '../algolia/utils.js'

const algoliaClient = createAlgoliaClient()
// const algoliaPennseiveIndex = algoliaClient.initIndex('PENNSIEVE_DISCOVER');
const algoliaIndex = algoliaClient.initIndex('k-core_dev_published_time_desc')

locale.use(lang);
Vue.use(Button);
Vue.use(Card);
Vue.use(Drawer);
Vue.use(Icon);
Vue.use(Input);
Vue.use(Loading);
Vue.use(Pagination);

// handleErrors: A custom fetch error handler to recieve messages from the server
//    even when an error is found
var handleErrors = async function(response) {
  if (!response.ok) {
    let parse = await response.json();
    if (parse) {
      throw new Error(parse.message);
    } else {
      throw new Error(response);
    }
  }
  return response;
};

var initial_state = {
  searchInput: "",
  lastSearch: "",
  results: [],
  numberOfHits: 0,
  filter: [],
  filterFacets: undefined,
  loadingCards: false,
  numberPerPage: 10,
  page: 1,
  pageModel: 1,
  start: 0,
  hasSearched: false,
  sciCrunchError: false
};

export default {
  components: { SearchFilters, DatasetCard, ContextCard },
  name: "SideBarContent",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    isDrawer: {
      type: Boolean,
      default: true
    },
    entry: {
      type: Object,
      default: () => initial_state
    },
    contextCardEntry: {
      type: Object,
      default: undefined
    },
    apiLocation: {
      type: String,
      default: ""
    },
    firstSearch: {
      type: String,
      default: ""
    }
  },
  data: function() {
    return {
      ...this.entry,
      bodyStyle: {
        flex: "1 1 auto",
        "flex-flow": "column",
        display: "flex"
      }
    };
  },
  computed: {
    // This computed property populates filter data's entry object with $data from this sidebar
    filterEntry: function() {
      return {
        numberOfHits: this.numberOfHits,
        filterFacets: this.filterFacets
      };
    }
  },
  methods: {
    openSearch: function(search, filter = undefined,
      endpoint = undefined, params = undefined) {
      this.searchInput = search;
      this.resetPageNavigation();
      this.searchSciCrunch(search, filter, endpoint, params);
      if (filter) {
        this.filterFacets = [...filter];
        this.$refs.filtersRef.setCascader(this.filterFacets);
      }
    },
    clearSearchClicked: function() {
      this.searchInput = "";
      this.resetPageNavigation();
      this.searchSciCrunch(this.searchInput);
    },
    searchEvent: function(event = false) {
      if (event.keyCode === 13 || event instanceof MouseEvent) {
        this.resetPageNavigation();
        this.searchSciCrunch(this.searchInput);
      }
    },
    filterUpdate: function(filter) {
      this.filter = [...filter];
      this.$emit("search-changed", {
        value: this.filter,
        type: "filter-update"
      });
    },
    resultsDisplayUpdate: function(datasets) {
      this.resetPageNavigation();
      this.searchSciCrunch(datasets,undefined,'dataset_info/using_multile_dois/',datasets);
      this.$emit("search-changed", {
        value: this.filter,
        type: "filter-update"
      });
    },
    numberPerPageUpdate: function(val) {
      this.numberPerPage = val;
      this.pageChange(1);
    },
    pageChange: function(page) {
      this.start = (page - 1) * this.numberPerPage;
      this.searchSciCrunch(this.searchInput);
    },
    searchSciCrunch: function(search, filter = undefined,
      searchEndpoint = undefined, params = undefined) {
      this.loadingCards = true;
      this.results = [];
      this.disableCards();
      if (!searchEndpoint) searchEndpoint = this.searchEndpoint;
      if (!params)
        params = this.createParams(filter, this.start, this.numberPerPage);
      this.$emit("search-changed", { value: search, type: "query-update" });
      this.callSciCrunch(this.apiLocation, searchEndpoint, search, params)
        .then(result => {
          //Only process if the search term is the same as the last search term.
          //This avoid old search being displayed.
          this.sciCrunchError = false;
          this.resultsProcessing(result);
          this.$refs.content.style["overflow-y"] = "scroll";
          this.loadingCards = false;
        })
        .catch(result => {
          if (result.name !== 'AbortError') {
            this.loadingCards = false;
            this.sciCrunchError = result.message;
          }
        })
    },
    disableCards: function() {
      if (this.$refs.content) {
        this.$refs.content.scroll({ top: 0, behavior: "smooth" });
        this.$refs.content.style["overflow-y"] = "hidden";
      }
    },
    resetPageNavigation: function() {
      this.start = 0;
      this.page = 1;
    },
    createParams: function(filter, start, size) {
      //Deconstruct list of fitlers to list of term
      //and facet.
      let params = {};
      let term = [];
      let facet = [];
      let f = undefined;
      if (filter !== undefined) {
        f = filter;
      } else {
        f = this.filter;
      }
      if (f)
        f.forEach(e => {
          //Do not ask for any "show all" request
          if (e.facet !== "show all") {
            term.push(e.term);
            facet.push(e.facet);
          }
        });
      params.term = term;
      params.facet = facet;
      params.start = start;
      params.size = size;
      return params;
    },
    resultsProcessing: function(data) {
      this.lastSearch = this.searchInput;
      this.results = [];
      let id = 0;
      this.numberOfHits = data.numberOfHits;
      if (data.results.length === 0) {
        return;
      }
      data.results.forEach(element => {
        // this.results.push(element) below should be once backend is ready
        this.results.push({
          name: element.name,
          description: element.description,
          contributors: element.contributors,
          numberSamples: Array.isArray(element.samples)
            ? element.samples.length
            : 1,
          updated: element.updated[0].timestamp.split("T")[0],
          url: element.uri[0],
          datasetId: element.identifier,
          organs: (element.organs && element.organs.length > 0)
              ? [...new Set(element.organs.map(v => v.name))]
              : undefined,
          species: element.organisms 
            ? element.organisms[0].species
              ? [...new Set(element.organisms.map((v) =>v.species ? v.species.name : null))]
              : undefined
            : undefined, // This processing only includes each gender once into 'sexes'
          csvFiles: element.csvFiles,
          id: id,
          doi: element.doi,
          publishDate: element.publishDate,
          scaffolds: element['abi-scaffold-metadata-file'] ? element['abi-scaffold-metadata-file'] : undefined,
          additionalLinks: element.additionalLinks,
          simulation: element.additionalLinks
            ? element.additionalLinks[0].description == 'Repository'
            : false,
          s3uri: element.s3uri
        });
        id++;
      });
    },
    createfilterParams: function(params) {
      let p = new URLSearchParams();
      //Check if field is array or value
      for (const key in params) {
        if (Array.isArray(params[key])) {
          params[key].forEach(e => {
            p.append(key, e);
          });
        } else {
          p.append(key, params[key]);
        }
      }
      return p.toString();
    },
    callSciCrunch: function(apiLocation, searchEndpoint, search, params = {}) {
      return new Promise((resolve, reject) => {
        // the following controller will abort current search
        // if a new one has been started
        if (this._controller) this._controller.abort();
        this._controller = new AbortController();
        let signal = this._controller.signal;
        var endpoint = apiLocation + searchEndpoint;
        // Add parameters if we are sent them
        if (search !== "" && Object.entries(params).length !== 0) {
          endpoint = endpoint + search + "/?" + this.createfilterParams(params);
        } else {
          endpoint = endpoint + "?" + this.createfilterParams(params);
        }
        fetch(endpoint, { signal })
          .then(handleErrors)
          .then(response => response.json())
          .then(data => resolve(data))
          .catch(data => reject(data));
      });
    }
  },
  mounted: function() {
    // algolia test
    window.facetPropPathMapping = facetPropPathMapping
    getAlgoliaFacets(algoliaIndex, facetPropPathMapping).then(data => {this.facets = data; window.algoliafacets = data}).finally(() => {
      console.log('algolia success')
    })

    // temporarily disable flatmap search since there are no datasets
    if (this.firstSearch === "Flatmap" || this.firstSearch === "flatmap") {
      this.openSearch('', [
        {facet: "show all", term:'species'},
        {facet: "show all", term:'gender'},
        {facet: "show all", term:'organ'},
        {facet: "show all", term:'datasets'}]);
    } else {
      this.openSearch(this.firstSearch,  [
        {facet: "show all", term:'species'},
        {facet: "show all", term:'gender'},
        {facet: "show all", term:'organ'},
        {facet: "show all", term:'datasets'}]);
    }
  },
  created: function() {
    //Create non-reactive local variables
    this.searchEndpoint = "filter-search/";
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.content-card {
  height: 100%;
  flex-flow: column;
  display: flex;
}

.button {
  background-color: #8300bf;
  border: #8300bf;
  color: white;
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
  align-items: left;
}

.header {
  border: solid 1px #292b66;
  background-color: #292b66;
  text-align: left;
}

.pagination {
  padding-bottom: 16px;
  background-color: white;
  text-align: center;
}

.pagination >>> button {
  background-color: white !important;
}
.pagination >>> li {
  background-color: white !important;
}
.pagination >>> li.active {
  color: #8300bf;
}

.error-feedback {
  font-family: Asap;
  font-size: 14px;
  font-style: italic;
  padding-top: 15px;
}

.content-card >>> .el-card__header {
  background-color: #292b66;
  border: solid 1px #292b66;
}

.content-card >>> .el-card__body {
  background-color: #f7faff;
  overflow-y: hidden;
}

.content {
  width: 518px;
  flex: 1 1 auto;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
  border: solid 1px #e4e7ed;
  background-color: #ffffff;
  overflow-y: scroll;
  scrollbar-width: thin;
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

>>> .el-input__suffix {
  padding-right: 10px;
}

>>> .my-drawer {
  background: rgba(0, 0, 0, 0);
  box-shadow: none;
}
</style>
