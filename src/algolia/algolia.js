import algoliasearch from 'algoliasearch'

// export `createAlgoliaClient` to use it in page components
export default function createAlgoliaClient() {
  const client = algoliasearch(
    process.env.VUE_APP_ALGOLIA_ID,
    process.env.VUE_APP_ALGOLIA_KEY
  )
  return client
}
