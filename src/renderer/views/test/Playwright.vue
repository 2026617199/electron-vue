<template>
  <div class="playwright-container">
    <div class="site-list">
      <h3>网站列表</h3>
      <div>
        <div v-for="(site, index) in siteList" :key="index" @click="loadSite(site)">
          <div class="site-item">
            <el-avatar :src="site.icon" size="small"></el-avatar>
            <span>{{ site.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="webview-container">
      <webview
        v-if="currentSite"
        ref="webviewRef"
        :src="currentSite.url"
        :partition="`persist:${currentSite.partition}`"
        webpreferences="contextIsolation=false"
        @dom-ready="onWebviewReady"
      ></webview>
      
      <div class="empty-state" v-else>
        <el-icon></el-icon>
        <p>请从左侧选择一个网站</p>
      </div>
    </div>

    <div class="control-panel">
      <el-button-group>
        <el-button type="primary" @click="extractData" :disabled="!isWebviewReady">
          抓取数据
        </el-button>
        <el-button @click="saveCookies" :disabled="!isWebviewReady">
          保存 Cookie
        </el-button>
        <el-button @click="loadCookies" :disabled="!isWebviewReady">
          加载 Cookie
        </el-button>
      </el-button-group>

      <el-button @click="showDevTools" :disabled="!isWebviewReady">
        <el-icon></el-icon>
        开发者工具
      </el-button>
    </div>

    <div class="result-panel">
      <h3>抓取结果</h3>
      <pre v-if="extractedData.length">{{ JSON.stringify(extractedData, null, 2) }}</pre>
      <el-empty v-else description="暂无数据"></el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { ipcRenderService } from '@/renderer/services/ipcService'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Site {
  name: string
  url: string
  icon: string
  partition: string
  selectors: {
    items: string
    title: string
    author?: string
    link: string
    image: string
    description?: string
  }
}

// 网站列表
const siteList = ref<Site[]>([
  {
    name: '网易云音乐',
    url: 'https://music.163.com/',
    icon: 'https://s1.music.126.net/style/favicon.ico',
    partition: 'netease',
    selectors: {
      items: '.f-cb .txt',
      title: 'b',
      link: '.dec a',
      image: 'img',
      description: '.nb'
    }
  },
  {
    name: '小红书',
    url: 'https://www.xiaohongshu.com/explore',
    icon: 'https://img3.doubanio.com/favicon.ico',
    partition: 'douban',
    selectors: {
      items: '.note-item',
      title: '.title span',
      link: 'a',
      image: 'img',
      author: '.author .name',
      description: '.info'
    }
  },
  {
    name: '淘宝',
    url: 'https://www.taobao.com/wow/z/tbhome/pcsem/alimama?refpid=mm_26632258_3504122_32538762&keyword=%E6%B7%98%E5%AE%9D%E6%B7%98%E7%BD%91&bc_fl_src=tbsite_NOX36458&channelSrp=baiduSomama&bd_vid=11173709810044423154&clk1=5762c16cf29893e0b3c42a2c65c64b35&upsId=5762c16cf29893e0b3c42a2c65c64b35',
    icon: 'https://static.zhihu.com/heifetz/favicon.ico',
    partition: 'zhihu',
    selectors: {
      items: '.HotItem',
      title: '.HotItem-title',
      link: '.HotItem-content a',
      image: '.HotItem-img',
      description: '.HotItem-metrics'
    }
  },
  {
    name: '千牛',
    url: 'https://loginmyseller.taobao.com/?from=taobaoindex&f=top&style=&sub=true&redirect_url=https%3A%2F%2Fmyseller.taobao.com%2F',
    icon: 'https://img.alicdn.com/imgextra/i2/O1CN0109BlPd28fGzhhVrYk_!!6000000007959-2-tps-369-126.png',
    partition: 'qianniu',
    selectors: {
      items: '.shop-basic-info-content',
      title: '.shop-basic-info-content-main-item-value',
      link: '.HotItem-content a',
      image: '.HotItem-img',
      description: '.HotItem-metrics'
    }
  }
])

const currentSite = ref<Site | null>(null)
const webviewRef = ref<any | null>(null)
const isWebviewReady = ref(false)
const extractedData = ref<any[]>([])

// 加载网站
const loadSite = async (site: Site) => {
  currentSite.value = site
  isWebviewReady.value = false
  extractedData.value = []
  
  // 在 webview 加载完成后自动尝试加载 Cookie
  setTimeout(async () => {
    if (isWebviewReady.value) {
      await tryLoadCookies()
    }
  }, 1000) // 给予一点时间让 webview 初始化
}

// 尝试加载 Cookie，如果有的话
const tryLoadCookies = async () => {
  if (!webviewRef.value || !currentSite.value) return
  
  try {
    // 从主进程获取保存的 cookie
    const cookies = await ipcRenderService.invoke('app:load-cookies', {
      site: currentSite.value.name,
      url: currentSite.value.url
    })
    
    if (cookies) {
      // 将 cookie 注入到 webview
      await webviewRef.value.executeJavaScript(`
        document.cookie = \`${cookies}\`;
        console.log('已自动加载保存的 Cookie');
      `)
      
      // 刷新页面以确保 Cookie 生效
      await webviewRef.value.executeJavaScript(`location.reload();`)
      
      // 由于页面刷新，需要重置 isWebviewReady
      isWebviewReady.value = false
      
      ElMessage.success('已自动加载保存的 Cookie')
    }
  } catch (error) {
    console.error('自动加载 Cookie 出错:', error)
  }
}

// 定义事件处理函数，以便于添加和移除
const handleDidNavigate = () => {
  console.log('Webview 导航事件，可能是登录后跳转');
  setTimeout(autoSaveCookies, 2000);
}

const handleDidFinishLoad = () => {
  console.log('Webview 加载完成，自动保存 Cookie');
  setTimeout(autoSaveCookies, 1000);
}

const handleConsoleMessage = (event: any) => {
  console.log(`Webview Console [${event.level}]: ${event.message}`);
}

// 检测登录状态变化并自动保存 Cookie
const detectLoginStateChange = async () => {
  if (!webviewRef.value || !currentSite.value) return
  
  try {
    // 定期检查 cookie 变化，间接检测登录状态
    const intervalId = setInterval(async () => {
      if (isWebviewReady.value) {
        await autoSaveCookies()
      }
    }, 30000) // 每30秒检查一次
    
    // 也可以监听特定的网页事件来检测登录状态
    if (webviewRef.value && isWebviewReady.value) {
      await webviewRef.value.executeJavaScript(`
        // 监听表单提交事件，可能是登录表单
        document.addEventListener('submit', (event) => {
          // 延迟一点时间让登录完成
          setTimeout(() => {
            console.log('表单提交，可能发生了登录');
          }, 2000);
        });
        
        // 监听页面跳转，可能是登录后的重定向
        let lastUrl = location.href;
        const urlObserver = new MutationObserver(() => {
          if (location.href !== lastUrl) {
            lastUrl = location.href;
            console.log('页面跳转，可能是登录后的重定向');
          }
        });
        urlObserver.observe(document, { subtree: true, childList: true });
        
        // 监听本地存储变化，可能是登录状态的更新
        window.addEventListener('storage', (event) => {
          console.log('本地存储变化，可能是登录状态变化', event);
        });
      `)
      
      // 监听 webview 导航事件
      webviewRef.value.addEventListener('did-navigate', handleDidNavigate)
      
      // 监听 webview 导航完成事件
      webviewRef.value.addEventListener('did-finish-load', handleDidFinishLoad)
    }
    
    // 返回清除函数，以便在组件卸载时清除
    return () => {
      clearInterval(intervalId);
    };
  } catch (error) {
    console.error('监测登录状态出错:', error)
  }
}

// Webview 准备好
const onWebviewReady = () => {
  isWebviewReady.value = true
  ElMessage.success(`${currentSite.value?.name} 加载完成`)
  
  // 添加控制台输出监听
  if (webviewRef.value) {
    // 监听 webview 中的控制台消息
    webviewRef.value.addEventListener('console-message', handleConsoleMessage)
    
    // 在 webview 准备好后尝试加载 Cookie
    tryLoadCookies()
  }
}

// 打开开发者工具
const showDevTools = () => {
  if (webviewRef.value) {
    webviewRef.value.openDevTools()
  }
}

// 抓取数据
const extractData = async () => {
  if (!webviewRef.value || !currentSite.value) return
  
  try {
    const selectors = currentSite.value.selectors
    console.log('selectors', selectors.items)
    const result = await webviewRef.value.executeJavaScript(`
      (() => {
        try {
          const selectors1 = ${JSON.stringify(selectors)};
          console.log('selectors1', selectors1);
          const items = document.querySelectorAll('${selectors.items}');
          const data = Array.from(items).map(item => {
            return {
              title: item.querySelector('${selectors.title}')?.textContent?.trim() || '',
              link: item.querySelector('${selectors.link}')?.href || '',
              image: item.querySelector('${selectors.image}')?.src || '',
              author: item.querySelector('${selectors.author}')?.textContent?.trim() || '',
              description: item.querySelector('${selectors.description}')?.textContent?.trim() || ''
            }
          });
          console.log('提取到数据:', data);
          return data;
        } catch (error) {
          console.error("抓取数据失败:", error);
          return [];
        }
      })();
    `)
    
    extractedData.value = result || []
    console.log(extractedData.value)
    // 保存到主进程
    // if (result && result.length) {
    //   await ipcRenderService.invoke('app:save-extracted-data', {
    //     site: currentSite.value.name,
    //     data: result
    //   })
      
    //   ElMessage.success(`成功抓取 ${result.length} 条数据`)
    // } else {
    //   ElMessage.warning('未找到符合条件的数据')
    // }
  } catch (error) {
    console.error('抓取数据出错:', error)
    ElMessage.error('抓取数据失败，请查看控制台')
  }
}

// 保存 Cookie
const saveCookies = async () => {
  if (!webviewRef.value || !currentSite.value) return
  
  try {
    // 从 webview 中获取 cookie
    const cookies = await webviewRef.value.executeJavaScript(`document.cookie`)
    console.log(cookies)
    // 发送到主进程保存
    const result = await ipcRenderService.invoke('app:save-cookies', {
      site: currentSite.value.name,
      url: currentSite.value.url,
      cookies
    })
    
    if (result) {
      ElMessage.success('Cookie 保存成功')
    } else {
      ElMessage.warning('Cookie 保存失败')
    }
  } catch (error) {
    console.error('保存 Cookie 出错:', error)
    ElMessage.error('保存 Cookie 失败，请查看控制台')
  }
}

// 加载 Cookie
const loadCookies = async () => {
  if (!webviewRef.value || !currentSite.value) return
  
  try {
    // 从主进程获取保存的 cookie
    const cookies = await ipcRenderService.invoke('app:load-cookies', {
      site: currentSite.value.name,
      url: currentSite.value.url
    })
    
    if (cookies) {
      // 将 cookie 注入到 webview
      await webviewRef.value.executeJavaScript(`
        document.cookie = \`${cookies}\`;
        // 刷新页面以应用 cookie
        location.reload();
      `)
      
      ElMessage.success('Cookie 加载成功，页面已刷新')
    } else {
      ElMessage.warning('未找到保存的 Cookie')
    }
  } catch (error) {
    console.error('加载 Cookie 出错:', error)
    ElMessage.error('加载 Cookie 失败，请查看控制台')
  }
}

// 自动保存 Cookie
const autoSaveCookies = async () => {
  if (!webviewRef.value || !currentSite.value || !isWebviewReady.value) return
  
  try {
    // 从 webview 中获取 cookie
    const cookies = await webviewRef.value.executeJavaScript(`document.cookie`)
    
    // 如果有 cookie 则保存
    if (cookies && cookies.trim() !== '') {
      // 发送到主进程保存
      await ipcRenderService.invoke('app:save-cookies', {
        site: currentSite.value.name,
        url: currentSite.value.url,
        cookies
      })
      
      console.log('自动保存 Cookie 成功')
    }
  } catch (error) {
    console.error('自动保存 Cookie 出错:', error)
  }
}

// 清理所有定时器和事件监听器
let cleanupTimer: number | null = null

// 在组件卸载前清理监听器和定时器
onBeforeUnmount(() => {
  // 清除定时器
  if (cleanupTimer) {
    clearTimeout(cleanupTimer)
    cleanupTimer = null
  }
  
  // 移除所有添加的事件监听器
  if (webviewRef.value) {
    // 移除特定的事件监听器
    webviewRef.value.removeEventListener('did-navigate', handleDidNavigate)
    webviewRef.value.removeEventListener('did-finish-load', handleDidFinishLoad)
    webviewRef.value.removeEventListener('console-message', handleConsoleMessage)
    
    // 停止 webview 内容加载
    try {
      webviewRef.value.stop()
    } catch (error) {
      console.error('停止 webview 加载失败:', error)
    }
  }
})

// 组件挂载时设置事件监听
onMounted(() => {
  // 监听主进程消息
  ipcRenderService.on('app:cookie-saved', (event: any, data: any) => {
    console.log('主进程保存 Cookie 完成:', data)
  })
  
  // 在组件挂载后延迟一点启动登录状态检测
  // 确保 webview 完全加载
  cleanupTimer = setTimeout(() => {
    if (webviewRef.value) {
      detectLoginStateChange()
    }
  }, 2000) as unknown as number
})
</script>

<style scoped lang="scss">
.playwright-container {
  display: grid;
  grid-template-columns: 150px 1fr;
  grid-template-rows: 1fr auto auto;
  grid-template-areas: 
    "sidebar webview"
    "sidebar controls"
    "sidebar results";
  gap: 16px;
  height: 100vh;
  padding: 16px;
}

.site-list {
  grid-area: sidebar;
  border-right: 1px solid var(--border-color);
  padding-right: 16px;
  overflow-y: auto;
  
  h3 {
    margin-top: 0;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border-color);
  }
  
  .site-item {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    
    &:hover {
      background-color: #f5f7fa;
    }
  }
}

.webview-container {
  grid-area: webview;
  min-height: 500px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  
  webview {
    width: 100%;
    height: 100%;
    border: none;
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #909399;
    
    .el-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
  }
}

.control-panel {
  grid-area: controls;
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.result-panel {
  grid-area: results;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 16px;
  height: 300px;
  overflow: auto;
  
  h3 {
    margin-top: 0;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border-color);
  }
  
  pre {
    margin: 0;
    white-space: pre-wrap;
    font-family: monospace;
    font-size: 14px;
  }
}
</style>