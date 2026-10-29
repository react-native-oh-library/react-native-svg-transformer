/**
 * This source code is licensed under the MIT license found in the
 * LICENSE-MIT file in the root directory of this source tree.
 */

const {mergeConfig, getDefaultConfig} = require('@react-native/metro-config');
const {createHarmonyMetroConfig} = require('@react-native-oh/react-native-harmony/metro.config');

// RN 0.72 线 getDefaultConfig 为同步实现；先合并鸿蒙默认配置，
// 再基于合并结果调整 svg 扩展名，避免覆盖 createHarmonyMetroConfig 的 resolver 设定
const baseConfig = mergeConfig(
  getDefaultConfig(__dirname),
  createHarmonyMetroConfig({
    reactNativeHarmonyPackageName: '@react-native-oh/react-native-harmony',
  }),
);

/**
 * react-native-svg-transformer 集成三要素：
 * 1. transformer.babelTransformerPath 指向 @react-native-ohos/react-native-svg-transformer/react-native 子入口
 * 2. resolver.sourceExts 追加 'svg'（.svg 作为源码模块交给 transformer 转换）
 * 3. resolver.assetExts 移除 'svg'（不再按静态资源打包）
 */
const config = {
  transformer: {
    babelTransformerPath: require.resolve(
      '@react-native-ohos/react-native-svg-transformer/react-native',
    ),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    assetExts: baseConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...baseConfig.resolver.sourceExts, 'svg'],
  },
};

module.exports = mergeConfig(baseConfig, config);
