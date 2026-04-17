<template>
  <div>
    <p>普通数据存储</p>
    <el-input
      v-model="stateValue"
      style="max-width: 600px;margin: 20px 0;"
      placeholder="Please input 0 / 1"
      class="input-with-select"
    >
      <template #prepend>
        <el-select v-model="stateKey" placeholder="Select" style="width: 200px">
          <el-option label="自动登录-autoLogin" value="autoLogin" />
          <el-option label="开机自启动-autoStart" value="autoStart" />
        </el-select>
      </template>
      <template #append>
        <el-button @click="handleStore()">写入数据</el-button>
      </template>
    </el-input>
    <!--  -->
    <el-input
      v-model="phoneNum"
      style="max-width: 600px;margin: 20px 0;"
      placeholder="phoneNum"
      class="input-with-select"
    >
      <template #append>
        <el-button @click="handlePhoneStore()">普通数据写入</el-button>
      </template>
    </el-input>
    <!--  -->
    <el-input
      v-model="username"
      style="max-width: 600px;margin: 20px 0;"
      placeholder="username"
      class="input-with-select"
    >
      <template #append>
        <el-button @click="handleUserStore()">加密数据写入(字符串和对象)</el-button>
      </template>
    </el-input>
    <!--  -->
    <br>
    <el-button @click="handleReadAllStore()">读取全部数据</el-button>
    <el-button @click="handleResetStore()">恢复默认数据</el-button>
    <pre>{{ shareData }}</pre>
    <p>升级版本地数据安全存储测试（防篡改防复制）</p>
    <!--  -->
    <el-input
      v-model="secretValue"
      style="max-width: 600px;margin: 20px 0;"
      placeholder="secretValue"
      class="input-with-select"
    >
      <template #append>
        <el-button @click="handleSecretStore()">加密数据写入</el-button>
      </template>
    </el-input>
    <!--  -->
    <el-button @click="handleSecretReadStore()">读取加密数据</el-button>
    <div>{{ secureDataRead.error ? $t(`COMMON.${secureDataRead.error}`) : secureDataRead }}</div>
  </div>
</template>

<script setup lang='ts'>
import { ref, reactive } from 'vue'
import { ipcRenderService } from '@/renderer/services/ipcService';

const stateKey = ref('autoLogin')
const stateValue = ref('1')
const phoneNum = ref('')
const secretValue = ref('')
const username = ref('')

const shareData = reactive({})

function handleStore() {
  ipcRenderService.send('app:dbStore:set', {
    key: 'app',
    value: {
      [stateKey.value]: stateValue.value
    }
  })
  // 支持对象
  // ipcRenderService.send('app:dbStore:set', {
  //   key: 'app',
  //   value: {
  //     aaa: 123
  //   }
  // })
}

function handlePhoneStore() {
  ipcRenderService.send('app:dbStore:set:secret', {
    key: 'phone',
    value: phoneNum.value
  })
}
function handleUserStore() {
  ipcRenderService.send('app:dbStore:set:secret', {
    key: 'userInfo',
    value: {
      username: username.value
    }
  })
}
function handleResetStore() {
  ipcRenderService.send('app:dbStore:reset')
}

async function handleReadAllStore() {
  const data = await ipcRenderService.invoke('app:dbStore:getAll', {})
  console.log('data: ', data);
  Object.assign(shareData, data)
}

function handleSecretStore() {
  ipcRenderService.send('app:secure-db:set', {
    key: 'secret',
    // value: {
    //   aa: 12,
    //   list: [1, 2, 3],
    //   obj: {
    //     a: 123
    //   },
    //   bool: true
    // }
    value: secretValue.value
  })
}

const secureDataRead = ref<any>({})
async function handleSecretReadStore() {
  const value = await ipcRenderService.invoke('app:secure-db:get', {
    key: 'secret'
  })
  console.log('handleSecretReadStore: ', value);
  secureDataRead.value = value
  if (!value) {
    secureDataRead.value = '数据不存在'
    return
  }
  if (value.success) {
    secureDataRead.value = value.error
  } else {
    secureDataRead.value = value
  }
}
</script>

<style lang="scss" scoped>
</style>
