function transformKeyValueArrayToObject(data) {
  return data.values.map(valueArray => 
    data.keys.reduce((acc, key, index) => {
      acc[key] = valueArray[index];
      return acc;
    }, {})
  );
}

// remove duplicates by stringifying the objects
const removeDuplicates = function (arrayOfAnything) {
  if (!arrayOfAnything) return []
  return [...new Set(arrayOfAnything.map((e) => JSON.stringify(e)))].map((e) =>
    JSON.parse(e)
  )
}


let FlatmapQueries = function () {
  this.initialise = function (flatmapApi) {
    this.flatmapApi = flatmapApi
    this.features = []
    this.limit = 10
    this.offset = 0
    this.numberOfHits = 0
    this.sqlPreOffset = ''
    this.lookup = {}
    this.createLookup()
  }

  this.updateOffset = function (offset) {
    this.offset = offset
  }
  this.updateLimit = function (limit) {
    this.limit = limit
  }

  this.offsetText = function () {
    return 'limit ' + this.limit + ' offset ' + this.offset
  }

  this.pmrSQL = function (terms=[]) {
    let sql = 'select * from pmr_models left join pmr_metadata on pmr_models.exposure=pmr_metadata.entity where metadata is not null and exposure is not null and score > 0.98 '
    if (terms && terms.length > 0) {
      sql += 'and '
      sql += `term='${terms.join("' or term='")}'`
    } 
    this.sqlPreOffset = sql

    // add the limit and offset for pagination
    sql += ' ' + this.offsetText() + ';'
    console.log('SQL:', sql)
    return sql
  }

  this.convertTermsToIds = function (terms) {
    return terms.map(t => this.lookUpId(t))
  }

  this.labelSQL = function (){
    return "select entity, label from labels"
  }

  this.countSQL = function (sql) {
    sql = `select count(*) from (${sql})`
    return sql
  }


  this.flatmapQuery = function (sql) {
    const data = { sql: sql }
    console.log('Fetching data from flatmap', sql)
    return fetch(`${this.flatmapApi}knowledge/query/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error)
    })
  }

  this.processFilters = function (filters) {
    let featureLabels = []
    filters.forEach((f) => {
      if (f.facet !== 'Show all')
        featureLabels.push(f.facet)
    })
    return featureLabels
  }



  this.pmrSearch = function (filters=[], search='') {
    let features = this.processFilters(filters)
    let featureIds = this.convertTermsToIds(features)
    return new Promise((resolve, reject) => {
      this.flatmapQuery(this.pmrSQL(featureIds))
        .then(data => {
          const pd = this.processFlatmapData(data)
          this.setAvailableFeatures(pd)

          // get the number of hits for pagination
          this.flatmapQuery(this.countSQL(this.sqlPreOffset)).then(data => {
            this.numberOfHits = data.values[0][0]
            resolve(pd);
          })
        })
        .catch(reject);
    });
  }

  // setAvailableFeatures returns the available features in the flatmap for filtering
  // pd is the processed data from the flatmap
  this.setAvailableFeatures = function (pd) {
    pd.forEach((d) => {
      Object.keys(d).forEach((key) => {
        if (!this.features.includes(key)) {
          this.features.push(key)
        }
      })
    })
  }


  this.processFlatmapData = function (data) {
    // Convert the flatmap data into an array of objects
    let dataObj = transformKeyValueArrayToObject(data)

    // Only use the results with metadata
    let metadataResults = dataObj.filter(d => d.metadata)
    let metadataOnly = metadataResults.map(d => {
      let md = JSON.parse(d.metadata)
      md.dataSource = 'PMR'
      return md
    })

    // Remove duplicates
    let uniqueResults = removeDuplicates(metadataOnly)
    return uniqueResults
  }

  this.createLookup = function () {
    this.flatmapQuery(this.labelSQL())
      .then(data => {
        data.values.forEach(d => {
          if (d[1] && (typeof d[1] === 'string' || d[1] instanceof String)) {
            this.lookup[d[1].toLowerCase()] = d[0]
          }
        })
      })
  }

  this.lookUpId = function (label) {
    return this.lookup[label.toLowerCase()]
  }

}

export default FlatmapQueries