import { Socket } from 'node:net';
import { SocketTransport } from './socket';
import { ClientConnectStatus } from '@/main/types/enum'
import { logger } from '../logger';

class ClientManage {
  ip: string | undefined
  port: number | undefined
  status: number = ClientConnectStatus.NO_CONNECTED

  connectionTransport: unknown

  async connectSocket() {
    this.ip = '127.0.0.1'
    this.port = 8080
    try {
      logger.info('tcp connecting...')
      this._updateClientStatus(ClientConnectStatus.CONNECTING)
      this.connectionTransport = await SocketTransport.createSocket(this.ip, this.port)
      this._onHandleTcpConnectSuccess()
    } catch (error) {
      this._updateClientStatus(ClientConnectStatus.NO_CONNECTED)
      this._onHandleTcpConnectError(error)
      // TODO: 重连机制
    }
  }

  _updateClientStatus(status: number) {
    this.status = status
    // 更新store中的值
  }
  
  /**
   * tcp 连接成功处理
   */
  _onHandleTcpConnectSuccess() {
    logger.info('tcp connect success')
    this._updateClientStatus(ClientConnectStatus.CONNECTED)
  }

  /**
   * tcp 连接错误处理
   */
  _onHandleTcpConnectError(err: any) {
    // 通知进程连接失败
    // 打印日志
    // logger.error('tcp connect error: ' + err)
  }
}

const initClientManage = () => {
  const clientManage = new ClientManage()
  clientManage.connectSocket()
}

export default initClientManage