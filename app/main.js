const net = require('net')
const fs = require('fs/promises')
const path = require('path')
const parsArgv = require('./utils')

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log('Logs from your program will appear here!')

const uploadDirectory = path.resolve(parsArgv('--directory') ?? '.')

const checkFileExist = async (file) => {
   try {
      await fs.access(file)
      return true
   } catch (error) {
      return false
   }
}

const CRLF = '\r\n'

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
const httpVersions = ['HTTP/1.1', 'HTTP/2']

const response = {
   OK: () => 'HTTP/1.1 200 OK' + CRLF + CRLF,
   E404: () => 'HTTP/1.1 404 Not Found' + CRLF + CRLF,
   send: (data = '', type) => {
      const body = `${data?.toString?.() || data}`
      const headers = [
         'HTTP/1.1 200 OK',
         `Content-Type: ${type ?? 'text/plain'}`,
         `Content-Length: ${body.length}`,
      ]

      const payload = headers.join(CRLF) + CRLF + CRLF + body

      console.log(JSON.stringify(payload))

      return payload
   },
}

const partParser = (part = '') => {
   let [key, ...value] = part?.split?.(':')
   value = value?.join?.('')?.trim()

   return { key, value }
}

const parseRequestHeaders = (headers = '') => {
   const parts = headers.split(CRLF)

   console.log(parts)

   const requestLine = parts?.[0]
   if (!requestLine) throw new Error('Empty request headers')

   const requestLineParts = requestLine.split(' ')

   const method = requestLineParts?.[0]?.toUpperCase?.()
   if (!method || !methods.includes(method))
      throw new Error('Illegal method: ' + method)

   const requestUri = requestLineParts?.[1]
   if (!requestUri || !requestUri.startsWith('/'))
      throw new Error('Illegal request: ' + requestUri)

   const httpVersion = requestLineParts?.[2]
   if (!httpVersion || !httpVersions.includes(httpVersion))
      throw new Error('Unsupported http version: ' + httpVersion)

   const parsedHeaders = {
      method,
      requestUri,
      httpVersion,
   }
   parts?.slice(1).forEach((part) => {
      const { key, value } = partParser(part)

      if (key) {
         parsedHeaders[key] = value
      }
   })

   return parsedHeaders
}

const send = (socket, data) =>
   new Promise((resolve) => {
      socket.write(data, () => {
         //  socket.end()
         return resolve()
      })
   })

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
   console.log('connection open')
   //    socket.write(OK())
   socket.on('data', async (data) => {
      console.log('DATA', JSON.stringify(data.toString()))
      const headers = parseRequestHeaders(data.toString())

      console.log(headers)

      if (headers.requestUri === '/') {
         await send(socket, response.OK())
      } else if (headers.requestUri.startsWith('/echo')) {
         const [_, __, ...args] = headers.requestUri.split('/') // get echo data
         await send(socket, response.send(args?.join?.()))
      } else if (headers.requestUri.startsWith('/user-agent')) {
         await send(socket, response.send(headers['User-Agent']))
      } else if (headers.requestUri.startsWith('/files')) {
         const [_, __, file] = headers.requestUri.split('/') // get echo data
         const fileLocation = path.join(uploadDirectory, file)

         if (await checkFileExist(fileLocation)) {
            await send(
               socket,
               response.send(
                  await fs.readFile(fileLocation, 'utf8'),
                  'application/octet-stream'
               )
            )
         } else {
            await send(socket, response.E404())
         }
      } else {
         await send(socket, response.E404())
      }
   })
   socket.on('close', () => {
      console.log('connection closed')
      socket.end()
   })

   socket.on('error', (e) => {
      console.log(e.message)
   })
})

server.listen(4221, 'localhost')
