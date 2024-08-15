const { parseUri, parseRequest, parseDynamicField } = require('./parsers')
const { compress } = require('./utils')
const CRLF = '\r\n'

const send = (socket, data) =>
   new Promise((resolve) => {
      socket.write(data, () => {
         //  socket.end()
         return resolve()
      })
   })

const responseStatusMapper = {
   200: '200 OK',
   201: '201 Created',
   404: '404 Not Found',
}

const createResponse = (socket, requestHeaders) => {
   return {
      headers: {
         type: 'text/plain',
         http: 'HTTP/1.1 200 OK',
      },
      getHeaders() {
         return [this.headers.http, `Content-Type: ${this.headers.type}`]
      },
      setHeader(key, value) {
         this.headers[key] = value
      },
      status(status) {
         this.setHeader(
            'http',
            `HTTP/1.1 ${responseStatusMapper[status] || status}`
         )
         return this
      },
      setType (type) {
         this.setHeader('type', type)
         return this
      },
      async send(data = '') {
         let body = `${data?.toString?.() || data}`
         const headers = this.getHeaders()

         if (requestHeaders?.['Accept-Encoding']?.includes('gzip')) {
            body = await compress(data)
            headers.push('Content-Encoding: gzip')
         }

         headers.push(`Content-Length: ${body.length}`)
         const head = headers.join(CRLF) + CRLF + CRLF

         await send(socket, head)
         await send(socket, body)
      },
   }
}

const handel = (socket, response, headers, body, params, cp) => {
   socket.params = params
   socket.headers = headers
   socket.body = body

   return cp?.(socket, response)
}

exports.registerListener = (socket, data) => {
   const { headers, body } = parseRequest(data.toString())
   const hit = headers.requestUri
   const response = createResponse(socket, headers)

   let lock = false

   return (method, requestUri, cp) => {
      if (method !== headers.method || lock) return
      lock = true

      if (requestUri === '/*' || requestUri === hit)
         return handel(socket, response, headers, body, {}, cp)

      const targetParts = parseUri(requestUri)
      const gotParts = parseUri(hit)

      if (gotParts.length !== targetParts.length) return (lock = false)

      const dynamicParts = {}
      for (let i = 0; i < targetParts.length; i++) {
         const target = targetParts[i]
         const got = gotParts[i]

         const dynamicStr = parseDynamicField(target)
         if (dynamicStr) dynamicParts[dynamicStr] = got
         else if (got === target) continue
         else return (lock = false)
      }

      return handel(socket, response, headers, body, dynamicParts, cp)
   }
}
