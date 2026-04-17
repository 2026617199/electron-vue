import { onMounted, onUnmounted } from 'vue'

/**
 * 组合式函数
 * 使用 Vue 的生命周期钩子添加和移除事件监听器
 *
 * 该函数旨在提供一种优雅的方式来管理事件监听器，避免在组件卸载后仍保留事件监听器，
 * 从而可能导致内存泄漏的问题；通过结合 Vue 的 onMounted 和 onUnmounted 钩子，
 * 在组件挂载时添加事件监听器，并在组件卸载时移除它
 *
 * @param target 目标元素或对象；可以是 DOM 元素或其他支持 addEventListener 的对象
 * @param event 要监听的事件名称
 * @param callback 事件被触发时执行的回调函数
 */
export function useEventListener(target: HTMLElement | Window | Document, event: string, callback: Function): void {
  // 也可以用字符串形式的 CSS 选择器来寻找目标 DOM 元素
  onMounted(() => target.addEventListener(event, callback as EventListenerOrEventListenerObject))
  onUnmounted(() => target.removeEventListener(event, callback as EventListenerOrEventListenerObject))
}