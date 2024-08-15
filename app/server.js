const net = require('net')
const { registerListener } = require('./listener')

class Server {
   events = []
   port = null

   constructor() {}

   on(method, requestUri, cp) {
      this.events.push({ method, requestUri, cp })
   }

   listen(port, cp) {
      this.port = port

      const netServer = net.createServer((socket) => {
         socket.on('data', async (data) => {
            const listen = registerListener(socket, data)

            this.events.forEach((event) => {
               listen(event.method, event.requestUri, event.cp)
            })
         })

         socket.on('close', () => {
            socket.end()
         })

         socket.on('error', (e) => {
            console.log(e.message)
         })
      })

      netServer.listen(port, 'localhost', cp)
   }
}

module.exports = Server
