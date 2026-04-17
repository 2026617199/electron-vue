import { app } from 'electron'
import ElectronStore from 'electron-store'
import * as crypto from 'crypto'
import { CipherGCMTypes } from 'node:crypto'
import { isPlainObject, cloneDeep } from 'lodash-es';

import { ipcMainService } from '@/main/ipcManager'

/**
 * electron-store本地数据库存储及加解密
 * 模块数据分治：模块对象定义进行区分 + 一个层级
 * 区分敏感信息加密字段和普通配置信息（后续通过原生模块进行加解密敏感数据）
 */
const defaultData: { [key: string]: any } = {
  app: {
    autoLogin: 0,
    autoStart: 0
  },
  theme: {
    color: '#409EFF',
    dark: 1
  },
  layout: {

  },
  userInfo: {
    username: 'admin',
    password: '123456'
  },
  phone: '123456789'
}

type StoreType = ReturnType<typeof ElectronStore>;

class AppStore {

  // 最新版本9.0.0 有bug: https://github.com/sindresorhus/electron-store/issues/276
  // 降级使用8.1.0
  store: StoreType

  ivLength = 16

  // 需要加密字段
  requiredEncryptionFields = ['userInfo', 'phone']

  // 创建一个 Cipher 对象，使用 AES-256-CBC 模式和随机生成的密钥和 IV
  algorithm = 'aes-256-cbc';
  password = 'your-encryption-key';
  encryptionKey = crypto.scryptSync(this.password, 'salt', 32) as any; // 使用 scrypt 生成密钥

  _initStore() {
    this.store = new ElectronStore({
      name: 'app',
      cwd: app.getPath('userData')
    })
    
    // 初始化默认值写入存储
    for (const key in defaultData) {
      if (!this.store.has(key)) {
        this.setEncrypted(key, defaultData[key]);
      }
    }
  }


  /**通过模块命名空间存储数据
   * 设置加密存储
   * @param key 键值
   * @param value 对象（设置对象时增量修改）
   */
  public setEncrypted(key: any, value: any) {
    if (this.requiredEncryptionFields.includes(key)) {
      let tempValue = value;
      const oldValue = this.getEncrypted(key);
      if (this.isValidJson(oldValue)) {
        const oldValueObj = JSON.parse(oldValue);
        if (isPlainObject(value) && isPlainObject(oldValueObj)) {
          // 获取旧值进行合并
          if (oldValue) {
            tempValue = Object.assign({}, oldValueObj, value);
          }
        }
        tempValue = JSON.stringify(tempValue);
        // 加密后存储
        const encryptedValue = this.encrypt(tempValue);
        this.store.set(key, encryptedValue);
      }
    } else {
      this.store.set(key, value);
    }
  };

  /**
   * 解密
   * @param key 键值
   * @returns string | null
   */
  public getEncrypted(key: string) {
    if (this.requiredEncryptionFields.includes(key)) {

      const encryptedValue = this.store.get(key);
      if (encryptedValue) {
        return this.decrypt(encryptedValue);
      }
      return null;
    } else {
      return this.store.get(key)
    }
  };

  // 普通写入
  public set(key: string, value: any): void {
    const originValue = this.get(key);
    let tempValue = value;
    if (isPlainObject(originValue)) {
      tempValue = Object.assign({}, originValue, value);
    }
    this.store.set(key, tempValue);
  }

  public get(key: string): any {
    return this.store.get(key)
  }

  public delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * 获取全部数据并解密
   * @returns 返回解密后的数据
   */
  public getAllDecryptData() {
    const data = cloneDeep(this.store.store)
    for (const key in data) {
      if (this.requiredEncryptionFields.includes(key)) {
        const decryptText = this.decrypt(data[key])
        data[key] = this.isValidJson(decryptText) ? JSON.parse(decryptText) : decryptText
      }
    }
    return data
  }

  // 基础加密
  private encrypt(text: string): any {
    const iv = crypto.randomBytes(this.ivLength) as any
    const cipher = crypto.createCipheriv(this.algorithm as CipherGCMTypes, this.encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
     // 返回 IV 和加密后的数据
    return iv.toString('hex') + ':' + encrypted;
  }

  // 解密数据
  private decrypt(encrypted: string): string {
    const textParts = encrypted.split(':');
    const ivStr = textParts.shift()
    const iv = ivStr ? Buffer.from(ivStr, 'hex') : null
    const encryptedText = textParts.join(':');
    const decipher = crypto.createDecipheriv(this.algorithm as CipherGCMTypes, this.encryptionKey, iv as any);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  isValidJson(str: string) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  registerModule(): void {
    this._initStore()
    
    // 普通数据存储
    ipcMainService.on("app:dbStore:set", (event, { key, value }) => {
      console.log('value: ', key, value);
      this.set(key, value)
    });

    // 加密数据存储数据
    ipcMainService.on("app:dbStore:set:secret", (event, { key, value }) => {
      this.setEncrypted(key, value)
    });

    // 普通数据读取
    ipcMainService.handle("app:dbStore:get", (event, { key }) => {
      return this.getEncrypted(key)
    });

    // 加密数据读取
    ipcMainService.handle("app:dbStore:get:secret", (event, { key }) => {
      return this.getEncrypted(key)
    });
    
    // 读取全部数据并解密
    ipcMainService.handle("app:dbStore:getAll", (event, { key }) => {
      return this.getAllDecryptData()
    });

    ipcMainService.handle("app:dbStore:reset", (event, { key }) => {
    });
  }

}

export const appStore = new AppStore()