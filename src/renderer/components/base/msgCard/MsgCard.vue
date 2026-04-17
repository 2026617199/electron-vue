<template>
  <div class="notification-list">
    
    <div 
        class="notification-group"
        v-for="(group, fIndex) in groupedNotifications"
        :key="group.id"
        :style="{ height: getGroupHeight(fIndex) + 'px' }"
    >
        <!-- 
            核心修改：使用 transition-group 包裹卡片 
            name="list" 对应 css 中的 .list-leave-active 等
        -->
        <transition-group name="list">
            <div 
                class="notification-card"
                v-for="(item, index) in group"
                :key="item.id"
                :style="getCardStyle(fIndex, index)"
                @click="handleGroupClick(fIndex, index)"
            >
                <!-- 删除按钮 -->
                <!-- 逻辑：如果是展开状态(expandedGroups[appName]) 或者是单张卡片，则显示删除按钮 -->
                <!-- 逻辑优化：如果是堆叠状态下的第一张，且有多张，不显示删除，防止误操作整个堆叠 -->
                <button 
                    class="delete-btn" 
                    :class="{ visible: expandedGroups[fIndex] || group.length === 1 }"
                    @click.stop="deleteMsg(item.id)"
                >
                    ×
                </button>

                <div class="card-header">
                    <div class="header-left">
                        <img :src="getIconUrl(item.icon)" class="app-icon">
                        <span class="app-name">{{ item.appName }}</span>
                    </div>
                    <span class="time">{{ item.time }}</span>
                </div>
                <div class="card-content">
                    <h3 class="title">{{ item.title }}</h3>
                    <p class="message">{{ item.message }}</p>
                </div>
                
                <!-- 堆叠数量提示 -->
                <div 
                    class="stack-count" 
                    v-if="index === 0 && group.length > 1 && !expandedGroups[fIndex]"
                >
                    +{{ group.length - 1 }}
                </div>
            </div>
        </transition-group>
    </div>

    <!-- <div v-if="Object.keys(groupedNotifications).length === 0" style="color:rgba(255,255,255,0.5); text-align:center; padding-top:20px;">
        {{ $t('COMMON.MSG_NO_NEW_NOTIFICATIONS') }}
    </div> -->
</div>
</template>

<script setup lang='ts'>
import { ref, computed, onMounted } from 'vue';
import { UseMsgHandler } from '@/renderer/hooks/useMsgHandler';
import imgTest from '../../../../assets/icon/test.png';

const CARD_HEIGHT = 93;
const EXPANDED_GAP = 8;
const STACK_OFFSET_Y = 10;
const STACK_SCALE_STEP = 0.05;

const props = defineProps<{
  groupedNotifications: any[],
}>();

const expandedGroups: any = reactive({});

const emit = defineEmits<{
  delete: [id: string]
}>();

const deleteMsg = (id: string) => {
  emit('delete', id);
};

// 3. 点击卡片逻辑
const handleGroupClick = (appName: any, index: number) => {
    const group = props.groupedNotifications[appName];
    const isExpanded = expandedGroups[appName];

    if (group.length === 1) {
        // 只有一张时点击
        return;
    }

    if (isExpanded) {
        if (index === 0) {
            expandedGroups[appName] = false; // 收起
        }
    } else {
        expandedGroups[appName] = true; // 展开
    }
};

// 6. 样式计算
const getCardStyle = (fIndex: any, index: number) => {
    const isExpanded = expandedGroups[fIndex];
    const group = props.groupedNotifications[fIndex];
    const total = group.length;

    let style: any = {
        zIndex: total - index, 
    };

    if (isExpanded) {
        style.transform = `translateY(${index * (CARD_HEIGHT + EXPANDED_GAP)}px) scale(1)`;
        style.opacity = 1;
    } else {
      // 解决堆叠时看到底层透明卡片
        style.background = 'rgba(240, 240, 240, 1)';
        if (index === 0) {
            style.transform = `translateY(0px) scale(1)`;
            style.opacity = 1;
        } else if (index === 1) {
            style.transform = `translateY(${STACK_OFFSET_Y}px) scale(${1 - STACK_SCALE_STEP})`;
            style.opacity = 0.9;
        } else if (index === 2) {
            style.transform = `translateY(${STACK_OFFSET_Y * 2}px) scale(${1 - STACK_SCALE_STEP * 2})`;
            style.opacity = 0.8; 
        } else {
            // 藏在后面
            style.transform = `translateY(${STACK_OFFSET_Y * 2}px) scale(${1 - STACK_SCALE_STEP * 2})`;
            style.opacity = 0;
            style.zIndex = -1; // 确保隐藏的在最下面
        }
    }
    return style;
};

const getGroupHeight = (fIndex: any) => {
    const isExpanded = expandedGroups[fIndex];
    const group = props.groupedNotifications[fIndex];
    if (!group) return 0;
    const count = group.length;

    if (isExpanded) {
        return count * CARD_HEIGHT + (count - 1) * EXPANDED_GAP;
    } else {
        return count > 1 ? CARD_HEIGHT + (STACK_OFFSET_Y * 1.5) : CARD_HEIGHT;
    }
};

// 动态获取图片URL
const getIconUrl = (iconPath: string) => {
    // return imgTest
    return new URL(`../../../../assets/icon/${iconPath}`, import.meta.url).href
};

</script>

<style lang="scss" scoped>
/* --- 通知列表容器 --- */
.notification-list {
    width: 100%;
    max-width: 370px;
    padding: 0 10px 100px 10px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

/* --- 通知组 --- */
.notification-group {
    position: relative;
    width: 100%;
    /* 容器高度动画：当删掉元素导致高度变化时平滑过渡 */
    transition: height 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
}

/* --- 核心：消息卡片 --- */
.notification-card {
    position: absolute; 
    top: 0; left: 0; width: 100%;
    height: 93px; 
    
    background-color: #fff;
    // background: rgba(240, 240, 240, 0.75);
    // backdrop-filter: blur(25px) saturate(180%);
    // -webkit-backdrop-filter: blur(25px) saturate(180%);
    border-radius: 18px;
    padding: 12px 14px;
    box-sizing: border-box;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    
    /* 
        常规动画: 
        当 index 变化(被重新排序)时，transform 的变化由这里过渡
    */
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
    transform-origin: center top;
    cursor: pointer;
}

/* --- 卡片内容 --- */
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
.header-left { display: flex; align-items: center; gap: 6px; }
.app-icon { width: 20px; height: 20px; border-radius: 5px; }
.app-name { font-size: 13px; color: rgba(255, 255, 255, 0.6); font-weight: 500; }
.time { font-size: 12px; color: rgba(255, 255, 255, 0.5); }
.card-content .title { font-size: 15px; font-weight: 600; margin: 0 0 2px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-content .message { font-size: 14px; font-weight: 400; margin: 0; opacity: 0.9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* 堆叠计数 */
.stack-count {
    position: absolute; top: 14px; right: 14px;
    background: rgba(255,255,255,0.15);
    font-size: 12px; padding: 2px 8px; border-radius: 10px;
    color: rgba(255,255,255,0.9);
    pointer-events: none;
    transition: opacity 0.3s;
}

/* --- 删除按钮 --- */
.delete-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(142, 142, 147, 0.3);
    border: none;
    color: rgba(255,255,255,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    padding: 0;
    z-index: 10;
    opacity: 0; /* 默认隐藏 */
    transform: scale(0.8);
    transition: all 0.2s;
}
/* 只有在展开状态 或者 只有一张卡片时 才显示删除按钮，防止误删堆叠的卡片 */
.delete-btn.visible {
    opacity: 1;
    transform: scale(1);
}
.delete-btn:hover { background: rgba(255, 59, 48, 0.8); color: white; }

/* --- Vue Transition Group 动画: 删除与新增 --- */

/* 1. 元素进入 (新增) */
.list-enter-from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9) !important;
}
/* enter-active 利用了 .notification-card 自身的 transition，无需额外定义 */

/* 2. 元素离开 (删除) - 核心部分 */
.list-leave-active {
    /* 
        离开时必须设为 absolute (本身就是)，
        并覆盖行内样式 calculated 的 transition，确保执行我们的离开动画 
    */
    transition: all 0.4s ease-in !important; 
    z-index: 0 !important; /* 确保它在离场时不会遮挡下面升上来的卡片 */
    pointer-events: none; /* 防止离场过程中被点击 */
}

.list-leave-to {
    opacity: 0 !important;
    /* 向右滑动删除的效果 */
    transform: translateX(100%) scale(0.8) !important; 
}

/* 
  3. 列表平滑重排 (Move)
  当元素被删除后，其他元素填补空位时的动画。
  Vue 会给需要移动的元素加上这个类。
*/
.list-move {
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
}
</style>