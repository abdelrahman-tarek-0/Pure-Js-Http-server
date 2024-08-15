const net = require('net')

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log('Logs from your program will appear here!')

const CRLF = '\r\n'

const OK = () => 'HTTP/1.1 200 OK' + CRLF + CRLF

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
   console.log('connection open')
   socket.write(OK())
   socket.on('close', () => {
      console.log('connection closed')
      socket.end()
   })
})

server.listen(4221, 'localhost')
