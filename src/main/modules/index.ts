import { appStore } from '@/main/modules/database/index'
import { default as TestEvent } from './testEvent'
import { registerWindowEvents } from './windowManage/index'
import { screenShotModule } from '@/main/modules/screenShot/index'
import { registerLocaleEventHander } from '@/main/modules/locale/index'
import { globalState } from './globalState/index'
import { musicVisualization } from '@/main/modules/musicVisualization/musicVisualization'
import { msgCenterModule } from '@/main/modules/msgCenter/index'

/**
 * 注册所有功能模块的事件监听
 */
export const registerModulesEventHander = () => {
  globalState.registerModule(),
  appStore.registerModule(),
  musicVisualization.initialize(),
  registerWindowEvents(),
  registerLocaleEventHander(),
  screenShotModule.registerScreenShotEvents(),
  msgCenterModule.registerHandlerEvents(),
  // Database()
  // 测试使用
  TestEvent()
}