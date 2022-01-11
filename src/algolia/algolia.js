import algoliasearch from 'algoliasearch'

// export `createAlgoliaClient` to use it in page components
export default function createAlgoliaClient(algoliaId, algoliaKey) {
  const client = algoliasearch(
    algoliaId,
    algoliaKey
  )
  return client
}
