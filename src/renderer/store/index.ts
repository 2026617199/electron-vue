import { useThemeSettingStore } from '@/renderer/store/themeSettingStore'
import { useSharedStore } from '@/renderer/store/sharedStore'

// 为了同一个调用入口
export default {
  useThemeSettingStore,
  useSharedStore
}