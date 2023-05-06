import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config.js';

const fullConfig = resolveConfig(tailwindConfig);

export const black = '#0d0e0e';
export const primary = fullConfig.theme.colors.primary;
export const base = fullConfig.theme.colors.base;
export const lineDash = [4, 2, 1, 2];
export const r = 50;
export const m = 20;
export const p = 20;
export const min_width = 100;
export const min_height = 60;
export const lineActive = 5;
export const lineInactive = 2;
