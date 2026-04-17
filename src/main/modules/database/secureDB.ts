import { createElectronSecureStore } from '@/main/modules/secureStore'
import { ipcMainService } from '@/main/ipcManager'

export const secureDB = createElectronSecureStore({
    store: {
        name: 'my-secure-db'
    },
    cacheEnabled: false,
    security: {
        encryption: {
            enabled: true,
        },
        signature: {
            enabled: true,
        },
        machineBinding: {
            enabled: true,
            strict: true
        }
    }
})

// 注册事件
export const registerSecureDBEvents = () => {
    // set
    ipcMainService.on("app:secure-db:set", (event, { key, value }) => {
        console.log('app:secure-db:set: ', key, value);
        secureDB.set(key, value)
    });

    // get
    ipcMainService.handle("app:secure-db:get", (event, { key }) => {
        const value = secureDB.get(key)
        return value
    });
}