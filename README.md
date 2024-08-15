# Node js pure http server handler build with net module

## Description

zero framework http server handler build with net module the core network module of nodejs<br />
It is a simple example of how to create a server and handle requests with nodejs <br/>
and i am talking about handling pure http request not using any framework like express or even the core http module of nodejs <br/>
thats mean i had to handel the parsing of the headers and body<br />
and encoding the response and sending it back to the client<br />
even implemented GZIP compression for the response body<br />
also build express like routing system and handler<br />

parsing the request headers and body by splitting the request payload by CRLF('\r\n') and handel all the keys and values in the headers<br />
this was super fun project to build<br />
this was part of challenge ["Build Your Own HTTP server" Challenge](https://app.codecrafters.io/courses/http-server/overview)

```javascript
const Server = require('./server')

const server = new Server()

server.on('GET', '/', async (req, res) => {
   await res.send()
})

server.on('GET', '/echo/{data}', async (req, res) => {
   await res.send(req?.params?.data)
})

server.on('GET', '/user-agent', async (req, res) => {
   await res.send(req?.headers?.['User-Agent'])
})

server.on('POST', '/files/{fileName}', async (req, res) => {
   await fs.writeFile(path.resolve(req?.params?.fileName || '.'), req.body)
   await res.status(201).send()
})

server.on('GET', '/*', async (req, res) => {
   await res.status(404).send()
})

server.listen(4221, () => {
   console.log('[SERVER]', 'running', 'http://localhost:4221')
})
```

![alt text](/docs/image.png)

i made a dynamic param parser indicated by {paramName} in the route can be accessed from the request object as req.params.paramName<br />

you can register a handler like this<br />

```javascript
server.on(METHOD, ROUTE, CALLBACK)
```

send a response like this<br />

```javascript
 await res.status(STATUS_CODE).setType(RESPONSE_TYPE).send(TEXT_DATA)
```

## Installation

just clone the repo and npm run dev because there is zero dependencies<br />

```bash
git clone git@github.com:abdelrahman-tarek-0/Pure-Js-Http-server.git
```

```bash
npm run dev
```

## files

-  main.js: the entry point of the example server
-  parser.js: the parser module that parse the request url, headers and body it is responsible for all the parsing logic
-  utils.js: some helper functions like the GZIP compression
-  listener.js: this is responsible for building the server request and response objects and register the socket event listeners
-  server.js: the server class that is responsible for listing on the port and saving the registered handlers and call them when a request comes

## Supported responses status codes

```javascript
const responseStatusMapper = {
   200: '200 OK',
   201: '201 Created',
   404: '404 Not Found',
}
```

## Supported response formats
specified by the user from res.setType() method

```javascript
 res.status(200).setType('text/plain').send('')
 res.status(200).setType('application/json').send(JSON.stringify({foo: 'bar'}))
 res.status(200).setType('text/html').send('<h1>hello world</h1>')
```

## Supported methods

```javascript
const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
```

