const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
const httpVersions = ['HTTP/1.1', 'HTTP/2']
const CRLF = '\r\n'

const partParser = (part = '') => {
   let [key, ...value] = part?.split?.(':')
   value = value?.join?.('')?.trim()

   return { key, value }
}

exports.parseRequest = (payload = '') => {
   const parts = payload.split(CRLF)

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

   const headersParts = parts?.slice(1)
   let body = null;

   for (let i = 0; i < headersParts.length; i++) {
      const part = headersParts[i]
      if (part === ''){
         // empty split indicate body is coming

         body = headersParts?.slice(i + 1)?.join('')

         break;
      }

      const { key, value } = partParser(part)

      if (key) {
         parsedHeaders[key] = value
      }
   }

   return {
      headers: parsedHeaders,
      body,
   }
}

exports.parseUri = (uri = '') => uri.split('/').filter((p) => p)

exports.parseArgv = (flag) => {
   const argv = process.argv

   for (let i = 0; i < argv.length; i++) {
      const arg = argv[i]

      if (arg === flag) {
         return argv?.[i + 1]
      }
   }
}


exports.parseDynamicField = (str = '') => {
   if (str.startsWith('{') && str.endsWith('}')) {
      return str.slice(1).substring(0, str.length - 2) || undefined
   }
}