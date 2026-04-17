import { SecureStore } from './secureStore'
import { ElectronStoreAdapter } from './adapters/electronStoreAdapter'
import { FileStorageAdapter } from './adapters/fileStorageAdapter'

type SecureStoreOptions = {
    store: ElectronStoreType
    enableSecurity?: boolean
    cacheEnabled?: boolean
    security?: any
}

type FileSecureStoreOptions = {
    file: string
} & SecureStoreOptions

// 创建使用electron-store的安全存储
function createElectronSecureStore(options: SecureStoreOptions) {   
    return new SecureStore({
        adapter: new ElectronStoreAdapter(options.store),
        security: options.security,
        enableSecurity: options.enableSecurity ?? true,
        cacheEnabled: options.cacheEnabled ?? true,
        ...options
    })
}

// 创建文件存储的安全存储
function createFileSecureStore(options: FileSecureStoreOptions) {   
    return new SecureStore({
        adapter: new FileStorageAdapter({ filePath: options.file }),
        security: options.security,
        enableSecurity: options.enableSecurity ?? true,
        cacheEnabled: options.cacheEnabled ?? true,
        ...options
    })
}

export {
    SecureStore,
    // 工厂函数
    createElectronSecureStore,
    createFileSecureStore,
    // 适配器
    ElectronStoreAdapter,
    FileStorageAdapter
}