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

import {AlgoliaClient} from "../algolia/algolia.js";
import { facetPropPathMapping, getFilters } from "../algolia/utils.js";

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
    envVars: {
      type: Object,
      default: ()=>{}
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
        this.algoliaClient.getAlgoliaFacets(facetPropPathMapping)
          .then((data) => {
            this.facets = data;
            this.options = data;

            // create top level of options in cascader
            this.options.forEach((facet, i) => {
              this.options[i].label = convertReadableLabel(facet.label);
              this.options[i].value = this.createCascaderItemValue(
                facet.key,
                undefined
              );

              // put "Show all" as first option
              this.options[i].children.unshift({
                value: this.createCascaderItemValue("Show all"),
                label: "Show all",
              });

              // populate second level of options 
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
    tagsChangedCallback: function (presentTags) {
      if (presentTags.length > 0) {
        this.showFiltersText = false;
      } else {
        this.showFiltersText = true;
      }
    },
    // cascadeEvent: initiate searches based off cascader changes
    cascadeEvent: function (event) {
      if (event) {
        let filters = [];
        let selectedFacets = [];

        // Check for show all in selected cascade options
        event = this.showAllEventModifier(event);
        event.forEach( selection => {
          if (selection !== undefined) {
            let value = selection[1];
            let path = selection[0];
            let labels = value.split("/");     
            let output = {
              term: labels[0],
              facet: labels[1],
              facetPropPath: path
            }
            selectedFacets.push({ facetPropPath: path, label: output.facet });
            filters.push(output);
          }
        })

        this.$emit('loading', true) // let sidebarcontent wait for the requests

        console.log(getFilters(selectedFacets))

        // Algolia search
        this.algoliaClient.search(getFilters(selectedFacets), this.algoliaIndex).then(datasetDois => {
          console.log(datasetDois)
          this.$emit('datasetsSelected', {dois: datasetDois})
        })
        this.$emit("filterResults", filters); // emit filters for apps above sidebar
        this.setCascader(filters); //update our cascader v-model if we modified the event
        this.makeCascadeLabelsClickable();
      }
    },
    // showAllEventModifier:  Modifies a cascade event to unlick all selections in category if "show all" is clicked. Also unchecks "Show all" if any secection is clicked
    // *NOTE* Does NOT remove 'Show all' selections from showing in 'cascadeSelected'
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
    // setCascader: Clears previous selections and takes in an array of facets to select: filterFacets
    // facets are in the form:
    //    {
    //      facetPropPath: 'anatomy.organ.name',
    //      term: 'Sex',
    //      facet: 'Male'
    //    }
    setCascader: function (filterFacets) {
      //Do not set the value unless it is ready
      if (this.cascaderIsReady && filterFacets && filterFacets.length != 0) {
        this.cascadeSelected = filterFacets.map(e => {
          return [
            e.facetPropPath,
            this.createCascaderItemValue(capitalise(e.term), e.facet),
          ]
        });
        this.updatePreviousShowAllChecked(this.cascadeSelected);
      }
    },
    // checkShowAllBoxes: Checks each 'Show all' cascade option by using the setCascader function
    checkShowAllBoxes: function(){
      this.setCascader(
        this.options.map(option => {
          return {
            facetPropPath: option.value,
            term: option.label,
            facet: 'Show all'
          }
        })
      )
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
  mounted: function () {
    this.algoliaClient = new AlgoliaClient(this.envVars.ALGOLIA_ID, this.envVars.ALGOLIA_KEY, this.envVars.PENNSIEVE_API_LOCATION);
    this.algoliaClient.initIndex(this.envVars.ALGOLIA_INDEX);
    this.populateCascader().then(() => {
      this.cascaderIsReady = true;
      this.checkShowAllBoxes()
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
