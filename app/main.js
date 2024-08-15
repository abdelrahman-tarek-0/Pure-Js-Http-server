const net = require('net')
const fs = require('fs/promises')
const path = require('path')
const { checkFileExist } = require('./utils')
const { parseArgv } = require('./parsers')

const { registerListener } = require('./listener')

const uploadDirectory = path.resolve(parseArgv('--directory') ?? '.')

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
   socket.on('data', async (data) => {
      const listen = registerListener(socket, data)

      listen('GET', '/', async (req, res) => {
         await res.send()
      })

      listen('GET', '/echo/{data}', async (req, res) => {
         await res.send(req?.params?.data, '', '', req?.headers?.['Accept-Encoding']?.split(',')?.map(h=> h?.trim()).includes('gzip'))
      })

      listen('GET', '/user-agent', async (req, res) => {
         await res.send(req?.headers?.['User-Agent'])
      })

      listen('GET', '/files/{fileName}', async (req, res) => {
         const fileLocation = path.join(
            uploadDirectory,
            req?.params?.fileName || '.'
         )

         if (await checkFileExist(fileLocation))
            return await res.send(
               await fs.readFile(fileLocation, 'utf8'),
               'application/octet-stream'
            )

         await res.send('', '', 404)
      })

      listen('POST', '/files/{fileName}', async (req, res) => {
         // console.log(req.params.fileName, req.body)
         await fs.writeFile(path.join(uploadDirectory, req?.params?.fileName || '.'), req.body)
         await res.send('', '', 201)
      })

      listen('GET', '/*', async (req, res) => {
         await res.send('', '', 404)
      })
   })

   socket.on('close', () => {
      socket.end()
   })

   socket.on('error', (e) => {
      console.log(e.message)
   })
})

server.listen(4221, 'localhost', () => {
   console.log('[SERVER]', 'running', 'http://localhost:4221')
})
