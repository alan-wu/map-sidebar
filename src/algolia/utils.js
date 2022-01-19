/* eslint-disable no-alert, no-console */

// Mapping between display categories and their Algolia index property path
// Used for populating the Dataset Search Results facet menu dynamically
export const facetPropPathMapping = {
  'anatomy.organ.name' : 'Anatomical Structure',
  'organisms.primary.species.name' : 'Species',
  'item.modalities.keyword' : 'Experimental Approach',
  'attributes.subject.sex.value' : 'Sex',
  'attributes.subject.ageCategory.value' : 'Age Categories',
}

/* Returns filter for searching algolia. All facets of the same category are joined with OR,
  * and each of those results is then joined with an AND.
  * i.e. (color:blue OR color:red) AND (shape:circle OR shape:red) */
export function getFilters(selectedFacetArray) {
  console.log('sfA', selectedFacetArray)
  if (selectedFacetArray === undefined) {
    return undefined;
  }

  // Switch the 'term' attribute to 'label' if 'label' does not exist 
  if (selectedFacetArray.filter(s=>s.label).length === 0){
    console.log('in label check')
    selectedFacetArray = [...selectedFacetArray.map(s=>s.label=s.facet)]
  }

  let facets = removeShowAllFacets(selectedFacetArray)

  let filters = "NOT item.published.status:embargo";
  filters = `(${filters}) AND `;

  const facetPropPaths = Object.keys(facetPropPathMapping);
  facetPropPaths.map((facetPropPath) => {
    const facetsToOr = facets.filter(
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
  return filters.substring(0, filters.lastIndexOf(" AND "));
}

function removeShowAllFacets(facetArray){
  return facetArray.filter( f => f.label !== 'Show all')
}