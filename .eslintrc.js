// https://eslint.org/docs/user-guide/configuring

module.exports = {
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:vue/recommended",
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ['@typescript-eslint'],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    'no-undef': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': 'error',
    'no-unused-vars': 'off',
    "no-dupe-keys": 2, //在创建对象字面量时不允许键重复 {a:1,a:1}
    "no-use-before-define": 2, //未定义前不能使用
    "no-var": 2, //禁用var，用let和const代替
    "no-with": 2, //禁用with
    "no-dupe-args": 2, //函数参数不能重复
    "no-duplicate-case": 2, //switch中的case标签不能重复
    "comma-spacing": 'error', //逗号前后的空格
    "no-empty": 2, //块语句中的内容不能为空
    "eqeqeq": 2, //必须使用全等
    "no-eval": 2, //禁止使用eval
    "no-ex-assign": 2, //禁止给catch语句中的异常参数赋值
    "no-extra-parens": 2, //禁止非必要的括号
    "no-multi-spaces": 1, //不能用多余的空格
    "no-redeclare": 2, //禁止重复声明变量
    "default-case": 2, //switch语句最后必须有default
    "generator-star-spacing": 0, //生成器函数*的前后空格
    "indent": [2, 2], //缩进风格
    "semi-spacing": [0, {"before": false, "after": true}], //分号前后空格
    "key-spacing": [0, { "beforeColon": false, "afterColon": true }], //对象字面量中冒号的前后空格
    "no-multiple-empty-lines": [1, {"max": 2}], //空行最多不能超过2行
    'arrow-spacing': [
      2,
      { //强制箭头函前后都使用空格
        'before': true,
        'after': true
      }
    ],
    // 关闭驼峰命名规则
    'vue/multi-word-component-names': 0,
  }
}