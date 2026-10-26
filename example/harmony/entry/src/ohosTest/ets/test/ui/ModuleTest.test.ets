import { abilityDelegatorRegistry, Component, Driver, ON } from '@kit.TestKit';
import { Want } from '@kit.AbilityKit';
import { describe, it, expect, beforeAll } from '@ohos/hypium';

const BUNDLE_NAME = 'com.example.checkboxx';
const ENTRY_ABILITY = 'EntryAbility';
const PAGE_TITLE_TEXT = 'SVG Transformer Example';
const POLL_INTERVAL_MS = 400;
const RN_LOAD_TIMEOUT_MS = 12000;
const RESULT_TIMEOUT_MS = 4000;

/**
 * Keys = findMethodButton `method` slug; values = exact testID from App.tsx.
 * RNOH 下 ON.id(testID) 可能无效，findMethodButton 会自动回退 ON.text(按钮文案)。
 */
const METHOD_BUTTON_IDS: Record<string, string> = {
  'svgrrc_config_merge': 'btn-cycle-badge-color',
};

/** App.tsx 各 Section 的稳定标题文案，作为 ON.id 找不到时的兜底 */
const SECTION_TITLES: Record<string, string> = {
  'section-default-config': '1. 默认配置导入（原始尺寸）',
  'section-props-size': '2. props 覆盖尺寸',
  'section-multi-elements': '3. 复杂多元素 SVG',
  'section-svgrrc': '4. .svgrrc 自定义配置',
};

let appDriver: Driver | null = null;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startEntryAbility(): Promise<void> {
  const delegator = abilityDelegatorRegistry.getAbilityDelegator();
  const want: Want = {
    bundleName: BUNDLE_NAME,
    abilityName: ENTRY_ABILITY
  };
  await delegator.startAbility(want);
}

async function waitForText(
  driver: Driver,
  text: string,
  timeoutMs: number
): Promise<Component | null> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      return await driver.findComponent(ON.text(text));
    } catch (_e) {
      await sleep(POLL_INTERVAL_MS);
    }
  }
  return null;
}

async function waitForId(
  driver: Driver,
  id: string,
  timeoutMs: number
): Promise<Component | null> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      return await driver.findComponent(ON.id(id));
    } catch (_e) {
      await sleep(POLL_INTERVAL_MS);
    }
  }
  return null;
}

async function findMethodButton(
  driver: Driver,
  method: string,
  buttonText: string
): Promise<Component> {
  const candidates: string[] = [];
  if (METHOD_BUTTON_IDS[method]) {
    candidates.push(METHOD_BUTTON_IDS[method]);
  }
  candidates.push(`btn-${method}`, `test-${method}-btn`);
  for (const id of candidates) {
    const byId = await waitForId(driver, id, 2000);
    if (byId !== null) {
      return byId;
    }
  }
  const byText = await waitForText(driver, buttonText, 2000);
  if (byText !== null) {
    return byText;
  }
  throw new Error(`Button not found for ${method}`);
}

/** 定位场景 Section：testID 优先，标题文案兜底 */
async function findSection(
  driver: Driver,
  sectionId: string
): Promise<Component> {
  const byId = await waitForId(driver, sectionId, 2000);
  if (byId !== null) {
    return byId;
  }
  const title = SECTION_TITLES[sectionId];
  if (title) {
    const byText = await waitForText(driver, title, 2000);
    if (byText !== null) {
      return byText;
    }
  }
  throw new Error(`Section not found: ${sectionId}`);
}

/** 向上滚动一屏，把下方内容带入可视区（ScrollView 兜底）。
 * 真机 API 24 的 uitest 运行时要求 swipe 第 5 参 speed 必传（本地 SDK d.ts 标可选），
 * 缺省时报 401 (PreProcessing: APiCallInfoChecker)Illegal argument count，故显式传 600。 */
async function scrollDown(driver: Driver): Promise<void> {
  const size = await driver.getDisplaySize();
  const centerX = Math.round(size.x / 2);
  const startY = Math.round(size.y * 0.75);
  const endY = Math.round(size.y * 0.35);
  await driver.swipe(centerX, startY, centerX, endY, 600);
  await sleep(600);
}

export default function moduleTest(): void {
  describe('SvgTransformerDeviceTest', () => {
    beforeAll(async () => {
      await startEntryAbility();
      appDriver = Driver.create();
      const title = await waitForText(appDriver, PAGE_TITLE_TEXT, RN_LOAD_TIMEOUT_MS);
      if (title === null) {
        const byId = await waitForId(appDriver, 'app-title', 3000);
        if (byId === null) {
          throw new Error('RN app did not load: title not found');
        }
      }
    });

    it('detectWhiteScreen', 0, async () => {
      expect(appDriver !== null).assertTrue();
      let hasContent = await waitForText(appDriver!, PAGE_TITLE_TEXT, 2000);
      if (hasContent === null) {
        hasContent = await waitForId(appDriver!, 'app-title', 2000);
      }
      expect(hasContent !== null).assertTrue();
    });

    it('transform_react_native_entry', 0, async () => {
      const driver = appDriver!;
      const s1 = await findSection(driver, 'section-default-config');
      expect(s1 !== null).assertTrue();
      const s2 = await findSection(driver, 'section-props-size');
      expect(s2 !== null).assertTrue();
      const s3 = await findSection(driver, 'section-multi-elements');
      expect(s3 !== null).assertTrue();
      const s4 = await findSection(driver, 'section-svgrrc');
      expect(s4 !== null).assertTrue();
    });

    it('svgr_default_config', 0, async () => {
      const driver = appDriver!;
      // 场景 1：默认配置导入（SVGR 产物组件挂载，原始尺寸渲染）
      const r1 = await waitForId(driver, 'default-config-result', 2000);
      expect(r1 !== null).assertTrue();
      // 场景 2：props 覆盖尺寸（同一产物组件复用）
      const r2 = await waitForId(driver, 'props-size-result', 2000);
      expect(r2 !== null).assertTrue();
      // 场景 3：复杂多元素 SVG（rect/circle/path/二次曲线一次转换）
      const r3 = await waitForId(driver, 'multi-elements-result', 2000);
      expect(r3 !== null).assertTrue();
    });

    it('svgrrc_config_merge', 0, async () => {
      const driver = appDriver!;
      // 场景 4：.svgrrc 生效（dimensions:false + replaceAttrValues 颜色参数化）
      // 第 4 节位于 ScrollView 下缘之外，未滚入可视区时不在 uitest 可达树中：
      // 先有界滚动直至结果区出现，再断言与点击
      let r4: Component | null = await waitForId(driver, 'svgrrc-result', 1500);
      let scrolls = 0;
      while (r4 === null && scrolls < 3) {
        await scrollDown(driver);
        scrolls += 1;
        r4 = await waitForId(driver, 'svgrrc-result', 1500);
        if (r4 === null) {
          // RNOH 下 ON.id 兜底：以初始颜色文案确认场景 4 已渲染
          r4 = await waitForText(driver, 'color: #1E6F5C', 1500);
        }
      }
      expect(r4 !== null).assertTrue();

      const button = await findMethodButton(driver, 'svgrrc_config_merge', '切换 Badge 颜色');
      await button.click();
      // BADGE_COLORS: #1E6F5C -> #B8336A，点击后文案立即切换
      let changed = await waitForText(driver, 'color: #B8336A', RESULT_TIMEOUT_MS);
      if (changed === null) {
        // 点击可能因按钮半出屏而无效，再滚一屏后重试（此时应为第三色 #2D6CDF）
        await scrollDown(driver);
        const retryButton = await findMethodButton(driver, 'svgrrc_config_merge', '切换 Badge 颜色');
        await retryButton.click();
        changed = await waitForText(driver, 'color: #2D6CDF', RESULT_TIMEOUT_MS);
      }
      expect(changed !== null).assertTrue();
    });
  });
}
