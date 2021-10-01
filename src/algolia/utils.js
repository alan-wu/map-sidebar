// Mapping between display categories and their Algolia index property path
// Used for populating the Dataset Search Results facet menu dynamically
export const facetPropPathMapping = {
  'anatomy.organ.name' : 'Anatomical Structure',
  'organisms.primary.species.name' : 'Species',
  'item.modalities.keyword' : 'Experimental Approach',
  'attributes.subject.sex.value' : 'Sex',
  'attributes.subject.ageCategory.value' : 'Age Categories',
}

export const getAlgoliaFacets = function(algoliaIndex, propPathMapping) {
  const map = new Map(Object.entries(propPathMapping));
  const facetPropPaths = Array.from(map.keys() );
  var facetData = []
  var facetId = 0
  return algoliaIndex
    .search('', {
      sortFacetValuesBy: 'alpha',
      facets: facetPropPaths
    })
    .then(response => {
      facetPropPaths.map((facetPropPath) => {
        var children = []
        const responseFacets = response.facets
        if (responseFacets === undefined) {return}
        const responseFacetChildren =
          responseFacets[facetPropPath] == undefined
            ? {}
            : responseFacets[facetPropPath]
        Object.keys(responseFacetChildren).map(facet => {
          children.push({
            label: facet,
            id: facetId++,
            facetPropPath: facetPropPath
          })
        })
        if (children.length > 0) {
          facetData.push({
            label: map.get(facetPropPath),
            id: facetId++,
            children: children,
            key: facetPropPath
          })
        }
      })
      return facetData
    })
}
