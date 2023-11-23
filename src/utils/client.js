export const client = {
  serverApi: import.meta.env.VITE_SERVER_API,
  send: async function (url, method = 'GET', params = {}, body = null, token = null) {
    url = `${this.serverApi}${url}`
    if (Object.keys(params).length) {
      url = url + '?' + new URLSearchParams(params).toString()
    }
    const headers = {
      'Content-Type': 'application/json'
    }
    if (token) {
      headers['X-Api-Key'] = token
    }
    const options = {
      method,
      headers: headers
    }
    if (body !== null) {
      options.body = JSON.stringify(body)
    }
    const response = await fetch(url, options)
    const data = await response.json()

    return { response, data }
  },

  get: function (url, params, token = null) {
    return this.send(url, 'GET', params, null, token)
  },

  post: function (url, body, token = null) {
    return this.send(url, 'POST', {}, body, token)
  },

  put: function (url, body, token = null) {
    return this.send(url, 'PUT', {}, body, token)
  },

  patch: function (url, body, token = null) {
    return this.send(url, 'PATCH', {}, body, token)
  },

  delete: function (url, token = null) {
    return this.send(url, 'DELETE', {}, null, token)
  }
}
