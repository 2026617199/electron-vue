// 使用require语法替代import，避免TypeScript配置问题
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// 设置静态文件目录为 release 文件夹
const updatesDir = path.join(__dirname, 'release');
app.use('/updates', express.static(updatesDir));

// 创建latest.yml文件（electron-updater期望的格式）
// const latestYmlContent = `
// version: 2.0.0
// files:
//   - url: YourApp-win-2.0.0.zip
//     sha512: 8Vg0bM3iP5aJ2kL7cN9dR1fE4gT6hY8jU0iK2oM4qN6rP8sT0vW2yZ4xB6nM8lK
//     size: 12345678
// path: YourApp-win-2.0.0.zip
// sha512: 8Vg0bM3iP5aJ2kL7cN9dR1fE4gT6hY8jU0iK2oM4qN6rP8sT0vW2yZ4xB6nM8lK
// releaseDate: '2024-03-20'`;

// fs.writeFileSync(path.join(updatesDir, 'latest.yml'), latestYmlContent);

app.get('/updates', (req, res) => {
  res.redirect('/updates/latest.yml');
});

const updateServerPort = 8099;
app.listen(updateServerPort, () => {
    console.log(`Update server running on port ${updateServerPort}`);
    console.log(`\x1b[32m${`已启动应用更新服务: http://localhost:${updateServerPort}/updates/latest`}\x1b[0m`);
    console.log('静态文件目录', updatesDir);
});