
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
    return  this.flatmapQuery(this.pmrSQL())
  }
}

export default FlatmapQueries