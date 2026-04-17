<template>
  <div class="msg-center-container">
    <MsgCard
      :groupedNotifications="msgList"
      @delete="removeNotification"
    />
  </div>
</template>

<script setup lang='ts'>
import { ref, computed, watch, onMounted } from 'vue'
import { UseMsgHandler } from '@/renderer/hooks/useMsgHandler'
import MsgCard from '@/renderer/components/base/msgCard/MsgCard.vue'

const { msgList, registerMsgEvents, removeNotification } = UseMsgHandler()

watch(msgList, (newVal) => {
  console.log('msgList updated: ', newVal);
})
onMounted(() => {
  registerMsgEvents()
})
</script>

<style scoped lang='scss'>
.msg-center-container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  
  .msg-cards-wrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      
      &.expanded {
        gap: 15px;
      }
    }
    
    .msg-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: flex-start;
      gap: 12px;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
      position: relative;
      will-change: transform, width, z-index;
      
      &:hover {
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }
      
      &:active {
        transform: translateY(0) scale(0.98);
        transition: transform 0.1s;
      }
      
      &.expanded {
        cursor: default;
        
        &:hover {
          transform: translateY(0);
        }
        
        .delete-btn {
          opacity: 1;
        }
      }
      
      &:hover {
        .delete-btn {
          opacity: 0.6;
        }
      }
      
      &.unread {
        .msg-title {
          font-weight: 700;
        }
      }
      
      &.top-card {
        z-index: 10;
      }
      
      /* 添加新消息时的动画 */
      &.new-message {
        animation: bounceIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }
    
    .msg-icon {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: white;
        position: relative;
        
        .unread-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          background: #ff4757;
          border-radius: 50%;
          border: 2px solid white;
          animation: pulse 2s infinite;
        }
      }
      
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.7);
        }
        70% {
          box-shadow: 0 0 0 6px rgba(255, 71, 87, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(255, 71, 87, 0);
        }
      }
    
    .msg-content {
      flex: 1;
      min-width: 0;
      
      .msg-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 4px;
      }
      
      .msg-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
        color: #333;
        flex: 1;
        padding-right: 8px;
      }
      
      .delete-btn {
        width: 24px;
        height: 24px;
        border: none;
        background: transparent;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #999;
        transition: all 0.2s;
        flex-shrink: 0;
        opacity: 0;
        
        &:hover {
          background: rgba(0, 0, 0, 0.05);
          color: #ff4757;
        }
      }
      
      .msg-body {
        font-size: 14px;
        margin: 0 0 8px 0;
        color: #666;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      
      .msg-time {
        font-size: 12px;
        color: #999;
        display: block;
      }
    }
  }
  
  .expand-hint {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      text-align: center;
      padding: 10px 16px;
      color: #667eea;
      font-size: 14px;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      background-color: transparent;
      margin: 10px auto;
      max-width: 200px;
      
      &:hover {
        background-color: rgba(102, 126, 234, 0.1);
        transform: translateY(-1px);
      }
      
      &.expanded {
        background-color: rgba(102, 126, 234, 0.1);
      }
      
      .expand-icon {
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        flex-shrink: 0;
      }
      
      .expand-icon.rotated {
        transform: rotate(180deg);
      }
    }
  
  .unread-notice {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      background: rgba(102, 126, 234, 0.05);
      border-radius: 8px;
      margin: 10px 0;
      
      span {
        color: #667eea;
        font-size: 14px;
        font-weight: 500;
      }
      
      .mark-all-read-btn {
        padding: 6px 12px;
        border: 1px solid #667eea;
        border-radius: 6px;
        background: transparent;
        color: #667eea;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
        
        &:hover {
          background: #667eea;
          color: white;
        }
      }
    }
    
    .test-controls {
      display: flex;
      gap: 10px;
      margin-top: 20px;
      justify-content: center;
      
      .add-msg-btn,
      .clear-msg-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .add-msg-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
      }
      
      .clear-msg-btn {
        background: #f5f5f5;
        color: #666;
        
        &:hover {
          background: #e5e5e5;
        }
      }
    }
}

/* iOS风格动画 */
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  /* 弹性进入动画 */
  @keyframes bounceIn {
    0% {
      opacity: 0;
      transform: translateY(30px) scale(0.9);
    }
    60% {
      opacity: 1;
      transform: translateY(-5px) scale(1.02);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  /* 展开动画 */
  @keyframes expandIn {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  .msg-card {
    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  /* 展开时显示的额外消息卡片动画 */
  .msg-cards-wrapper.expanded .msg-card:nth-child(n+4) {
    animation: expandIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }
</style>
