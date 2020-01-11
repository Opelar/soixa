/*
  const config = {
    method: 'GET',
    path: '',
    params: {},
    data: {},
    headers: {},
    auth: {
      username: '',
      password: ''
    },
    abort: req => {
      req.abort()
    }
  }
*/
module.exports = xhrAdapter
module.exports.default = xhrAdapter

function xhrAdapter(config) {
  return new Promise((resolve, reject) => {
    const requestData = config.data || null
    const requestHeaders = config.headers || {};
    const queryStringObject = config.params
    let requestUrl = `${config.path}?`

    if (FormData && requestData instanceof FormData) {
      Reflect.deleteProperty(requestHeaders, 'Content-Type')
    }

    if (config.auth) {
      const { username = '', password = '' } = config.auth;
      requestHeaders.Authorization = `Basic ${btoa(username + ':' + password)}`
    }

    if (queryStringObject) {
      let counter = 0;

      for (let queryKey in queryStringObject) {
        if (queryStringObject.hasOwnProperty(queryKey)) {
          counter += 1

          if (counter > 1) {
            requestUrl += '&'
          }

          requestUrl += `${queryKey}=${queryStringObject[queryKey]}`
        }
      }
    }

    let xhr = new XMLHttpRequest()

    xhr.open(config.method.toUpperCase(), requestUrl, true)
    xhr.timeout = config.timeout

    xhr.onreadystatechange = () => {
      if (xhr && xhr.readyState === 4) {
        const responseData = !config.responseType || config.responseType === 'text'
          ? xhr.responseText
          : xhr.response

        resolve(responseData)
        xhr = null
      }
    }

    xhr.onabort = () => {
      if (xhr) {
        reject('Request aborted')
        xhr = null
      }
    }

    xhr.ontimeout = () => {
      reject(`timeout of ${config.timeout}ms`)
      xhr = null
    }

    if ('setRequestHeader' in xhr) {
      Object.keys(requestHeaders).forEach(key => {
        xhr.setRequestHeader(key, requestHeaders[key])
      })
    }

    if (config.abort) {
      config.abort(xhr)
    }

    xhr.send(requestData)
  })
}