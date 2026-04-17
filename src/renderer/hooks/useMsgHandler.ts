import { ref } from 'vue';
import { ipcRenderService } from '@/renderer/services/ipcService';
import { i18n } from '@/common/locales';

export const UseMsgHandler = () => {
    const messageTemplate = [{
        id: '1',
        icon: 'test.png',
        appName: i18n.global.t('COMMON.NOTIFICATION_SYSTEM_NAME'),
        time: '2022-01-01 12:00:00',
        title: i18n.global.t('COMMON.NOTIFICATION_SYSTEM_UPDATE_TITLE'),
        message: i18n.global.t('COMMON.NOTIFICATION_SYSTEM_UPDATE_BODY')
    }]
    const msgList = ref<any[]>([]);

    const rawNotifications = ref<any[]>([
        // { id: 1, appName: '微信', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/WeChat_logo.svg/1024px-WeChat_logo.svg.png', time: '1分钟前', title: '产品经理', message: '这个需求很简单，怎么实现我不管。' },
        // { id: 2, appName: '微信', icon: 'test.png', time: '5分钟前', title: '订阅号', message: 'Vue 3.5 发布了？尤雨溪深夜发文...' },
        // { id: 4, appName: '微信', icon: 'test.png', time: '20分钟前', title: '相亲群', message: '李阿姨：我家孩子985毕业，年薪...' },
        // { id: 7, appName: '邮件', icon: 'https://upload.wikimedia.org/wikipedia/commons/4/45/IOS_Mail_icon.png', time: '1小时前', title: 'Apple ID', message: '您的账户在异地登录，请确认安全。' },
        // { id: 8, appName: '邮件', icon: 'https://upload.wikimedia.org/wikipedia/commons/4/45/IOS_Mail_icon.png', time: '2小时前', title: 'GitHub', message: 'Dependabot alert: lodash vulner...' }
    ]);


    // 2. 分组逻辑
    const groupedNotifications = computed(() => {
        const groups: any = {};
        // 为了保证删除和新增时动画平滑，我们需要保持相对稳定的排序
        // 这里假设 rawNotifications 已经是按时间排序好的
        rawNotifications.value.forEach(item => {
            if (!groups[item.appName]) {
                groups[item.appName] = [];
            }
            groups[item.appName].push(item);
        });
        return groups;
    });

    const removeNotification = (id: number | string) => {
        console.log('删除通知 ID:', id);
        // 直接从原数组过滤掉
        // Vue 的 transition-group 会检测到 key 的消失，触发 leave 动画
        rawNotifications.value = rawNotifications.value.filter(item => item.id !== id);
        console.log('删除后剩余通知:', rawNotifications.value);
        // 注意：如果删除后该组变为空，computed 会自动移除该组 key，
        // 整个 .notification-group 也会被移除
    };

    // 5. 新增逻辑
    const addNotification = (dataObj: any) => {
        rawNotifications.value.unshift(dataObj)
    };

    const toggleEnableMsgCenter = (enabled: boolean) => {
        if (enabled) {
            enableMsgCenter()
        } else {
            disableMsgCenter()
        }
    }

    const enableMsgCenter = () => {
        ipcRenderService.send('app:window:create', {
            name: 'MAC_NOTIFICATION_WINDOW'
        })
    }
    
    const disableMsgCenter = () => {
        ipcRenderService.send('app:msg:disabled', {})
    }
    /**
     * 发送随机消息通知到主进程
     * 通过IPC通信发送'app:msg:sendRandomMsg'事件
     * @returns {void} 无返回值
     */
    const sendRandomMsg = (params = {a:1}) => {
        ipcRenderService.send('app:msg:sendRandomMsg', params)
    }

    // 注册事件
    const registerMsgEvents = () => {
        ipcRenderService.on('app:add-msg', (event: any, data: any) => {
            addNotification(data)
        });
    }

    
    return {
        msgList: groupedNotifications,
        enableMsgCenter,
        toggleEnableMsgCenter,
        sendRandomMsg,
        removeNotification,
        addNotification,
        registerMsgEvents,
        disableMsgCenter
    }
}