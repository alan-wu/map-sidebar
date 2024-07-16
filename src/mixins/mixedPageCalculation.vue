<script>
// The functions below are needed because the number of results shown on the page is dependent what is available from each index.
// We fix this by calcuting how many results we have shown before the requested page and then calculating the offset based on that.

// Note that this.RatioOfPMRResults is a number that determines how many PMR results are shown compared to SPARC results. It is grabbed from a constant in 
//  SidebarContent.vue.

export default {
  methods: {
    
    // Calculate Variable Ratio is used as a number to determine how the ratio of PMR results to SPARC results
    //   will be shown on the page. 1 means only PMR results, 0 means only SPARC results. 
    calculateVariableRatio: function () {
      if (this.page === 1) {
        this.variableRatio = this.RatioOfPMRResults
      } else if( this.npp_SPARC * (this.page -1) >= this.sparcNumberOfHits) {
        this.variableRatio = 1
        // calculate offset
        let mixedOffest = this.page*this.RatioOfPMRResults
      } else if(this.npp_PMR * (this.page - 1) >= this.pmrNumberOfHits) {
        this.variableRatio = 0
      } else {
        this.variableRatio = this.RatioOfPMRResults
      }
    },
    calculatePMROffest: function() {
      if (this.variableRatio === this.RatioOfPMRResults) {
        return (this.page-1)*this.npp_PMR
      } else if (this.variableRatio === 1) {

        // calculate how many results we showed before the requested page
        let pageWhereSPARCResultsRanOut = Math.ceil(this.sparcNumberOfHits / this.npp_SPARC)
        let numberOfPMRResultsShownInMixed = this.npp_PMR * pageWhereSPARCResultsRanOut
        let numberOfPMRResultsShownInPMROnly = (this.page - 1 - pageWhereSPARCResultsRanOut) * this.numberPerPage
        return numberOfPMRResultsShownInMixed + numberOfPMRResultsShownInPMROnly
      }
    },
    calculateSPARCOffest: function() {
      if(this.variableRatio === this.RatioOfPMRResults) {
        return (this.page-1)*this.npp_SPARC
      } else if (this.variableRatio === 0) {
        
        // calculate how many results we showed before the requested page
        let pageWherePMRResultsRanOut = Math.ceil(this.pmrNumberOfHits / this.npp_PMR)
        let numberOfSPARCResultsShownInMixed = this.npp_SPARC * pageWherePMRResultsRanOut
        let numberOfSPARCResultsShownInSPARCOnly = (this.page - 1 - pageWherePMRResultsRanOut) * this.numberPerPage
        let offset = numberOfSPARCResultsShownInMixed + numberOfSPARCResultsShownInSPARCOnly
        return offset
      }
    },
    PMRLimit: function(pmrResultsOnlyFlag=false) {
      if (pmrResultsOnlyFlag) {
        return this.numberPerPage
      }
      if (this.variableRatio === this.RatioOfPMRResults) {
        return this.npp_PMR
      } else if (this.variableRatio === 1) {
        return this.numberPerPage
      } else if (this.variableRatio === 0) {
        return 0
      }
    },
    SPARCLimit: function(pmrResultsOnlyFlag=false) {
      if(pmrResultsOnlyFlag) {
        return 0
      }
      if (this.variableRatio === this.RatioOfPMRResults) {
        return this.npp_SPARC
      } else if (this.variableRatio === 0) {
        return this.numberPerPage
      } else if (this.variableRatio === 1) {
        return 0
      }
    },
  }
};
</script>


