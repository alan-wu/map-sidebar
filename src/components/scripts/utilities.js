const resolveURL = (relative, base) => {
  const resolved = new URL(relative, base);
  return resolved.href;
}

const readProtocolData = async (item, baseUrl) => {
  if (item && item.resource?.url) {
    const resolvedUrl = resolveURL(item.resource.url, baseUrl)
    const response = await fetch(resolvedUrl)
    const data = await response.json()
    //convert url
    const fields = ["csv_file", "protocol", "thumbnail"]
    data.forEach((protocol) => {
      fields.forEach((field) => {
        if (field in protocol) {
          protocol[field] = resolveURL(protocol[field], resolvedUrl)
        }
      });
    })
    return data
  }

  return
}

const updateProtocolData = async (entry, baseUrl) => {
  if (entry["simulation-protocols"]) {
    const processedData = []
    for (const item of entry["simulation-protocols"]) {
      const data = await readProtocolData(item, baseUrl)
      if (data) {
        processedData.push(...data)
      }
    }
    return processedData
  }
}

const processProtocolsData = async (results, data, baseUrl) => {
  for (const entry of data) {
    const protocolData = await updateProtocolData(entry, baseUrl)
    entry["protocol-data"] = protocolData
  }
  results.unshift(...data)
}

export {
  processProtocolsData,
  resolveURL,
}
