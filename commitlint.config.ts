module.exports = {
  /*
   * @see: https://commitlint.js.org/#/reference-configuration
   * Resolve and load @commitlint/config-conventional from node_modules.
   * 使用第三方npm包
   */
  extends: ["@commitlint/config-conventional"],
  /*
   * Custom URL to show upon failure
   */
  helpUrl: 'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',
  /* 
   * @see: https://commitlint.js.org/#/reference-rules
   * Any rules defined here will override rules from @commitlint/config-conventional
   */
  rules: {
    "subject-case": [0], // subject大小写不做校验
    // git提交type必须是以下类型
    "type-enum": [
      2,
      "always",
      [
        'feat',     // 新增功能
        'fix',      // 修复缺陷
        'ui',       // 更新UI
        'docs',     // 文档变更
        'style',    // 代码格式（不影响功能，例如空格、分号等格式修正）
        'test',     // 添加疏漏测试或已有测试改动
        'refactor', // 代码重构（不包括 bug 修复、功能新增）
        'revert',   // 回滚 commit
        'perf',     // 性能优化
        'build',    // 构建流程、外部依赖变更（如升级 npm 包、修改 webpack 配置等）
        'ci',       // 修改 CI 配置、脚本
        'chore',    // 对构建过程或辅助工具和库的更改（不影响源文件、测试用例）
        'init',     // 初始提交
        'del',      // 删除代码/文件
        'release',  // 发布
      ],
    ],
  }
};