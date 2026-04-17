<template>
  <div class="dashboard-container">
    <el-tabs type="border-card" class="dashboard-tabs">
      <el-tab-pane :label="$t('COMPONENTS_DEMO.TAB_TILT_3D')">
        <div class="pannel-item" data-tilt>{{ $t('COMPONENTS_DEMO.TAB_TILT_DESC') }}</div>
      </el-tab-pane>
      <el-tab-pane :label="$t('COMPONENTS_DEMO.TAB_CARD')">
        <CardInfo />
      </el-tab-pane>
      <el-tab-pane :label="$t('COMPONENTS_DEMO.TAB_INPUT')">
        <HeroInput v-model="testInput">
          <template v-slot:afterIcon>
            <el-icon color="var(--ep-color-primary)">
              <User/>
            </el-icon>
          </template>
        </HeroInput>
      </el-tab-pane>
      <el-tab-pane :label="$t('COMPONENTS_DEMO.TAB_MUSIC')">
        <MusicCard />
      </el-tab-pane>
      <el-tab-pane :label="$t('COMPONENTS_DEMO.TAB_BORDER')">
        <BorderCard />
      </el-tab-pane>
      <el-tab-pane :label="$t('COMPONENTS_DEMO.TAB_HOVER')">
        <HoverCard />
      </el-tab-pane>
      <el-tab-pane :label="$t('COMPONENTS_DEMO.TAB_RICHTEXT')">
        <RickText>
        </RickText>
      </el-tab-pane>
      <el-tab-pane :label="$t('COMPONENTS_DEMO.TAB_TEXT_ANIM')">
        <div class="container">
          <div class="hero-text">Electron App</div>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('COMPONENTS_DEMO.TAB_VERIFY')">
        <VerifyCodeInput v-model="testInput" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang='ts'>
import VanillaTilt from 'vanilla-tilt';
import HeroInput from '@/renderer/components/base/heroInput/HeroInput.vue'
import CardInfo from '@/renderer/components/base/cardInfo/CardInfo.vue'
import MusicCard from '@/renderer/components/MusicCard.vue'
import BorderCard from '@/renderer/components/BorderCard.vue'
import HoverCard from '@/renderer/components/HoverCard.vue'
import { User, View, Hide, Upload } from '@element-plus/icons-vue'
import RickText from '@/renderer/components/base/richText/RickText.vue';
import VerifyCodeInput from '@/renderer/components/base/verifyCodeInput/VerifyCodeInput.vue';

const testInput = ref('')

onMounted(() => {
  const element = document.querySelector(".pannel-item") as HTMLElement
  VanillaTilt.init(element)
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 10px;
  .dashboard-tabs {
  }
  .pannel-item {
    display: inline-block;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 3px;
    width: 200px;
    height: 200px;
    background-image: linear-gradient(150deg, #5a00ff 0%, #ff1ff7 100%, #ff1ff7 100%);
  }
}

// 
.container {
  margin-top: 50px;
  text-align: center;
  background-color: #fff;
  filter: contrast(6);
}
.hero-text {
  font-size: 100px;
  letter-spacing: -50px;
  color: #000;
  animation: showup 1s linear forwards;
}
@keyframes showup {
  0% {
    filter: blur(10px);
  }
  100% {
    letter-spacing: 10px;
    filter: blur(2px);
  }
}

</style>
