<template>
  <div class="filters">
    <SvgSpriteColor/>
    <transition name="el-zoom-in-top">
      <span v-show="showFilters" class="search-filters transition-box">
          <el-cascader
          class="cascader"
          ref="cascader"
          v-model="cascadeSelected"
          placeholder=""
          :collapse-tags="true"
          :options="options"
          :props="props"
          @change="cascadeEvent($event)"
          @expand-change="makeCascadeLabelsClickable"
          :show-all-levels="false"
          :append-to-body="false">
        </el-cascader>
        <div v-if="cascadeSelected.length === 0" class="filter-default-value">
          <svg-icon icon="noun-filter" class="filter-icon-inside" />
          Apply Filters
        </div>
      </span>
    </transition>

      <el-select class="number-shown-select"  v-model="numberShown" placeholder="10" @change="numberShownChanged($event)">
        <el-option v-for="item in numberDatasetsShown" :key="item" :label="item" :value="item"></el-option>
      </el-select>
      <span
        class="dataset-results-feedback"
      >{{this.numberOfResultsText}}</span>
  </div>
</template>


<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import { Cascader, Option, Select } from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
import {SvgIcon, SvgSpriteColor} from '@abi-software/svg-sprite';
Vue.component('svg-icon', SvgIcon);

locale.use(lang);
Vue.use(Cascader);
Vue.use(Option);
Vue.use(Select);

var capitalise = function(string){
  return string.replace(/\b\w/g, v => v.toUpperCase())
}

export default {
  name: "SearchFilters",
  components: {
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
      default: ""
    },
  },
  data: function () {
    return {
      cascaderIsReady: false,
      showFilters: true,
      cascadeSelected: [],
      numberShown: 10,
      filters: [],
      facets: ['Species', 'Gender', 'Organ', 'Datasets'],
      numberDatasetsShown: ["10", "20", "50"],
      props: { multiple: true },
      options: [{
        value: 'Species',
        label: 'Species',
        children: [{
        }]
      }],
    };
  },
  computed: {
    numberOfResultsText: function(){
      return `${this.entry.numberOfHits} results | Showing`;
    }
  },
  methods: {
    createCascaderItemValue: function(term, facet) {
      if (facet)
        return term + "/" + facet;
      else
        return term;
    },
    populateCascader: function () {
      return new Promise( (resolve) => {
        this.options = [];
        let promiseList = []
        for(let i in this.facets){
          this.options.push({
              value: this.createCascaderItemValue(this.facets[i].toLowerCase(), undefined),
              label: capitalise(this.facets[i]),
              children: []
          });
          promiseList.push(this.getFacet(this.facets[i]).then((labels)=>{
            // Populate children of each facet with scicrunch's facets
            for(let j in labels){
              this.options[i].children.push({
                value: this.createCascaderItemValue(this.facets[i].toLowerCase(), labels[j].toLowerCase()),
                label: capitalise(labels[j]), // Capitalisation is to match design specs
              })
            }
          }))
        }
        Promise.allSettled(promiseList).then(()=>{resolve()});
      })
    },
    getFacet: function (facetLabel) {
      if (facetLabel === 'Datasets') {
        // The datasets facet doesn't exist on SciCrunch yet, so manually set it
        // for now.
        return new Promise((resolve) => {
          resolve([...new Set([`All ${facetLabel}`, "Scaffolds", "Simulations"])]);
        });
      }
      return new Promise((resolve) => {
        let facets = [`All ${facetLabel}`];
        let facet = facetLabel.toLowerCase();
        this.callSciCrunch(this.apiLocation, this.facetEndpoint, facet).then(
          (facet_terms) => {
            facet_terms.forEach((element) => {
              facets.push(element["key"]);
            });
            resolve([...new Set(facets)]);
          }
        );
      })
    },
    // switchFacetToRequest is used to set 'All' to lowercase. Api will not be case sensitive soon and this can be removed
    switchFacetToRequest: function(facet){
      if (!facet.includes('All')){
        return facet.toLowerCase()
      } else {
        return facet
      }
    },
    // switchTermToRequest is used to remove the count for sending a request to scicrunch
    switchTermToRequest: function(term){
      return term.split(' ')[0].toLowerCase()
    },
    // updateLabels is used to show user how many are at each nested level.
    // i.e.: if 3 species are selected it will show 'Species (3)' in the cascader
    updateLabels: function(counts){
      for( let i in counts){
        switch (i) {
          case 'species':
            this.options[0].label = this.options[0].label.split(' ')[0];
            if (counts[i] > 0)
              this.options[0].label += ` (${counts[i]})`;
            break;
          case 'gender':
            this.options[1].label = this.options[1].label.split(' ')[0];
            if (counts[i] > 0)
              this.options[1].label += ` (${counts[i]})`;
            break;
          case 'organ':
            this.options[2].label = this.options[2].label.split(' ')[0];
            if (counts[i] > 0)
              this.options[2].label += ` (${counts[i]})`;
            break;
          case 'datasets':
            this.options[3].label = this.options[3].label.split(' ')[0];
            if (counts[i] > 0)
              this.options[3].label += ` (${counts[i]})`;
            break;
          default:
            break;
        }
      }
    },
    cascadeEvent: function(event){
      let labelCounts = {species: 0, gender: 0, organ: 0, datasets: 0};
      let filters = [];
      if(event) {
        for(let i in event){
          if(event[i] !== undefined){
            let value = event[i][1];
            let data = value.split('/');
            let output = {};
            output.term = this.switchTermToRequest(data[0]);
            output.facet = this.switchFacetToRequest(data[1]);
            filters.push(output);
            labelCounts[data[0]] += 1;
          }
        }
      }
      this.updateLabels(labelCounts);
      this.$emit("filterResults", filters);
      this.makeCascadeLabelsClickable();
    },
    numberShownChanged: function (event){
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
    setCascader: function(filterFacets) {
      //Do not set the value unless it is ready
      if (this.cascaderIsReady) {
        let labelCounts = {species: 0, gender: 0, organ: 0, datasets: 0};
        this.cascadeSelected = [];
        filterFacets.forEach(e => {
          this.cascadeSelected.push([e.term.toLowerCase(),
            this.createCascaderItemValue(e.term.toLowerCase(), e.facet.toLowerCase())]);
          labelCounts[e.term.toLowerCase()] += 1;
        });
        this.updateLabels(labelCounts);
      }
    },
    makeCascadeLabelsClickable: function(){
      // Next tick allows the cascader menu to change
      this.$nextTick(()=>{
        this.$refs.cascader.$el.querySelectorAll('.el-cascader-node__label').forEach(el => { // step through each cascade label
          el.onclick = function() {
            const checkbox = this.previousElementSibling
            if (checkbox) { 
              if (!checkbox.parentElement.attributes['aria-owns']){ // check if we are at the lowest level of cascader
                this.previousElementSibling.click(); // Click the checkbox
              }
            } 
          };
        });
      })
    }
  },
  created: function() {
    //Create non-reactive local variables
    this.facetEndpoint = "get-facets/";
  },
  mounted: function () {
    this.populateCascader().then(()=>{
      this.cascaderIsReady = true;
      this.setCascader(this.entry.filterFacets);
      this.makeCascadeLabelsClickable();
    })
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.filter-default-value{
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  padding-top: 10px;
  padding-left: 16px;
}

.filter-icon-inside{
  width: 12px!important;
  height: 12px!important;
  color: #292b66;
  transform: scale(2)!important;
  margin-bottom: 0px!important;
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

.cascader >>> .el-scrollbar__wrap{
  overflow-x: hidden;
  margin-bottom: 2px !important;
}

.cascader >>> li[aria-owns*="cascader"] > .el-checkbox {
  display: none;
}

.dataset-results-feedback{
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
  float:left;
  padding-right: 15px;
  padding-bottom: 12px;
}

.number-shown-select{
  float: right;
}

.number-shown-select >>> .el-input__inner{
  width: 68px;
  height: 40px;
  color: rgb(48, 49, 51);
}

.search-filters >>> .el-cascader-node.is-active{
  color: #8300bf;
}

.search-filters >>> .el-cascader-node.in-active-path{
  color: #8300bf;
}

.search-filters >>> .el-checkbox__input.is-checked > .el-checkbox__inner {
  background-color: #8300bf;
  border-color: #8300bf;
}

</style>
