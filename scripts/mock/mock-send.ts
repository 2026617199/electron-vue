const { Socket } = require('net')

const mockSocket = new Socket()

mockSocket.connect({
  host: '127.0.0.1',
  port: 8899, // 和mock-server的端口一致
})

mockSocket.on('connect', () => {

  console.log('mock-server connected')

  mockSocket.write('send message to server')

  // process.exit()
})

mockSocket.on('error', (err: any) => {
  console.log('mock-server error', err)
  // process.exit()
})


