import * as crypto from 'crypto'
import { MachineFingerprint } from './machineFingerprint'
import { logger } from '@/main/modules/logger'

type SecurityMiddlewareOptions = {
    encryption: {
        enabled: boolean;
        key?: Buffer;
        algorithm: string;
    };
    signature: {
        enabled: boolean;
        algorithm: string;
        key: Buffer;
    };
    machineBinding: {
        enabled: boolean;
        strict: boolean;
    };
}

class SecurityMiddleware {

    options: any

    _fingerprint: MachineFingerprintComponents

    constructor(options: SecurityMiddlewareOptions) {
        this.options = {
            // 加密配置
            encryption: {
                enabled: options.encryption.enabled,
                key: options.encryption?.key || this._deviceDefaultKey(),
                algorithm: options.encryption.algorithm || 'aes-256-gcm'
            },
            // 签名配置
            signature: {
                enabled: options.signature.enabled ?? true,
                algorithm: options.signature.algorithm || 'sha256'
            },
            // 机器绑定配置
            machineBinding: {
                enabled: options.machineBinding.enabled ?? true,
                strict: options.machineBinding.strict ?? true
            }
        }

        this._fingerprint = null as any
    }

    _deviceDefaultKey() {
        return crypto.pbkdf2Sync(
            'default-app-secret',
            process.platform + process.arch,
            100000,
            32,
            'sha256'
        )
    }

    getFingerprint() {
        if (!this._fingerprint) {
            this._fingerprint = new MachineFingerprint().getFingerprint()
        }
        return this._fingerprint
    }

    _encrypt(plaintext: string) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(
            this.options.encryption.algorithm,
            this.options.encryption.key,
            iv as Uint8Array
        );
        let encrypted = Buffer.concat([
            cipher.update(plaintext, 'utf8') as Uint8Array,
            cipher.final() as Uint8Array
        ]);
        const authTag = cipher.getAuthTag();

        return Buffer.concat([iv as any, authTag as any, encrypted as any]).toString('base64');
    }

    _decrypt(encryptedBase64: string) {
        const buff = Buffer.from(encryptedBase64, 'base64');
        const iv = buff.slice(0, 16);
        const authTag = buff.slice(16, 32);
        const encrypted = buff.slice(32) as Uint8Array;

        const decipher = crypto.createDecipheriv(
            this.options.encryption.algorithm,
            this.options.encryption.key,
            iv as Uint8Array
        );
        decipher.setAuthTag(authTag as Uint8Array);

        let plaintext = Buffer.concat([
            decipher.update(encrypted) as Uint8Array,
            decipher.final() as Uint8Array
        ]).toString('utf8');
        
        return plaintext;
    }

    _sign(payload: string) {
        const hmac = crypto.createHmac(this.options.signature.algorithm, this.options.encryption.key);
        hmac.update(payload);
        return hmac.digest('hex');
    }

    _verifySignature(payload: string, signature: string) {
        logger.info('is verifying signature...');
        const expectedSignature = this._sign(payload);
        // 为什么要用crypto.timingSafeEqual？
        // 因为如果用普通的比较运算符，攻击者可以通过对比签名的不同字符来推测出密钥，这被称为时间侧信道攻击。
        // 为什么要用crypto.timingSafeEqual？
        // 因为如果直接用===比较，会暴露签名的长度信息，导致攻击者可以通过时间差异来判断签名是否正确
        return crypto.timingSafeEqual(Buffer.from(signature, 'hex') as Uint8Array, Buffer.from(expectedSignature, 'hex') as Uint8Array);
    }

    // 包装数据：加密 + 签名 + 机器绑定
    wrapData(data: any) {
        let wrapped = {
            data: data,
            fingerprint: null as any,
            timestamp: Date.now()
        }

        // 1、添加机器指纹
        if (this.options.machineBinding.enabled) {
            wrapped.fingerprint = this.getFingerprint();
        }

        // 2、序列化后再加密
        let payload = JSON.stringify(wrapped)

        // 3、加密
        if (this.options.encryption.enabled) {
            payload = this._encrypt(payload);
        }

        // 签名
        let result = {
            payload,
            signature: null as any
        }
        if (this.options.signature.enabled) {
            result.signature = this._sign(payload);
        }

        return result
    }
    
    unwrapData(wrapped: any) {
        // 开始验证签名
        logger.info('is unwrap data:', wrapped);
        
        // 处理空数据情况
        if (!wrapped) {
            return {
                success: false,
                error: 'EMPTY_DATA'
            }
        }
        
        // 处理无效数据格式
        if (typeof wrapped !== 'object' || Array.isArray(wrapped)) {
            return {
                success: false,
                error: 'INVALID_DATA_FORMAT'
            }
        }
        
        // 1、验证签名
        if (this.options.signature.enabled) {
            if (!wrapped.signature) {
                return {
                    success: false,
                    error: 'MISSING_SIGNATURE'
                }
            }
            if (!this._verifySignature(wrapped.payload, wrapped.signature)) {
                return {
                    success: false,
                    error: 'INVALID_SIGNATURE'
                }
            }
        }

        // 2、解密
        let payload = wrapped.payload;
        if (this.options.encryption.enabled) {
            try {
                payload = this._decrypt(payload);
            } catch (error: any) {
                return {
                    success: false,
                    error: 'DECRYPTION_FAILED',
                    message: error.message
                }
            }
        }
        // 3、解析数据
        let wrappedData
        try {
            wrappedData = JSON.parse(payload);
        } catch (error) {
            return {
                success: false,
                error: 'PARSING_FAILED'
            }
        }

        // 4、验证机器指纹
        if (this.options.machineBinding.enabled) {
            const currentFingerprint: any = this.getFingerprint();
            // console.log('current machine fingerprint: ', currentFingerprint)
            
            // 检查是否为严格模式
            if (this.options.machineBinding.strict) {
                logger.info('strict machine binding mode enabled');
                // 严格模式下需要所有组件完全匹配
                const isMatch = Object.keys(wrappedData.fingerprint).every(key =>
                    wrappedData.fingerprint[key] === currentFingerprint[key]);
                if (!isMatch) {
                    return {
                        success: false,
                        error: 'MACHINE_FINGERPRINT_MISMATCH'
                    }
                }
            } else {
                // 非严格模式下，仅检查部分组件是否匹配
                const matchedComponents = Object.keys(wrappedData.fingerprint).filter(key =>
                    wrappedData.fingerprint[key] === currentFingerprint[key]);
                if (matchedComponents.length === 0) {
                    return {
                        success: false,
                        error: 'MACHINE_FINGERPRINT_MISMATCH'
                    }
                }
                // 非严格模式下记录警告
                console.warn('Non-strict machine binding mismatch. Matched components:', matchedComponents);
            }
        }
        return {
            success: true,
            data: wrappedData.data,
            metadata: {
                timestamp: wrappedData.timestamp
            }
        }
    }
}

export {
    SecurityMiddleware
}