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
  }

  this.pmrSQL = function () {
    let sql = 'select model, workspace, exposure, score, metadata from pmr_models left join pmr_metadata on exposure = entity limit 100;'
    return sql
  }


  this.flatmapQuery = function (sql) {
    const data = { sql: sql }
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

  this.pmrSearch = function () {
    return new Promise((resolve, reject) => {
      this.flatmapQuery(this.pmrSQL())
        .then(data => {
          resolve(this.processFlatmapData(data));
        })
        .catch(reject);
    });
  }

  this.processFlatmapData = function (data) {
    // Convert the flatmap data into an array of objects
    let dataObj = transformKeyValueArrayToObject(data)

    // Only use the results with metadata
    let metadataResults = dataObj.filter(d => d.metadata)
    let metadataOnly = metadataResults.map(d => JSON.parse(d.metadata))

    // Remove duplicates
    let uniqueResults = removeDuplicates(metadataOnly)
    return uniqueResults
  }

}

export default FlatmapQueries