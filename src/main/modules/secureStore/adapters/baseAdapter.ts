/**
 * 基础适配器类
 * 所有适配器必须实现这些方法
 */
class BaseAdapter {
    constructor() {

    }

    /**
     * 获取存储值
     * @param key 键
     * @returns 存储值
     */
    async get(key: string): Promise<any> {
        throw new Error('Method not implemented.');
    }
    
    /**
     * 设置存储值
     * @param key 键
     * @param value 值
     */
    async set(key: string, value: any): Promise<void> {
        throw new Error('Method not implemented.');
    }

    /**
     * 删除存储值
     * @param key 键
     */
    async delete(key: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    /**
     * 检查是否存在键
     * @param key 键
     * @returns 是否存在
     */
    async has(key: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    /**
     * 清空所有存储值
     */
    async clear(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    /**
     * 获取所有存储值
     * @returns 所有存储值
     */
    async getAll(): Promise<Map<string, any>> {
        throw new Error('Method not implemented.');
    }
}

export { BaseAdapter }