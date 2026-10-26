# react-native-svg-transformer 鸿蒙 Example

基于 React Native for OpenHarmony（RNOH，RN 0.72 线）验证
[react-native-svg-transformer](https://github.com/kristerkari/react-native-svg-transformer)
（鸿蒙适配版，见上级目录 `ohos/`）在 Metro 构建链路中的完整可用性：
`.svg` 文件在构建期经 SVGR 转换为 React 组件源码，运行时由鸿蒙版
react-native-svg 渲染。

## 环境要求

| 项 | 要求 |
|----|------|
| Node | ≥ 20（**编译 HAP 时 hvigor 需用 DevEco 自带 Node 18.x，见下**） |
| React Native | 0.72.5（`@react-native-oh/react-native-harmony` 0.72.140） |
| DevEco Studio / hvigor | 用于编译 Harmony 工程（`harmony/`），本工程按 hvigor `modelVersion 6.0.2` + HarmonyOS SDK 6.0.2（API 22）验证 |
| ohpm / hvigorw | 位于 `<DevEco Studio>/tools/ohpm/bin` 与 `<DevEco Studio>/tools/hvigor/bin`，需加入 PATH |
| 构建编排 | 仓库根执行 `rn.py build hap`（禁止裸跑 `hvigorw`） |

### Windows 编译环境要点（本次已验证）

1. **DEVECO_SDK_HOME** 必须指向 DevEco SDK 根目录（含 `default/openharmony`）。路径含空格（如 `C:\Program Files\...`）时 hvigor 会报 `Invalid value of 'DEVECO_SDK_HOME'`，需建无空格 junction：`C:\de-sdk → <DevEco>/sdk`，再 `export DEVECO_SDK_HOME='C:\de-sdk'`。
2. **系统 Node 22+ 无法用于 hvigorw**：新版 Node 对 `.cmd/.bat` 的 `spawnSync` 报 `EINVAL`，hvigor wrapper（npm/pnpm 自举）全部失败。改用 DevEco 自带 Node（`<DevEco>/tools/node`，18.20.1，无此限制），同样建议 junction 到无空格路径（如 `C:\de-node`）并置于 PATH 首位。
3. `~/.hvigor/wrapper/tools` 是 hvigor 的 pnpm 自举缓存，损坏（pnpm 被自动迁移到 `node_modules/.ignored`）时直接删除该目录重跑即可重建。

## 依赖说明

| 依赖 | 角色 |
|------|------|
| `react-native-svg-transformer`（`file:../react-native-svg-transformer-1.5.3.tgz`） | 被验证的鸿蒙适配包（构建期 Metro transformer） |
| `react-native-svg@15.0.0` | 原始包，提供 JS 层组件（dual install 模式） |
| `@react-native-ohos/react-native-svg@~15.0.2` | 鸿蒙原生实现（CAPI 版，autolinking 注册） |

> dual install 是 RNOH 官方用法：业务代码照常 `import ... from 'react-native-svg'`，
> 打包时 `createHarmonyMetroConfig` 自动将其重定向到 `@react-native-ohos/react-native-svg`
> （构建日志可见 `Redirected imports: react-native-svg → @react-native-ohos/react-native-svg`），
> 原生侧由鸿蒙包通过 autolinking 提供同名组件/TurboModule 实现。

## metro.config.js 配置三要素

```js
const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer/react-native'),
  },
  resolver: {
    assetExts: baseConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...baseConfig.resolver.sourceExts, 'svg'],
  },
};
module.exports = mergeConfig(baseConfig, config); // baseConfig = RN 默认 + createHarmonyMetroConfig
```

1. `babelTransformerPath` 指向 `react-native-svg-transformer/react-native` 子入口；
2. `sourceExts` 追加 `svg`（.svg 作为源码模块交给 transformer）；
3. `assetExts` 移除 `svg`（不再按静态资源打包）。

## 测试场景

| # | 场景 | 文件 | 验证点 |
|---|------|------|--------|
| 1 | 默认配置导入 | `src/images/react-logo.svg` | 未命中 `.svgrrc` 时用内置默认配置（native 模式），按原始尺寸渲染，viewBox 保留 |
| 2 | props 覆盖尺寸 | 同上 | 产物组件将 props 透传给 `Svg` 根节点，`width/height` 可覆盖尺寸 |
| 3 | 复杂多元素 | `src/images/shapes.svg` | rect / circle / path / 二次曲线多元素一次性转换并完整渲染 |
| 4 | `.svgrrc` 自定义配置 | `src/images/custom/badge.svg` + 同目录 `.svgrrc` | `dimensions:false` 去除内建尺寸、`replaceAttrValues` 将 `#000000` 参数化为 `{props.color}`，按钮切换颜色实时生效 |

预期结果：4 个场景全部正常显示矢量图形，"切换 Badge 颜色"按钮可切换场景 4 徽章颜色。

## 目录结构

```
example/
├── App.tsx                      # 测试页（4 个场景 + 颜色切换按钮）
├── index.js                     # AppRegistry 入口
├── metro.config.js              # RNOH + svg transformer 配置（集成三要素）
├── src/
│   ├── types/svg.d.ts           # *.svg 模块类型声明（tsc 用）
│   └── images/
│       ├── react-logo.svg       # 场景 1/2 素材
│       ├── shapes.svg           # 场景 3 素材
│       └── custom/
│           ├── .svgrrc          # 场景 4 自定义 SVGR 配置
│           └── badge.svg        # 场景 4 素材（fill="#000000"）
└── harmony/                     # RNOH 0.72 鸿蒙工程（entry HAP）
```

## 构建与运行

在**仓库根目录**执行（统一由 `rn.py` 编排：pack tgz → 依赖安装 → bundle → assembleHap → 静态门禁）：

```bash
export PATH="/c/de-node:<DevEco>/tools/ohpm/bin:<DevEco>/tools/hvigor/bin:$PATH"
export DEVECO_SDK_HOME='C:\de-sdk'   # 指向 SDK 根（无空格 junction，见「Windows 编译环境要点」）
python .claude/skills/tool-ohos-plugin-repo/tool/rn.py build hap --full --plugin-root .
```

产物：

- JS bundle：`harmony/entry/src/main/resources/rawfile/bundle.harmony.js`
- HAP：`harmony/entry/build/default/outputs/default/entry-default-unsigned.hap`

安装到真机（`hdc install <hap>`）后打开应用即可查看测试页。

## 常见问题排查

| 现象 | 原因与处理 |
|------|-----------|
| `.svg` import 报 "Unable to resolve module" | `metro.config.js` 未把 `svg` 加入 `sourceExts`，或未从 `assetExts` 移除 |
| 页面空白 / SVG 不渲染 | 检查 `@react-native-ohos/react-native-svg` 是否安装并 autolinking 成功（`harmony/entry` 的 `RNOHPackagesFactory` / `autolinking.cmake`） |
| 场景 4 徽章不显示 | `.svgrrc` 未生效：确认文件与 `.svg` 同目录（或位于其上级目录），且为合法 JSON |
| 修改 `ohos/` 源码后 Example 无变化 | 需重新 `npm pack` 并重装 tgz 后再 bundle（`rn.py build hap --full` 已包含） |
