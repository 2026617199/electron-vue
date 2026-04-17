import { app } from 'electron'
import { BaseAdapter } from './baseAdapter'
import ElectronStore from 'electron-store'
import * as fs from 'fs'
import * as path from 'path'
import { logger } from '@/main/modules/logger'

type StoreType = ReturnType<typeof ElectronStore>;

/**
 * Electron 存储适配器类
 * 实现了基础适配器类的方法
 */
class ElectronStoreAdapter extends BaseAdapter {
    store: StoreType
    constructor(options = {}) {
        super()
        
        // 确保配置文件存在且有效
        const storeOptions: any = {
            name: (options as any).name || 'secure-config',
            fileExtension: (options as any).fileExtension || 'json',
            ...options,
            cwd: app.getPath('userData'),
            // 不使用自带的加密
            encryptionKey: undefined
        }
        
        // 获取实际的文件路径
        const storePath = path.join(
            storeOptions.cwd || app.getPath('userData'),
            `${storeOptions.name}.${storeOptions.fileExtension || 'json'}`
        )
        
        // 检查文件是否存在且内容有效
        try {
            if (fs.existsSync(storePath)) {
                const content = fs.readFileSync(storePath, 'utf-8')
                // 如果文件存在但内容为空或无效JSON，重写为空对象
                if (!content.trim() || JSON.parse(content) === undefined) {
                    logger.info('Empty or invalid JSON content, resetting to empty object')
                    fs.writeFileSync(storePath, '{}', 'utf-8')
                }
            }
        } catch (error) {
            // 如果解析失败，重写为空对象
            if (error instanceof SyntaxError) {
                logger.error('Error parsing store file, resetting to empty object:', error)
                fs.writeFileSync(storePath, '{}', 'utf-8')
            }
        }
        
        // 现在创建ElectronStore实例
        this.store = new ElectronStore(storeOptions)
    }

    _checkFileExists() {
        const storePath = this.store.path
        if (!fs.existsSync(storePath)) {
            logger.info('Store file does not exist, creating new one: ', storePath)
            fs.writeFileSync(storePath, '{}', 'utf-8')
        }
    }

    /**
     * 获取存储值
     * @param key 键
     * @returns 存储值
     */
    get(key: string): any {
        try {
            logger.info('ElectronStoreAdapter.get: ', key)
            this._checkFileExists()
            return this.store.get(key)
        } catch (error) {
            logger.error('Error in ElectronStoreAdapter.get:', error);
            // 处理JSON解析错误，如空文件情况
            if (error instanceof SyntaxError && error.message.includes('Unexpected end of JSON input')) {
                return undefined
            }
            throw error
        }
    }
    
    /**
     * 设置存储值
     * @param key 键
     * @param value 值
     */
    async set(key: string, value: any): Promise<void> {
        this.store.set(key, value)
    }

    /**
     * 删除存储值
     * @param key 键
     */
    async delete(key: string): Promise<void> {
        this.store.delete(key)
    }

    /**
     * 检查是否存在键
     * @param key 键
     * @returns 是否存在
     */
    async has(key: string): Promise<boolean> {
        return this.store.has(key)
    }

    /**
     * 清空所有存储值
     */
    async clear(): Promise<void> {
        this.store.clear()
    }

    /**
     * 获取所有存储值
     * @returns 所有存储值
     */
    async getAll(): Promise<Map<string, any>> {
        return this.store.store
    }

    // electron-store 特有的方法
    getPath() {
        return this.store.path
    }

    onDidChange(key: string, callback: (newValue: any, oldValue: any) => void) {
        return this.store.onDidChange(key, callback)
    }
}

export { ElectronStoreAdapter }