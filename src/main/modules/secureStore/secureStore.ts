import { ElectronStoreAdapter } from './adapters/electronStoreAdapter'
import { SecurityMiddleware } from './security/securityMiddleware'
import { logger } from '@/main/modules/logger'

type SecureStoreOptions = {
    adapter?: any
    store?: any
    security?: any
    enableSecurity?: boolean
    cacheEnabled?: boolean
}

class SecureStore {
    adapter: any
    securityMiddleware: any
    enableSecurity: any
    _cache: Map<string, any>
    cacheEnabled: boolean
    
    constructor(options: SecureStoreOptions = {}) {

        // 是否启用安全功能
        this.enableSecurity = options.enableSecurity ?? true

        // 存储适配器，默认使用electron-store
        this.adapter = options.adapter || new ElectronStoreAdapter(options.store)
        
        // 数据安全中间件
        this.securityMiddleware = new SecurityMiddleware(options.security)

        // 缓存
        this.cacheEnabled = options.cacheEnabled ?? true
        this._cache = new Map()
    }

    // 获取值
    get(key: string, defaultValue = undefined) {
        try {
            // 检查缓存是否启用且键值存在
            if (this.cacheEnabled && this._cache.has(key)) {
                return this._cache.get(key)
            }

            // 从适配器获取值
            const storedValue = this.adapter.get(key)
            logger.info('secureStore get: ', key, storedValue);
            if (storedValue === undefined || storedValue === null) {
                return defaultValue
            }

            // 没有加密直接返回
            if (!this.enableSecurity) {
                return storedValue
            }
            // 有加密则解包数据（验证+解密）
            const result = this.securityMiddleware.unwrapData(storedValue)
            if (!result.success) {
                // 返回错误类型
                return result
            }
            // 验证通过，缓存数据
            if (this.cacheEnabled) {
                this._cache.set(key, result.data)
            }

            // 解密成功，返回解密后的数据
            return result.data
        } catch (error) {
            logger.error('Error in SecureStore.get:', error)
            // 发生错误时返回默认值
            return defaultValue
        }
    }

    // 设置值
    set(key: string, value: any) {
        let toStoreValue = value
        if (this.enableSecurity) {
            toStoreValue = this.securityMiddleware.wrapData(value)
        }
        // 存储到适配器
        this.adapter.set(key, toStoreValue)

        // 缓存数据 - 缓存原始值而不是加密值
        if (this.cacheEnabled) {
            this._cache.set(key, value)
        }
    }

    // 删除值
    delete(key: string) {
        if (this.cacheEnabled) {
            this._cache.delete(key)
        }
        this.adapter.delete(key)
    }

    // 判断值是否存在
    has(key: string) {
        return this._cache.has(key) || this.adapter.has(key)
    }

    // 清除缓存数据
    clearCache() {
        this._cache.clear()
    }

    // 获取底层适配器，用于访问特定功能
    getAdapter() {
        return this.adapter
    }
}

export {
    SecureStore
}