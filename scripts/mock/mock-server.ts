const { Server } = require('net')

let server: any

const initMockServer = () => {
  if (server) return

  server = new Server()

  server.listen(
    {
      host: '127.0.0.1',
      port: 8899
    }, 
    () => {
      console.log('mock server is listening!')
    }
  )

  server.on('connection', (socket: any) => {
    console.log('mock server is connected!')
    socket.on('data', (buffer: any) => {
      console.log('mock server receive data:', buffer.toString())
      // console.log('mock server receive data:', data.toString())
      // 模拟服务端响应
      socket.write('hello mock server!')
    })
  })

  server.on('error', (err: any) => {
    console.log('mock server error:', err)
  })

  server.on('close', () => {
    console.log('mock server is closed!')
  })
}

initMockServer()