> 文档模板：v0.4.2

<p align="center">
  <h1 align="center"> <code>react-native-svg-transformer</code> </h1>
</p>

本项目基于 [react-native-svg-transformer](https://github.com/kristerkari/react-native-svg-transformer) v1.5.3 开发，为其鸿蒙（OpenHarmony）适配版本。版本所属关系如下：

| 三方库名称 | 三方库版本（npm地址） | 发布信息 | 支持RN版本 | Autolink | 编译API版本 | 社区基线版本 | 源码地址 |
| ---------- | -------------------- | -------- | ---------- | -------- | ----------- | ------------ | -------- |
| react-native-svg-transformer | [~ 1.5.3](https://www.npmjs.com/package/react-native-svg-transformer) | /（本地 tgz 分发，不发布 npm） | 0.72.* /0.77.* / 0.82.*  / 0.84.*  ） | 否（无需） | /（纯 JS 包） | 1.5.3 | [master](https://github.com/react-native-oh-library/react-native-svg-transformer) |

## 简介

react-native-svg-transformer 用于在 React Native 中将 `.svg` 文件经 SVGR 转换为 React 组件。本包是**纯 JS 的构建期 Metro transformer**：在开发机 Node/Metro 打包进程中完成转换，与目标运行平台无关。

## 下载安装

进入到工程目录并输入以下命令（本包为本地私有包，不发布 npm，通过 tgz 安装）：

**npm**

```bash
npm install react-native-svg-transformer@file:../react-native-svg-transformer-1.5.3.tgz
# 同时安装运行时渲染依赖（dual install）
npm install react-native-svg@15.0.0 @react-native-ohos/react-native-svg@~15.0.2
```

## 依赖关系说明

本包自身不含鸿蒙原生代码；但 `.svg` 转换出的组件在运行时由 `@react-native-ohos/react-native-svg` 渲染，业务工程需根据 RN 框架版本引入对应鸿蒙化依赖库，版本对应关系如下：

| RN 框架版本 | 鸿蒙化依赖库 | 支持版本范围 | 
| --- | --- | --- |
| 0.72/0.77/0.82/0.84 | [@react-native-ohos/react-native-svg](https://gitcode.com/CPF-RN/usage-docs/blob/master/zh-cn/react-native-svg.md) | >=15.0.2 |

鸿蒙适配包基于上游 `react-native-svg` v15.0.0（满足上游 peer `>=12.0.0`），采用 dual install 用法：业务代码照常 `import ... from "react-native-svg"`，打包时由 `createHarmonyMetroConfig` 自动重定向到鸿蒙适配包。

> [!TIP] 请确保引入的三方库版本与应用工程的 RN 框架版本匹配，不匹配的版本可能导致编译或运行异常。更多版本信息可通过 [RNOH 三方库总览](https://gitcode.com/CPF-RN/usage-docs/blob/master/zh-cn/README.md#rnoh-%E4%B8%89%E6%96%B9%E5%BA%93%E6%80%BB%E8%A7%88)表格获取。

## 约束与限制

- 鸿蒙侧 SVG 运行时渲染由 `@react-native-ohos/react-native-svg`（基于上游 v15.0.0，满足上游 peer `>=12.0.0`）提供；
- 本包全部核心功能（SVG 转 React 组件、非 SVG 透传、SVGR 默认配置、`.svgrrc` 合并、上游 transformer 自动探测、双子入口、transformer 工厂）均为构建期能力，在鸿蒙全量可用。

### 兼容性

本文档内容基于以下版本验证通过：
1. RNOH：0.72.20；SDK：HarmonyOS NEXT Developer Beta1；IDE：DevEco Studio 5.0.3.200；ROM：3.0.0.18；
2. RNOH：0.77.18；SDK：HarmonyOS 6.0.0 Release SDK；IDE：DevEco Studio 6.0.0.868；ROM：6.0.0.112；
3. RNOH：0.82.1；SDK：HarmonyOS 6.0.1 Release SDK；IDE：DevEco Studio 6.0.1 Release；ROM：6.0.0.120 SP7；
4. RNOH：0.84.1；SDK：HarmonyOS 6.0.1 Release SDK；IDE：DevEco Studio 6.0.1 Release；ROM：6.0.0.120 SP7；

### 权限要求

无特殊权限要求（纯构建期工具，不涉及运行时权限）。

## 使用示例

安装并完成 `metro.config.js` 配置（见「使用说明」）后，在业务代码中直接 import SVG 文件作为组件：

```tsx
import Logo from "./logo.svg";

export function App() {
  return <Logo width={120} height={120} />;
}
```
## 使用说明

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

也可在 SVG 文件所在目录放置 `.svgrrc` 自定义 SVGR 配置（与上游用法一致，向上逐级查找合并）。

## 接口说明

本包无运行时组件与 API，对外接口为以下三个 npm 入口：

| 入口 | 说明 |
|------|------|
| `react-native-svg-transformer`（默认） | Expo 上游 transformer 优先，失败回退 RN |
| `react-native-svg-transformer/react-native` | 固定使用 RN 上游 transformer（**鸿蒙工程推荐**，`babelTransformerPath` 指向此入口） |
| `react-native-svg-transformer/expo` | 固定使用 Expo 上游 transformer（鸿蒙工程不使用） |

在 RNOH中，`react-native` 子入口会先尝试 `@react-native/metro-babel-transformer`（RN ≥ 0.73 才有），失败后回退 `metro-react-native-babel-transformer`（RN 模板 devDependencies 自带，可解析），链路已验证可用。

## 遗留问题

无

## 其他


## 目录结构

````
/react-native-svg-transformer  # 项目根目录
├── index.js               # 默认入口（Expo transformer 优先，失败回退 RN）
├── react-native/
│   └── index.js           # RN transformer 子入口（鸿蒙工程推荐）
├── expo/
│   └── index.js           # Expo transformer 子入口
├── example/               # 示例工程（RNOH 0.72 鸿蒙工程，4 个测试场景）
├── images/                # 文档图片
├── package.json           # npm 包定义（与上游的唯一差异所在）
├── CHANGELOG.md           # 变更记录
├── LICENSE                # MIT 协议
└── README.md              # 中文安装使用方法
````

## 贡献代码

使用过程中发现任何问题都可以提交 [Issue](https://github.com/react-native-oh-library/react-native-svg-transformer)，当然，也非常欢迎提交 [PR](https://github.com/react-native-oh-library/react-native-svg-transformer)。

## 开源协议

本项目基于 [MIT License](https://github.com/kristerkari/react-native-svg-transformer/blob/master/LICENSE) 开源，协议全文见 [LICENSE](./LICENSE)，请自由地享受和参与开源。
