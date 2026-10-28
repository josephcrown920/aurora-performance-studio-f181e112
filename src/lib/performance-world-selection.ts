import { COLOR_PRESETS } from "./colors.presets";

export function resolvePerformanceColor(value: unknown): string {
  return COLOR_PRESETS.find(preset => preset.id === value)?.id ?? "royal-blue";
}