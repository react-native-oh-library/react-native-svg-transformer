/**
 * react-native-svg-transformer OpenHarmony Example
 *
 * 验证 .svg 文件在 Metro 构建期经 react-native-svg-transformer（SVGR）转换为
 * React 组件源码，并在运行时由鸿蒙版 react-native-svg 渲染：
 * 1. 默认 SVGR 配置：默认导出组件，按 SVG 原始尺寸渲染（viewBox 保留）
 * 2. props 覆盖尺寸：同一组件通过 width/height 放大渲染
 * 3. 复杂多元素 SVG：rect / circle / path / 曲线同时渲染
 * 4. .svgrrc 自定义配置：dimensions:false + replaceAttrValues 颜色参数化
 */

import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// 场景 1/2：默认 SVGR 配置（native 模式，viewBox 保留）
import ReactLogoSvg from './src/images/react-logo.svg';
// 场景 3：复杂多元素 SVG
import ShapesSvg from './src/images/shapes.svg';
// 场景 4：.svgrrc 自定义配置（src/images/custom/.svgrrc 向上查找生效）
import BadgeSvg from './src/images/custom/badge.svg';

const BADGE_COLORS = ['#1E6F5C', '#B8336A', '#2D6CDF'];

type SectionProps = {
  testID: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

function Section({testID, title, description, children}: SectionProps) {
  return (
    <View style={styles.section} testID={testID}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDesc}>{description}</Text>
      <View style={styles.sectionBody} testID={`${testID}-body`}>
        {children}
      </View>
    </View>
  );
}

function App(): React.JSX.Element {
  const [colorIndex, setColorIndex] = useState(0);
  const badgeColor = BADGE_COLORS[colorIndex];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text testID="app-title" accessibilityLabel="app-title" style={styles.title}>
          SVG Transformer Example
        </Text>
        <Text style={styles.subtitle}>
          .svg → React 组件（react-native-svg-transformer）
        </Text>

        <Section
          testID="section-default-config"
          title="1. 默认配置导入（原始尺寸）"
          description="未命中 .svgrrc 时使用内置默认配置（native 模式），组件按 SVG 文件自身的 width/height 渲染，viewBox 保留。">
          <View style={styles.row} testID="default-config-result">
            <ReactLogoSvg />
            <ReactLogoSvg width={96} height={96} />
          </View>
        </Section>

        <Section
          testID="section-props-size"
          title="2. props 覆盖尺寸"
          description="SVGR 产物组件将 props 透传给 Svg 根节点，可用 width/height 覆盖默认尺寸。">
          <View style={styles.row} testID="props-size-result">
            <ReactLogoSvg width={36} height={36} />
            <ReactLogoSvg width={64} height={64} />
            <ReactLogoSvg width={96} height={96} />
          </View>
        </Section>

        <Section
          testID="section-multi-elements"
          title="3. 复杂多元素 SVG"
          description="rect / circle / path / 二次曲线（Q 指令）等多元素文件一次性转换并完整渲染。">
          <View style={styles.row} testID="multi-elements-result">
            <ShapesSvg width={240} height={120} />
          </View>
        </Section>

        <Section
          testID="section-svgrrc"
          title="4. .svgrrc 自定义配置"
          description="src/images/custom/.svgrrc 声明 dimensions:false 与 replaceAttrValues（#000000 → {props.color}），尺寸必须由外部传入，颜色由 color prop 动态控制。">
          <View style={styles.row} testID="svgrrc-result">
            <BadgeSvg width={72} height={72} color={badgeColor} />
            <Text style={styles.badgeColorText}>color: {badgeColor}</Text>
          </View>
          <TouchableOpacity
            testID="btn-cycle-badge-color"
            accessibilityLabel="btn-cycle-badge-color"
            style={styles.button}
            onPress={() => setColorIndex((colorIndex + 1) % BADGE_COLORS.length)}>
            <Text style={styles.buttonText}>切换 Badge 颜色</Text>
          </TouchableOpacity>
        </Section>

        <Text style={styles.footer}>
          若以上 4 个场景均正常显示矢量图形且按钮可用，说明 transformer 在 RNOH
          Metro 构建链路中工作正常。
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2329',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#646A73',
    textAlign: 'center',
    marginBottom: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2329',
  },
  sectionDesc: {
    fontSize: 12,
    color: '#646A73',
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 18,
  },
  sectionBody: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    alignSelf: 'stretch',
    flexWrap: 'wrap',
    rowGap: 12,
  },
  badgeColorText: {
    fontSize: 13,
    color: '#1F2329',
    marginLeft: 8,
  },
  button: {
    marginTop: 16,
    backgroundColor: '#2D6CDF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    fontSize: 12,
    color: '#8F959E',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
});

export default App;
