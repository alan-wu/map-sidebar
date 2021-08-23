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
        ></custom-cascader>
        <div v-if="showFiltersText" class="filter-default-value">
          <svg-icon icon="noun-filter" class="filter-icon-inside" />Apply Filters
        </div>
      </span>
    </transition>

    <el-select
      class="number-shown-select"
      v-model="numberShown"
      placeholder="10"
      @change="numberShownChanged($event)"
    >
      <el-option v-for="item in numberDatasetsShown" :key="item" :label="item" :value="item"></el-option>
    </el-select>
    <span class="dataset-results-feedback">{{this.numberOfResultsText}}</span>
  </div>
</template>


<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import { Option, Select } from "element-ui";
import CustomCascader from "./Cascader";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
import { SvgIcon, SvgSpriteColor } from "@abi-software/svg-sprite";
Vue.component("svg-icon", SvgIcon);

locale.use(lang);
Vue.use(Option);
Vue.use(Select);

var capitalise = function(txt) {
  return txt.charAt(0).toUpperCase() + txt.slice(1);
};

export default {
  name: "SearchFilters",
  components: {
    CustomCascader,
    SvgSpriteColor
  },
  props: {
    /**
     * Object containing information for
     * the required viewing.
     */
    entry: Object,
    apiLocation: {
      type: String,
      default: ""
    }
  },
  data: function() {
    return {
      cascaderIsReady: false,
      previousShowAllChecked: {
        species: false,
        gender: false,
        organ: false,
        datasets: false
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
          children: [{}]
        }
      ]
    };
  },
  computed: {
    numberOfResultsText: function() {
      return `${this.entry.numberOfHits} results | Showing`;
    }
  },
  methods: {
    createCascaderItemValue: function(term, facet) {
      if (facet) return term + "/" + facet;
      else return term;
    },
    populateCascader: function() {
      return new Promise(resolve => {
        this.options = [];
        let promiseList = [];
        for (let i in this.facets) {
          this.options.push({
            value: this.createCascaderItemValue(
              this.facets[i].toLowerCase(),
              undefined
            ),
            label: capitalise(this.facets[i]),
            children: []
          });
          promiseList.push(
            this.getFacet(this.facets[i]).then(labels => {
              // Populate children of each facet with scicrunch's facets
              for (let j in labels) {
                this.options[i].children.push({
                  value: this.createCascaderItemValue(
                    this.facets[i].toLowerCase(),
                    labels[j].toLowerCase()
                  ),
                  label: capitalise(labels[j]) // Capitalisation is to match design specs
                });
              }
            })
          );
        }
        Promise.allSettled(promiseList).then(() => {
          resolve();
        });
      });
    },
    getFacet: function(facetLabel) {
      if (facetLabel === "Datasets") {
        // The datasets facet doesn't exist on SciCrunch yet, so manually set it
        // for now.
        return new Promise(resolve => {
          resolve([...new Set(["Show all", "Scaffolds", "Simulations"])]);
        });
      }
      return new Promise(resolve => {
        let facets = ["Show all"]; // Set 'Show all' as our first label
        let facet = facetLabel.toLowerCase();
        this.callSciCrunch(this.apiLocation, this.facetEndpoint, facet).then(
          facet_terms => {
            facet_terms.forEach(element => {
              facets.push(element["key"]); // add facets that scicrunch includes
            });
            resolve([...new Set(facets)]); // return no duplicates
          }
        );
      });
    },
    // switchTermToRequest is used to remove the count for sending a request to scicrunch
    switchTermToRequest: function(term) {
      return term.split(" ")[0].toLowerCase();
    },
    // updateLabels is used to show user how many are at each nested level.
    // i.e.: if 3 species are selected it will show 'Species (3)' in the cascader
    updateLabels: function(counts) {
      for (let i in counts) {
        switch (i) {
          case "species":
            this.options[0].label = this.options[0].label.split(" ")[0];
            if (counts[i] > 0) this.options[0].label += ` (${counts[i]})`;
            break;
          case "gender":
            this.options[1].label = this.options[1].label.split(" ")[0];
            if (counts[i] > 0) this.options[1].label += ` (${counts[i]})`;
            break;
          case "organ":
            this.options[2].label = this.options[2].label.split(" ")[0];
            if (counts[i] > 0) this.options[2].label += ` (${counts[i]})`;
            break;
          case "datasets":
            this.options[3].label = this.options[3].label.split(" ")[0];
            if (counts[i] > 0) this.options[3].label += ` (${counts[i]})`;
            break;
          default:
            break;
        }
      }
    },
    updateShowFiltersText: function() {
      this.$nextTick(() => {
        if (this.$refs.cascader && this.$refs.cascader.presentTags.length > 0) {
          this.showFiltersText = false;
        } else {
          this.showFiltersText = true;
        }
      })
    },
    cascadeEvent: function(event) {
      let filters = [];
      if (event) {
        // Check for show all in selected cascade options
        event = this.showAllEventModifier(event);
        for (let i in event) {
          if (event[i] !== undefined) {
            let value = event[i][1];
            let data = value.split("/");
            let output = {};
            output.term = this.switchTermToRequest(data[0]);
            output.facet = data[1];
            filters.push(output);
          }
        }
      }
      this.$emit("filterResults", filters);
      this.setCascader(filters); //update our cascader v-model if we modified the event
      this.makeCascadeLabelsClickable();
    },
    showAllEventModifier: function(event) {
      // check if show all is in the cascader checked option list
      let hasShowAll = event
        .map(ev => (ev ? ev[1].toLowerCase().includes("show all") : false))
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
        return modifiedEvent;
      }
      return event;
    },
    cascadeExpandChange: function() {
      this.makeCascadeLabelsClickable();
    },
    numberShownChanged: function(event) {
      this.$emit("numberPerPage", parseInt(event));
    },
    callSciCrunch: function(apiLocation, endpoint, term) {
      return new Promise(resolve => {
        fetch(apiLocation + endpoint + term)
          .then(response => response.json())
          .then(data => {
            resolve(data);
          });
      });
    },
    updatePreviousShowAllChecked: function(options) {
      //Reset the states
      for (const facet in this.previousShowAllChecked) {
        this.previousShowAllChecked[facet] = false;
      }
      options.forEach(element => {
        if (element[1].toLowerCase().includes("show all"))
          this.previousShowAllChecked[element[0]] = true;
      });
    },
    setCascader: function(filterFacets) {
      //Do not set the value unless it is ready
      if (this.cascaderIsReady) {
        let labelCounts = { species: 0, gender: 0, organ: 0, datasets: 0 };
        this.cascadeSelected = [];
        filterFacets.forEach(e => {
          this.cascadeSelected.push([
            e.term.toLowerCase(),
            this.createCascaderItemValue(
              e.term.toLowerCase(),
              e.facet.toLowerCase()
            )
          ]);
          labelCounts[e.term.toLowerCase()] += 1;
        });
        this.updatePreviousShowAllChecked(this.cascadeSelected);
        this.updateLabels(labelCounts);
        this.updateShowFiltersText();
      }
    },
    makeCascadeLabelsClickable: function() {
      // Next tick allows the cascader menu to change
      this.$nextTick(() => {
        this.$refs.cascader.$el
          .querySelectorAll(".el-cascader-node__label")
          .forEach(el => {
            // step through each cascade label
            el.onclick = function() {
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
    }
  },
  created: function() {
    //Create non-reactive local variables
    this.facetEndpoint = "get-facets/";
  },
  mounted: function() {
    this.populateCascader().then(() => {
      this.cascaderIsReady = true;
      this.setCascader(this.entry.filterFacets);
      this.makeCascadeLabelsClickable();
    });
  }
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
