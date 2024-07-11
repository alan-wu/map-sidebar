<script>
const RatioOfPMRResults = 0.2; // Ratio of PMR results to Sparc results

// The functions below are needed because the number of results shown on the page is dependent what is available from each index.
// We fix this by calcuting how many results we have shown before the requested page and then calculating the offset based on that.

export default {
  methods: {
    
    // Calculate Variable Ratio is used as a number to determine how the ratio of PMR results to SPARC results
    //   will be shown on the page. 1 means only PMR results, 0 means only SPARC results. 
    calculateVariableRatio: function () {
      if (this.page === 1) {
        this.variableRatio = RatioOfPMRResults
      } else if( this.npp_SPARC * (this.page -1) >= this.sparcNumberOfHits) {
        this.variableRatio = 1
        // calculate offset
        let mixedOffest = this.page*RatioOfPMRResults
      } else if(this.npp_PMR * (this.page - 1) >= this.pmrNumberOfHits) {
        this.variableRatio = 0
      } else {
        this.variableRatio = RatioOfPMRResults
      }
      console.log(this.variableRatio)
    },
    calculatePMROffest: function() {
      if (this.variableRatio === RatioOfPMRResults) {
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
      if(this.variableRatio === RatioOfPMRResults) {
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
    PMRLimit: function() {
      if (this.variableRatio === RatioOfPMRResults) {
        return this.npp_PMR
      } else if (this.variableRatio === 1) {
        return this.numberPerPage
      } else if (this.variableRatio === 0) {
        return 0
      }
    },
    SPARCLimit: function() {
      if (this.variableRatio === RatioOfPMRResults) {
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


