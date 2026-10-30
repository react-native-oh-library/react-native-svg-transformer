> Document template: v0.4.2

<p align="center">
  <h1 align="center"> <code>react-native-svg-transformer</code> </h1>
</p>

This project is developed based on [react-native-svg-transformer](https://github.com/kristerkari/react-native-svg-transformer) v1.5.3. The version information is as follows:

| Third-party Library | Version (npm link) | Release Info | Supported RN Versions | Autolink | Compilation API Version | Community Baseline Version | Source Code |
| ---------- | -------------------- | -------- | ---------- | -------- | ----------- | ------------ | -------- |
| react-native-svg-transformer | [~ 1.5.3](https://www.npmjs.com/package/react-native-svg-transformer) | [Github Releases](https://github.com/react-native-oh-library/react-native-svg-transformer/releases) | 0.72.* / 0.77.* / 0.82.* / 0.84.* | No | API12+ | 1.5.3 | [master](https://github.com/react-native-oh-library/react-native-svg-transformer) |

## Introduction

react-native-svg-transformer converts `.svg` files into React components via SVGR in React Native. This package is a **pure JavaScript build-time Metro transformer**: the conversion takes place inside the Node/Metro bundling process on your development machine and is independent of the target runtime platform.

## Installation

Navigate to your project directory and run the following command:

**npm**

```bash
npm install @react-native-ohos/react-native-svg
```

**yarn**

```bash
yarn add @react-native-ohos/react-native-svg
```


## Dependencies

Choose the corresponding version of the library based on the RN framework version used by your application project:

| RN Framework Version | Harmony-adapted Library | Supported Version Range |
| --- | --- | --- |
| 0.72/0.77/0.82/0.84 | [@react-native-ohos/react-native-svg](https://gitcode.com/CPF-RN/usage-docs/blob/master/zh-cn/react-native-svg.md) | >=15.0.2 |

> [!TIP] Make sure the library version you install matches the RN framework version of your application project; mismatched versions may cause build or runtime errors. For more version information, see the [RNOH third-party library overview](https://gitcode.com/CPF-RN/usage-docs/blob/master/zh-cn/README.md#rnoh-%E4%B8%89%E6%96%B9%E5%BA%93%E6%80%BB%E8%A7%88) table.

## Constraints and Limitations

### Compatibility

The content of this document has been verified with the following versions:
1. RNOH: 0.72.20; SDK: HarmonyOS NEXT Developer Beta1; IDE: DevEco Studio 5.0.3.200; ROM: 3.0.0.18;
2. RNOH: 0.77.18; SDK: HarmonyOS 6.0.0 Release SDK; IDE: DevEco Studio 6.0.0.868; ROM: 6.0.0.112;
3. RNOH: 0.82.1; SDK: HarmonyOS 6.0.1 Release SDK; IDE: DevEco Studio 6.0.1 Release; ROM: 6.0.0.120 SP7;
4. RNOH: 0.84.1; SDK: HarmonyOS 6.0.1 Release SDK; IDE: DevEco Studio 6.0.1 Release; ROM: 6.0.0.120 SP7;

### Permission Requirements

No special permissions are required.

## Usage Example

After installing the package and configuring `metro.config.js` (see "Usage"), import SVG files directly as components in your business code:

```tsx
import Logo from "./logo.svg";

export function App() {
  return <Logo width={120} height={120} />;
}
```
## Usage

In the `metro.config.js` of your RNOH project, add the SVG transformer configuration on top of `createHarmonyMetroConfig`:

```js
const { mergeConfig, getDefaultConfig } = require("@react-native/metro-config");
const { createHarmonyMetroConfig } = require("@react-native-oh/react-native-harmony/metro.config");

// On RN 0.72, getDefaultConfig is a synchronous call; use its default values for resolver.sourceExts / assetExts
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

## API Description

None

## Known Issues

None

## Others


## Directory Structure

````
/react-native-svg-transformer  # Project root directory
├── index.js               # Default entry (prefers the Expo transformer, falls back to RN on failure)
├── react-native/
│   └── index.js           # RN transformer sub-entry (recommended for Harmony projects)
├── expo/
│   └── index.js           # Expo transformer sub-entry
├── example/               # Example project (RNOH 0.72 Harmony project, 4 test scenarios)
├── images/                # Documentation images
├── package.json           # npm package definition (the only difference from upstream)
├── CHANGELOG.md           # Changelog
├── LICENSE                # MIT License
└── README.md              # Installation and usage guide (Chinese)
````

## Contributing

If you encounter any problems while using this library, feel free to submit an [Issue](https://github.com/react-native-oh-library/react-native-svg-transformer). Pull requests are also highly welcome.

## License

This project is open-sourced under the [MIT License](https://github.com/kristerkari/react-native-svg-transformer/blob/master/LICENSE). See [LICENSE](./LICENSE) for the full license text. Feel free to enjoy and contribute to open source.
