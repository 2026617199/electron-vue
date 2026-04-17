import { app } from 'electron';
import * as path from 'path';
// import log4js from 'log4js';
// log4js 模块可能使用了 CommonJS 的导出方式, 使用命名空间导入
import * as log4js from 'log4js';

// 获取应用数据目录
const userDataPath = app.getPath('userData');
// 日志路径为：\logs\application-gui.log
const logPath = process.env.NODE_ENV === 'development' ? path.join(process.cwd(), 'logs', 'application-gui.log') : path.join(userDataPath, 'logs', 'application-gui.log');

log4js.configure({
  // 日志输出
  appenders: {
    out: { type: "stdout" },
    app: {
      type: "file",
      // 解决直接写日志文件名导致日志文件存储c或其他盘的问题
      // 确保在所有环境下日志文件都被正确存储在应用数据目录中
      filename: logPath,
      // filename: "application-gui.log", // 部分情况写文件会出现问题
      maxLogSize: 20 * 1024 * 1024,
      backups: 3,
      compress: false,
      encoding: "utf-8",
      layout: {
        type: "pattern",
        pattern: "[%d{yyyy-MM-dd hh:mm:ss}] [%p] %m"
      },
      keepFileExt: true
    }
  },
  // 定义日志的类别
  categories: {
    default: {
      appenders: ["out", "app"],
      level: "debug"
    }
  }
});


// const trace = (content: string) => {
//   let logger = log4js.getLogger();
//   logger.level = levels.trace;
//   logger.trace(content);
// }

// const debug = (content: string) => {
//   let logger = log4js.getLogger();
//   logger.level = levels.debug;
//   logger.debug(content);
// }

// const info = (content: string) => {
//   let logger = log4js.getLogger();
//   logger.level = levels.info;
//   logger.info(content);
// }

// const warn = (content: string) => {
//   let logger = log4js.getLogger();
//   logger.level = levels.warn;
//   logger.warn(content);
// }

// const error = (content: string) => {
//   let logger = log4js.getLogger();
//   logger.level = levels.error;
//   logger.error(content);
// }

// const fatal = (content: string) => {
//   let logger = log4js.getLogger();
//   logger.level = levels.fatal;
//   logger.fatal(content);
// }

export let logger = log4js.getLogger();


const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
}
/**
 * 通用的终端打印功能
 * @param color 颜色
 * @param content 内容
 */
export const printLog = (color: string, content: string) => {
  console.log(`${colors[color] || colors.reset}${content}${colors.reset}`);
}