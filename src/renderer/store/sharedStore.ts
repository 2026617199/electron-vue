import { defineStore } from 'pinia';
import { ipcRenderService } from '@/renderer/services/ipcService';
import { isEqual } from 'lodash-es';

// 渲染进程共享数据模块，只有需要共享的数据才在这里定义和更新
export const useSharedStore = defineStore('shared', {
  state: () => ({
    sharedData: {
      autoLogin: 0,
      autoStart: 0,
      rememberPassword: 0
    },
  }),
  actions: {
    updateSharedData(newData: any) {
      // error：An object could not be cloned
      // 数据包含了无法被序列化的属性或对象，需要深拷贝
      this.sharedData = Object.assign(this.sharedData, newData);

      // 深拷贝 sharedData 以确保它是 JSON 兼容的，否则报错
      const clonedData = JSON.parse(JSON.stringify(this.sharedData));

      // 避免死循环
      if (!isEqual(this.sharedData, newData)) {

        // 同步状态到主进程
        try {
          ipcRenderService.send('app:update-shared-state', clonedData);
        } catch (error) {
          console.log('app:error: An object could not be cloned', error);
        }
      }

    },
  },
});