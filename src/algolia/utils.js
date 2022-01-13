// Mapping between display categories and their Algolia index property path
// Used for populating the Dataset Search Results facet menu dynamically
export const facetPropPathMapping = {
  'anatomy.organ.name' : 'Anatomical Structure',
  'organisms.primary.species.name' : 'Species',
  'item.modalities.keyword' : 'Experimental Approach',
  'attributes.subject.sex.value' : 'Sex',
  'attributes.subject.ageCategory.value' : 'Age Categories',
}

