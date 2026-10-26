/**
 * react-native-svg-transformer 产物组件的类型声明：
 * .svg 文件默认导出一个由鸿蒙版 react-native-svg 渲染的 React 组件
 */
declare module '*.svg' {
  import type {ComponentType} from 'react';

  export interface SvgModuleProps {
    width?: number | string;
    height?: number | string;
    color?: string;
    fill?: string;
  }

  const SvgComponent: ComponentType<SvgModuleProps>;
  export default SvgComponent;
}
