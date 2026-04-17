import { crashReporter } from "electron"

/**
 * 最好在 app.on('ready') 之前调用
 * 测试时可以通过使用process.crash()生成一个崩溃来测试崩溃报告器。
 */
class CrashMonitor {
  recordCrashReporter() {
    // 崩溃报告在上传之前会临时存放在应用程序的用户数据目录下（Windows 和 MacOS 上文件夹名为 "Crashpad"，Linux 上是 "Crash Reports"）
    crashReporter.start({
      productName: "electron-app",
      companyName: "my-company",
      submitURL: "",
      uploadToServer: false,
    })
  }
}


export const crashMonitor = new CrashMonitor()