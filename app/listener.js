const { parseUri, parseRequest } = require('./parsers')

const CRLF = '\r\n'

const parseIfDynamic = (str = '') => {
   if (str.startsWith('{') && str.endsWith('}')) {
      return str.slice(1).substring(0, str.length - 2) || undefined
   }
}

const send = (socket, data) =>
   new Promise((resolve) => {
      socket.write(data, () => {
         //  socket.end()
         return resolve()
      })
   })

const createResponse = (socket) => {
   return {
      OK: () => send(socket, 'HTTP/1.1 200 OK' + CRLF + CRLF),
      E404: () => send(socket, 'HTTP/1.1 404 Not Found' + CRLF + CRLF),
      send: (data = '', type, status) => {
         const body = `${data?.toString?.() || data}`
         const headers = [
            `HTTP/1.1 ${
               status
                  ? status === 201
                     ? '201 Created'
                     : status === 404
                     ? `404 Not Found`
                     : `${status} `
                  : '200 OK'
            }`,
            `Content-Type: ${type || 'text/plain'}`,
            `Content-Length: ${body.length}`,
         ]

         const payload = headers.join(CRLF) + CRLF + CRLF + body

         return send(socket, payload)
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
   const response = createResponse(socket)

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

         const dynamicStr = parseIfDynamic(target)
         if (dynamicStr) dynamicParts[dynamicStr] = got
         else if (got === target) continue
         else return (lock = false)
      }

      return handel(socket, response, headers, body, dynamicParts, cp)
   }
}
