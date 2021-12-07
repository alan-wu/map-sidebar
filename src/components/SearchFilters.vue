<template>
  <div class="filters">
    <SvgSpriteColor />
    <transition name="el-zoom-in-top">
      <span v-show="showFilters" class="search-filters transition-box">
        <custom-cascader
          class="cascader"
          ref="cascader"
          v-model="cascadeSelected"
          placeholder
          :collapse-tags="true"
          :options="options"
          :props="props"
          @change="cascadeEvent($event)"
          @expand-change="cascadeExpandChange"
          :show-all-levels="false"
          :append-to-body="false"
          @tags-changed="tagsChangedCallback"
        ></custom-cascader>
        <div v-if="showFiltersText" class="filter-default-value">
          <svg-icon icon="noun-filter" class="filter-icon-inside" />Apply
          Filters
        </div>
      </span>
    </transition>

    <el-select
      class="number-shown-select"
      v-model="numberShown"
      placeholder="10"
      @change="numberShownChanged($event)"
    >
      <el-option
        v-for="item in numberDatasetsShown"
        :key="item"
        :label="item"
        :value="item"
      ></el-option>
    </el-select>
    <span class="dataset-results-feedback">{{ this.numberOfResultsText }}</span>
  </div>
</template>


<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import { Option, Select } from "element-ui";
import CustomCascader from "./Cascader";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
import speciesMap from "./species-map";
import { SvgIcon, SvgSpriteColor } from "@abi-software/svg-sprite";

import createAlgoliaClient from "../algolia/algolia.js";
import { facetPropPathMapping, getAlgoliaFacets } from "../algolia/utils.js";

const algoliaClient = createAlgoliaClient();
// const algoliaPennseiveIndex = algoliaClient.initIndex('PENNSIEVE_DISCOVER');
const algoliaIndex = algoliaClient.initIndex("k-core_dev_published_time_desc");
window.algoliaIndex = algoliaIndex

Vue.component("svg-icon", SvgIcon);

locale.use(lang);
Vue.use(Option);
Vue.use(Select);

const capitalise = function (txt) {
  return txt.charAt(0).toUpperCase() + txt.slice(1);
};

const convertReadableLabel = function (original) {
  const name = original.toLowerCase();
  if (speciesMap[name]) {
    return capitalise(speciesMap[name]);
  } else {
    return capitalise(name);
  }
};

export default {
  name: "SearchFilters",
  components: {
    CustomCascader,
    SvgSpriteColor,
  },
  props: {
    /**
     * Object containing information for
     * the required viewing.
     */
    entry: Object,
    apiLocation: {
      type: String,
      default: "",
    },
  },
  data: function () {
    return {
      cascaderIsReady: false,
      previousShowAllChecked: {
        species: false,
        gender: false,
        organ: false,
        datasets: false,
      },
      showFilters: true,
      showFiltersText: true,
      cascadeSelected: [],
      numberShown: 10,
      filters: [],
      facets: ["Species", "Gender", "Organ", "Datasets"],
      numberDatasetsShown: ["10", "20", "50"],
      props: { multiple: true },
      options: [
        {
          value: "Species",
          label: "Species",
          children: [{}],
        },
      ],
    };
  },
  computed: {
    numberOfResultsText: function () {
      return `${this.entry.numberOfHits} results | Showing`;
    },
  },
  methods: {
    createCascaderItemValue: function (term, facet) {
      if (facet) return term + "/" + facet;
      else return term;
    },
    populateCascader: function () {
      return new Promise((resolve) => {
        // Algolia facet serach
        window.facetPropPathMapping = facetPropPathMapping;
        getAlgoliaFacets(algoliaIndex, facetPropPathMapping)
          .then((data) => {
            this.facets = data;
            window.algoliafacets = data;
            this.options = data;
            this.options.forEach((facet, i) => {
              this.options[i].label = convertReadableLabel(facet.label);
              this.options[i].value = this.createCascaderItemValue(
                facet.key,
                undefined
              );
              this.options[i].children.unshift({
                value: this.createCascaderItemValue("Show all"),
                label: "Show all",
              });
              window.opts = this.options;
              this.options[i].children.forEach((facetItem, j) => {
                this.options[i].children[j].label = convertReadableLabel(
                  facetItem.label
                );
                this.options[i].children[j].value =
                  this.createCascaderItemValue(facet.label, facetItem.label);
              });
            });
          })
          .finally(() => {
            resolve();
          });
      });
    },
    getFacet: function (facetLabel) {
      // UNUSED as of 2021/12/1
      if (facetLabel === "Datasets") {
        // The datasets facet doesn't exist on SciCrunch yet, so manually set it
        // for now.
        return new Promise((resolve) => {
          resolve([...new Set(["Show all", "Scaffolds", "Simulations"])]);
        });
      }
      return new Promise((resolve) => {
        let facets = ["Show all"]; // Set 'Show all' as our first label
        let facet = facetLabel.toLowerCase();
        this.callSciCrunch(this.apiLocation, this.facetEndpoint, facet).then(
          (facet_terms) => {
            facet_terms.forEach((element) => {
              facets.push(element["key"]); // add facets that scicrunch includes
            });
            resolve([...new Set(facets)]); // return no duplicates
          }
        );
      });
    },
    // switchTermToRequest is used to remove the count for sending a request to scicrunch
    switchTermToRequest: function (term) {
      return term.split(" ")[0].toLowerCase();
    },
    tagsChangedCallback: function (presentTags) {
      if (presentTags.length > 0) {
        this.showFiltersText = false;
      } else {
        this.showFiltersText = true;
      }
    },
    cascadeEvent: function (event) {
      let filters = [];
      if (event) {
        // Check for show all in selected cascade options
        event = this.showAllEventModifier(event);
        let selectedFacets = [];
        for (let i in event) {
          if (event[i] !== undefined) {
            let value = event[i][1];
            let path = event[i][0];
            let labels = value.split("/");
            selectedFacets.push({ facetPropPath: path, label: labels[1] });
            let output = {};
            output.term = labels[0];
            output.facet = labels[1];
            output.facetPropPath = path;
            filters.push(output);
          }
        }
        console.log(this.getFilters(selectedFacets)) // use this for algolia terms
        this.algoliaTest(this.getFilters(selectedFacets))
      }

      this.$emit("filterResults", filters);
      this.setCascader(filters); //update our cascader v-model if we modified the event
      this.makeCascadeLabelsClickable();
    },
    /* Returns filter for searching algolia. All facets of the same category are joined with OR,
     * and each of those results is then joined with an AND.
     * i.e. (color:blue OR color:red) AND (shape:circle OR shape:red) */
    getFilters(selectedFacetArray) {
      if (selectedFacetArray === undefined) {
        return undefined;
      }
      window.sfarray = selectedFacetArray;
      var filters = "NOT item.published.status:embargo";

      filters = `(${filters}) AND `;
      const facetPropPaths = Object.keys(facetPropPathMapping);
      window.propPathsStart = facetPropPaths;
      facetPropPaths.map((facetPropPath) => {
        const facetsToOr = selectedFacetArray.filter(
          (facet) => facet.facetPropPath == facetPropPath
        );
        var filter = "";
        facetsToOr.map((facet) => {
          filter += `"${facetPropPath}":"${facet.label}" OR `;
        });
        if (filter == "") {
          return;
        }
        filter = `(${filter.substring(0, filter.lastIndexOf(" OR "))})`;
        filters += `${filter} AND `;
      });
      window.soutput = filters.substring(0, filters.lastIndexOf(" AND "));
      return filters.substring(0, filters.lastIndexOf(" AND "));
    },
     /**
     * Get Search results
     * This is using fetch from the Algolia API
     */
    algoliaTest: function(filter) {
      algoliaIndex
      .search('', {facets:['*'],filters:filter})
      .then(response => {
        window.searchData = {
          items: response.hits,
          total: response.nbHits
        }
        console.log(window.searchData)
      })
    },
    // fetchFromAlgolia: function(query) {
    //   this.isLoadingSearch = true

    //   const searchType = pathOr('', ['query', 'type'], this.$route)
    //   const datasetsFilter =
    //     searchType === 'dataset' ? "item.types.name:Dataset" : '(NOT item.types.name:Dataset)'

    //   /* First we need to find only those facets that are relevant to the search query.
    //    * If we attempt to do this in the same search as below than the response facets
    //    * will only contain those specified by the filter */
    //     this.latestSearchTerm = query     
    //     algoliaIndex
    //       .search(query, {
    //         facets: ['*'],
    //         filters: `${datasetsFilter}`
    //       })
    //       .then(response => {
    //         this.visibleFacets = response.facets
    //       }).finally(() => {
    //         var filters =  this.$refs.datasetFacetMenu?.getFilters()
    //         filters = filters === undefined ? 
    //           `${datasetsFilter}` : 
    //           filters + ` AND ${datasetsFilter}`

    //         algoliaIndex
    //           .search(query, {
    //             facets: ['*'],
    //             hitsPerPage: this.searchData.limit,
    //             page: this.curSearchPage - 1,
    //             filters: filters
    //           })
    //           .then(response => {
    //             const searchData = {
    //               items: response.hits,
    //               total: response.nbHits
    //             }
    //             this.searchData = mergeLeft(searchData, this.searchData)
    //             this.isLoadingSearch = false
    //             // update facet result numbers
    //             for (const [key, value] of Object.entries(this.visibleFacets)) {
    //               if ( (this.$refs.datasetFacetMenu?.getLatestUpdateKey() === key && !this.$refs.datasetFacetMenu?.hasKeys()) || (this.$refs.datasetFacetMenu?.getLatestUpdateKey() !== key) ){
    //                 for (const [key2, value2] of Object.entries(value)) {
    //                   let maybeFacetCount = pathOr(null, [key, key2], response.facets)
    //                   if (maybeFacetCount) {
    //                     this.visibleFacets[key][key2] = response.facets[key][key2]
    //                   } else {
    //                     this.visibleFacets[key][key2] = 0
    //                   }
    //                 }
    //               }
    //             }
    //           })
    //       })
    // },
    showAllEventModifier: function (event) {
      // check if show all is in the cascader checked option list
      let hasShowAll = event
        .map((ev) => (ev ? ev[1].toLowerCase().includes("show all") : false))
        .includes(true);
      // remove all selected options below the show all if checked
      if (hasShowAll) {
        let modifiedEvent = [];
        let facetMaps = {};
        //catagorised different facet items
        for (const i in event) {
          if (facetMaps[event[i][0]] === undefined) facetMaps[event[i][0]] = [];
          facetMaps[event[i][0]].push(event[i]);
        }
        // go through each facets
        for (const facet in facetMaps) {
          let showAll = undefined;
          // Find the show all item if any
          for (let i = facetMaps[facet].length - 1; i >= 0; i--) {
            if (facetMaps[facet][i][1].toLowerCase().includes("show all")) {
              //seperate the showAll item and the rest
              showAll = facetMaps[facet].splice(i, 1)[0];
              break;
            }
          }
          if (showAll) {
            if (this.previousShowAllChecked[facet]) {
              //Unset the show all if it was present previously
              //and there are other items
              if (facetMaps[facet].length > 0)
                modifiedEvent.push(...facetMaps[facet]);
              else modifiedEvent.push(showAll);
            } else {
              //showAll is turned on
              modifiedEvent.push(showAll);
            }
          } else {
            modifiedEvent.push(...facetMaps[facet]);
          }
        }
        //Make sure the expanded item are sorted first.
        return modifiedEvent.sort((a, b) => {
          if (this.__expandItem__) {
            if (a[0] == this.__expandItem__) {
              if (b[0] == this.__expandItem__) {
                return 0;
              } else {
                return -1;
              }
            } else if (b[0] == this.__expandItem__) {
              if (a[0] == this.__expandItem__) {
                return 0;
              } else {
                return 1;
              }
            } else {
              return 0;
            }
          } else return 0;
        });
      }
      return event;
    },
    cascadeExpandChange: function (event) {
      //work around as the expand item may change on modifying the cascade props
      this.__expandItem__ = event;
      this.makeCascadeLabelsClickable();
    },
    numberShownChanged: function (event) {
      this.$emit("numberPerPage", parseInt(event));
    },
    callSciCrunch: function (apiLocation, endpoint, term) {
      return new Promise((resolve) => {
        fetch(apiLocation + endpoint + term)
          .then((response) => response.json())
          .then((data) => {
            resolve(data);
          });
      });
    },
    updatePreviousShowAllChecked: function (options) {
      //Reset the states
      for (const facet in this.previousShowAllChecked) {
        this.previousShowAllChecked[facet] = false;
      }
      options.forEach((element) => {
        if (element[1].toLowerCase().includes("show all"))
          this.previousShowAllChecked[element[0]] = true;
      });
    },
    setCascader: function (filterFacets) {
      //Do not set the value unless it is ready
      if (this.cascaderIsReady) {
        this.cascadeSelected = [];
        filterFacets.forEach((e) => {
          this.cascadeSelected.push([
            e.facetPropPath,
            this.createCascaderItemValue(capitalise(e.term), e.facet),
          ]);
        });
        this.updatePreviousShowAllChecked(this.cascadeSelected);
      }
    },
    makeCascadeLabelsClickable: function () {
      // Next tick allows the cascader menu to change
      this.$nextTick(() => {
        this.$refs.cascader.$el
          .querySelectorAll(".el-cascader-node__label")
          .forEach((el) => {
            // step through each cascade label
            el.onclick = function () {
              const checkbox = this.previousElementSibling;
              if (checkbox) {
                if (!checkbox.parentElement.attributes["aria-owns"]) {
                  // check if we are at the lowest level of cascader
                  this.previousElementSibling.click(); // Click the checkbox
                }
              }
            };
          });
      });
    },
  },
  created: function () {
    //Create non-reactive local variables
    this.facetEndpoint = "get-facets/";
  },
  mounted: function () {
    this.populateCascader().then(() => {
      this.cascaderIsReady = true;
      this.setCascader(this.entry.filterFacets);
      this.makeCascadeLabelsClickable();
    });
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.filter-default-value {
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  padding-top: 10px;
  padding-left: 16px;
}

.filter-icon-inside {
  width: 12px !important;
  height: 12px !important;
  color: #292b66;
  transform: scale(2) !important;
  margin-bottom: 0px !important;
}

.cascader {
  font-family: Asap;
  font-size: 14px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  color: #292b66;
  text-align: center;
  padding-bottom: 6px;
}

.cascader >>> .el-cascder-panel {
  max-height: 500px;
}

.cascader >>> .el-scrollbar__wrap {
  overflow-x: hidden;
  margin-bottom: 2px !important;
}

.cascader >>> li[aria-owns*="cascader"] > .el-checkbox {
  display: none;
}

.dataset-results-feedback {
  float: right;
  text-align: right;
  color: rgb(48, 49, 51);
  font-family: Asap;
  font-size: 18px;
  font-weight: 500;
  padding-top: 8px;
}

.search-filters {
  position: relative;
  float: left;
  padding-right: 15px;
  padding-bottom: 12px;
}

.number-shown-select {
  float: right;
}

.number-shown-select >>> .el-input__inner {
  width: 68px;
  height: 40px;
  color: rgb(48, 49, 51);
}

.search-filters >>> .el-cascader-node.is-active {
  color: #8300bf;
}

.search-filters >>> .el-cascader-node.in-active-path {
  color: #8300bf;
}

.search-filters >>> .el-checkbox__input.is-checked > .el-checkbox__inner {
  background-color: #8300bf;
  border-color: #8300bf;
}

.cascader >>> .el-cascader-menu:nth-child(2) .el-cascader-node:first-child {
  border-bottom: 1px solid #e4e7ed;
}

.cascader >>> .el-cascader-node__label {
  text-align: left;
}
</style>
