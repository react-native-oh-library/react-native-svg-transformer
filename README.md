# react-native-svg-transformer for OpenHarmony

本项目基于 [react-native-svg-transformer](https://github.com/kristerkari/react-native-svg-transformer) v1.5.3，为 React Native 鸿蒙（OpenHarmony）适配版本。

## 定位说明

本包是**纯 JS 的构建期 Metro transformer**：在开发机 Node/Metro 打包进程中将 `.svg` 文件经 SVGR 转换为 React 组件源码，与目标运行平台无关。因此本包：

- **不含任何鸿蒙原生代码**（无 HAR / TurboModule / Fabric 组件），无需 autolinking 注册；
- 源码与上游完全一致（`index.js` / `react-native/index.js` / `expo/index.js` 三入口，零修改）；
- 唯一差异在 `package.json`：运行时渲染依赖由 `react-native-svg` 替换为鸿蒙适配版 `@react-native-ohos/react-native-svg`。

`.svg` 文件转换出的组件在运行时由鸿蒙版 react-native-svg 渲染。

## 版本对应关系

| 鸿蒙适配包版本 | 原始库版本 | 支持 RN 版本 | Autolink | 说明 |
| -------------- | ---------- | ------------ | -------- | ---- |
| 1.5.3 | 1.5.3 | 0.72+（RNOH 已验证 0.72 线） | 否（无需） | 构建期工具，平台无关 |

## 安装

本包为本地私有包（不发布 npm），通过 tgz 安装：

```bash
npm install react-native-svg-transformer@file:../react-native-svg-transformer-1.5.3.tgz
# 同时安装运行时渲染依赖（dual install）
npm install react-native-svg@15.0.0 @react-native-ohos/react-native-svg@~15.0.2
```

## 使用（metro.config.js 配置三要素）

在 RNOH 工程的 `metro.config.js` 中，于 `createHarmonyMetroConfig` 基础上叠加 SVG transformer 配置：

```js
const { mergeConfig, getDefaultConfig } = require("@react-native/metro-config");
const { createHarmonyMetroConfig } = require("@react-native-oh/react-native-harmony/metro.config");

// getDefaultConfig 在 RN 0.72 线为同步调用，resolver.sourceExts / assetExts 取其默认值
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    babelTransformerPath: require.resolve("react-native-svg-transformer/react-native"),
  },
  resolver: {
    sourceExts: [...defaultConfig.resolver.sourceExts, "svg"],
    assetExts: defaultConfig.resolver.assetExts.filter((ext) => ext !== "svg"),
  },
};

module.exports = mergeConfig(
  defaultConfig,
  createHarmonyMetroConfig({ reactNativeHarmonyPackageName: "@react-native-oh/react-native-harmony" }),
  config
);
```


随后在业务代码中直接 import SVG 文件作为组件：

```tsx
import Logo from "./logo.svg";

export function App() {
  return <Logo width={120} height={120} />;
}
```

也可在 SVG 文件所在目录放置 `.svgrrc` 自定义 SVGR 配置（与上游用法一致，向上逐级查找合并）。

## 入口说明

| 入口 | 说明 |
|------|------|
| `react-native-svg-transformer`（默认） | Expo 上游 transformer 优先，失败回退 RN |
| `react-native-svg-transformer/react-native` | 固定使用 RN 上游 transformer（**鸿蒙工程推荐**，`babelTransformerPath` 指向此入口） |
| `react-native-svg-transformer/expo` | 固定使用 Expo 上游 transformer（鸿蒙工程不使用） |

在 RNOH（RN 0.72 线）中，`react-native` 子入口会先尝试 `@react-native/metro-babel-transformer`（RN ≥ 0.73 才有），失败后回退 `metro-react-native-babel-transformer`（RN 0.72 模板 devDependencies 自带，可解析），链路已验证可用。

## 约束与限制

- 鸿蒙侧 SVG 运行时渲染由 `@react-native-ohos/react-native-svg`（基于上游 v15.0.0，满足上游 peer `>=12.0.0`）提供；
- 本包全部核心功能（SVG 转 React 组件、非 SVG 透传、SVGR 默认配置、`.svgrrc` 合并、上游 transformer 自动探测、双子入口、transformer 工厂）均为构建期能力，在鸿蒙全量可用；
- 上游 `files` 字段外的开发配置（eslint 等）不随包发布。

## 快速验证（运行 Example）

完整步骤、测试场景与常见问题见 [example/README.md](./example/README.md)。摘要：

```bash
# 仓库根目录执行（自动 pack tgz → 安装依赖 → bundle → assembleHap）
python .claude/skills/tool-ohos-plugin-repo/tool/rn.py build hap --full --plugin-root .
```

Example 覆盖 4 个场景：默认配置导入（原始尺寸 + viewBox 保留）、props 覆盖尺寸、复杂多元素 SVG、`.svgrrc` 自定义配置（`dimensions:false` + `replaceAttrValues` 颜色参数化），安装 HAP 后即可目视验证 `.svg` 文件渲染。

## 开源协议

MIT，基于[上游 LICENSE](https://github.com/kristerkari/react-native-svg-transformer/blob/master/LICENSE)，详见 [LICENSE](./LICENSE)。
