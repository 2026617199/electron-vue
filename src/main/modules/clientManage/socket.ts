import { number } from 'echarts';
import { Socket } from 'node:net';

// socket 通信

export class SocketTransport {

  socket
  onclose: any
  onmessage: any
  onerror: any

  constructor(socket: Socket) {
    this.socket = socket

    this.socket.on('close', (err) => {
      if (this.onclose) {
          this.onclose.call(null, err)
      }
    })
    this.socket.on('data', (buffer) => {
      if (this.onmessage) {
          this.onmessage.call(null, buffer)
      }
    })
    this.socket.on('error', (err) => {
      if (this.onerror) {
          this.onerror.call(null, err)
      }
    })
  }

  // 加static不然ts没有提示
  static createSocket(ip: string, port: number) {
    return new Promise((resolve, reject) => {
      const socket = new Socket()

      socket.connect({
        host: ip,
        port
      })

      socket.on('connect', () => {
        return resolve(new SocketTransport(socket))
      })
      
      socket.on('error', reject)
    })
  }

  send(msg: string | Uint8Array) {
    this.socket.write(msg)
  }

  close() {
    this.socket.destroy()
  }


}