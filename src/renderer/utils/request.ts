import axios from 'axios'
import { getStorage } from '@/renderer/utils/storage'

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

const request = axios.create({
  // API 请求的默认前缀
  // 这里baseURL为本地node-api-service后端接口服务地址
  baseURL: 'http://localhost:3000',
  // baseURL: 'http://123.57.55.230:3009',
  timeout: 60000, // 请求超时时间
  //headers: {'Content-Type': 'multipart/form-data'}
})

// 异常拦截处理器
const errorHandler = (error: any) => {
  console.log('error: ', error);
  if (error.response) {
    const data = error.response.data
    if (error.response.status === 403) {
      console.error(data.message)
    }
    if (error.response.status === 401 && !(data.result && data.result.isLogin)) {
      console.log('Authorization verification failed')
    }
  }
  return Promise.reject(error)
}

request.interceptors.request.use(config => {
  const token = getStorage('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, errorHandler)

request.interceptors.response.use((response) => {
  return response.data
}, errorHandler)

export default request