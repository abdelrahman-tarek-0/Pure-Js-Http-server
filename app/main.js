const fs = require('fs/promises')
const path = require('path')
const { checkFileExist } = require('./utils')
const { parseArgv } = require('./parsers')

const Server = require('./server')

const server = new Server()

const uploadDirectory = path.resolve(parseArgv('--directory') ?? '.')

server.on('GET', '/', async (req, res) => {
   await res.send()
})

server.on('GET', '/echo/{data}', async (req, res) => {
   await res.send(req?.params?.data)
})

server.on('GET', '/user-agent', async (req, res) => {
   await res.send(req?.headers?.['User-Agent'])
})

server.on('GET', '/json', async (req, res) => {
   await res.setType('application/json').send(JSON.stringify({ foo: "bar" }))
})

server.on('GET', '/html', async (req, res) => {
   await res.setType('text/html').send('<h1>hello world</h1>')
})

server.on('GET', '/files/{fileName}', async (req, res) => {
   const fileLocation = path.join(uploadDirectory, req?.params?.fileName || '.')

   if (await checkFileExist(fileLocation))
      return await res
         .setType('application/octet-stream')
         .send(await fs.readFile(fileLocation, 'utf8'))

   await res.status(404).send()
})

server.on('POST', '/files/{fileName}', async (req, res) => {
   await fs.writeFile(
      path.join(uploadDirectory, req?.params?.fileName || '.'),
      req.body
   )
   await res.status(201).send()
})

server.on('GET', '/*', async (req, res) => {
   await res.status(404).send()
})

server.listen(4221, () => {
   console.log('[SERVER]', 'running', 'http://localhost:4221')
})
