// https://www.electron.build/configuration
module.exports = {
  productName: "Electron Vue Application",
  icon: "resources/256x256.ico",
  copyright: "copyright@frontierFlight",
  directories: {
    output: "release/${version}",
    buildResources: "build"
  },
  publish: {
    provider: "github",
    owner: "2026617199",
    repo: "electron-vue"
  },
  files: [
    'dist',
    'dist-electron',
    'resources/**/*',
    "!**/package-lock.json"
  ],
  extraMetadata: {
    main: "dist-electron/main/index.prod.js"
  },
  afterPack: "./build/scripts/afterPack.js",
  asar: true,
  compression: "maximum",
  win: {
    icon: 'resources/256x256.ico',
    target: [
      {
        target: "nsis",
        arch: ['x64']
      }
    ],
  },
  mac: {
    target: [
      {
        target: "dmg"
      }
    ],
  },
  extraResources: [
    {
      from: "build/lib",
      to: "lib",
      filter: ["**/*"] // 包含所有文件
    }
  ],
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: "always",
    createStartMenuShortcut: true,
    installerIcon: "resources/256x256.ico",
    uninstallerIcon: "resources/256x256.ico",
    displayLanguageSelector: true,
    perMachine: false,
    shortcutName: "electronVueApp",
    deleteAppDataOnUninstall: false,
    artifactName: "${productName}-${os}-${arch}-Setup-${version}.${ext}",
    include: "build/scripts/installer.nsh"
  }
}