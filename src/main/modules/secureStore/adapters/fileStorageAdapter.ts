import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { BaseAdapter } from './baseAdapter'

/**
 * 文件存储适配器选项
 */
type FileStorageAdapterOptions = {
    filePath?: string
}

/**
 * 文件存储适配器类
 */
class FileStorageAdapter extends BaseAdapter {
    storePath: string
    _data: any

    constructor(options: FileStorageAdapterOptions = {}) {
        super()
        this.storePath = options.filePath || path.join(app.getPath('userData'), 'secure-store.json')

        // 确保存储文件存在
        this._ensureStoreFile()
        // 加载数据
        this._loadData()
    }

    /**
     * 加载数据
     */
    private _loadData() {
        try {
            this._data = JSON.parse(fs.readFileSync(this.storePath, 'utf-8'))
        } catch (error) {
            this._data = {}
        }
    }

    /**
     * 确保存储文件存在
     */
    private _ensureStoreFile() {
        // 确保目录存在
        const dir = path.dirname(this.storePath)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }

        if (!fs.existsSync(this.storePath)) {
            fs.writeFileSync(this.storePath, '{}', 'utf-8')
        }
    }

    /**
     * 保存数据
     */
    private _saveData() {
        fs.writeFileSync(this.storePath, JSON.stringify(this._data, null, 2), 'utf-8')
    }

    /**
     * 获取存储值
     * @param key 键
     * @returns 存储值
     */
    async get(key: string): Promise<any> {
        return this._data[key]
    }
    
    /**
     * 设置存储值
     * @param key 键
     * @param value 值
     */
    async set(key: string, value: any): Promise<void> {
        this._data[key] = value
        this._saveData()
    }

    /**
     * 删除存储值
     * @param key 键
     */
    async delete(key: string): Promise<void> {
        delete this._data[key]
        this._saveData()
    }

    /**
     * 检查是否存在键
     * @param key 键
     * @returns 是否存在
     */
    async has(key: string): Promise<boolean> {
        return this._data.hasOwnProperty(key)
    }

    /**
     * 清空所有存储值
     */
    async clear(): Promise<void> {
        this._data = {}
        this._saveData()
    }

    /**
     * 获取所有存储值
     * @returns 所有存储值
     */
    async getAll(): Promise<Map<string, any>> {
        return {
            ...this._data
        }
    }
}

export { FileStorageAdapter }