import { content } from '../content';
import { presets, type PresetName, type VisualPreset } from './presets';

/** 全片唯一的视觉入口。content.ts 改 preset 字符串，这里自动切整套画面。 */
export const getPreset = (): VisualPreset =>
  presets[content.preset as PresetName] ?? presets.moon;
