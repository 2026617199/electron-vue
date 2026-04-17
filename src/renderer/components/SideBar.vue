<template>
  <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
    <div class="sidebar-header">
        <div class="user-profile">
            <AvatarTooltip trigger="click" placement="left-start" animation="bounce"
  :duration="300" @quit="handleQuit">
                <template #trigger>
                    <div class="custom-trigger">
                        <div class="avatar">{{ $t('COMMON.AVATAR_FALLBACK') }}</div>
                    </div>
                </template>
            </AvatarTooltip>
            <div class="user-info">
                <h4>{{ $t('COMMON.SIDEBAR_APP_TITLE') }}</h4>
                <p>{{ $t('COMMON.SIDEBAR_USER_ROLE') }}</p>
            </div>
        </div>
    </div>

    <nav class="sidebar-nav pretty-scrollbar">
        <div class="nav-section">
            <div
                class="nav-item"
                :class="{ active: activeNav === navItem.value }"
                v-for="(navItem, index) in navList"
                @click="handleNavClick(navItem, index)"
            >
                <EvIcon :iconName="navItem.icon"></EvIcon>
                <span class="nav-text">{{ $t(navItem.name) }}</span>
            </div>
        </div>
    </nav>

    <div class="sidebar-footer">
        <button class="collapse-btn" @click="settingsStore.collapseSideBar">
            <el-icon><DArrowLeft /></el-icon>
            <span class="btn-text">{{ $t('COMMON.COLLAPSE_MENU') }}</span>
        </button>
    </div>
</aside>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { DArrowLeft, Moon, Minus, CloseBold } from '@element-plus/icons-vue'
import { useSettingsStore } from '@/renderer/store/settingsStore'
import EvIcon from '@/renderer/components/EvIcon.vue'
import AvatarTooltip from '@/renderer/components/AvatarTooltip.vue'

type NavItem = { name: string, value: string, icon: any }

const emit = defineEmits(['navClick'])

defineProps({
    navList: {
        type: Array as PropType<NavItem[]>,
        default: () => []
    }
})

const activeIndex = ref(0)
const settingsStore = useSettingsStore()
const sidebarCollapsed = computed(() => !settingsStore.sideBarExpanded)
const activeNav = computed(() => settingsStore.activeNav)

const handleNavClick = (item: NavItem, index: number) => {
    activeIndex.value = index
    settingsStore.setActiveNav(item.value)
    emit('navClick', item)
}

const router = useRouter()
const handleQuit = () => {
    router.push({ name: 'LOGIN' })
}
</script>


<style lang="scss" scoped>
.sidebar {
    height: 100%;
    background: var(--bg-secondary);
    backdrop-filter: blur(20px);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease,
    background-color var(--theme-transition),
    border-color var(--theme-transition);
    overflow: hidden;
}

.sidebar-header {
    padding: 15px;
    border-bottom: 1px solid var(--border-color);
}

.user-profile {
    display: flex;
    align-items: center;
    gap: 12px;

    .avatar {
        width: 44px;
        height: 44px;
        min-width: 44px;
        border-radius: 12px;
        cursor: pointer;
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 18px;
        font-weight: 600;
        position: relative;
        transition: background var(--theme-transition);
    }

    .avatar::after {
        content: '';
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 12px;
        height: 12px;
        background: var(--success);
        border-radius: 50%;
        border: 2px solid var(--bg-secondary);
    }

    .user-info {
        overflow: hidden;
        transition: opacity 0.2s;
    }
}

.sidebar.collapsed .user-info {
    opacity: 0;
    pointer-events: none;
}

.user-info h4 {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
}

.user-info p {
    font-size: 12px;
    color: var(--text-muted);
    white-space: nowrap;
}

/* 导航 */
.sidebar-nav {
    flex: 1;
    padding: 16px 12px;
    overflow-y: auto;
    overflow-x: hidden;
}

.nav-section {
    margin-bottom: 24px;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 12px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 4px;
    overflow: hidden;
    position: relative;
}

.nav-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 3px;
    height: 100%;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    transform: scaleY(0);
    transition: transform 0.3s;
}

.nav-item:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
}

.nav-item.active {
    background: var(--primary-alpha);
    color: var(--primary);
}

.nav-item.active::before {
    transform: scaleY(1);
}

.nav-item i {
    font-size: 20px;
    width: 24px;
    text-align: center;
    flex-shrink: 0;
}

.nav-item .nav-text {
    font-size: 13px;
    white-space: nowrap;
    transition: opacity 0.2s;
}

.sidebar.collapsed .nav-item .nav-text {
    opacity: 0;
    pointer-events: none;
}

.nav-item .badge {
    margin-left: auto;
    padding: 2px 8px;
    background: var(--danger);
    border-radius: 10px;
    font-size: 11px;
    color: white;
    transition: opacity 0.2s;
}

.sidebar.collapsed .nav-item .badge {
    opacity: 0;
}

/* 侧边栏底部 */
.sidebar-footer {
    padding: 16px;
    border-top: 1px solid var(--border-color);
}

.collapse-btn {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.281) 0%, 
    rgba(255, 255, 255, 0.15) 50%, 
    rgba(255, 255, 255, 0.05) 100%);
    backdrop-filter: blur(20px) saturate(180%);
    // background: var(--bg-hover);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
    overflow: hidden;
}

.collapse-btn:hover {
    background: var(--primary-alpha);
    color: var(--primary);
}

.collapse-btn i {
    // font-size: 17px;
    transition: transform 0.3s;
}

.sidebar.collapsed .collapse-btn i {
    transform: rotate(180deg);
}

.collapse-btn .btn-text {
    transition: opacity 0.2s;
    line-height: 1;
    white-space: nowrap;
}

.sidebar.collapsed .collapse-btn .btn-text {
    opacity: 0;
    position: absolute;
}
</style>
