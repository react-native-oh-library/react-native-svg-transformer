// RN 0.74+ 需使用 @react-native/babel-preset（经 hermes-parser 解析，
// 支持 Libraries 中 TS 迁移产生的 `as` 断言等混合语法）；
// RN 0.72 换装环境（package_72.json）未安装该包，回退旧 preset。
let preset;
try {
  preset = require.resolve('@react-native/babel-preset');
} catch {
  preset = 'module:metro-react-native-babel-preset';
}

module.exports = {
  presets: [preset],
};
