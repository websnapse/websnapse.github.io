import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config.js';
import { reactive } from 'vue';

const fullConfig = resolveConfig(tailwindConfig);

const styles = reactive({
  black: '#0d0e0e',
  primary: fullConfig.theme.colors.primary,
  error: fullConfig.theme.colors.error,
  base: fullConfig.theme.colors.base,
  dark: fullConfig.theme.colors.dark,
  lineDash: [4, 2, 1, 2],
  r: 30,
  m: 20,
  p: 20,
  min_width: 100,
  min_height: 60,
  lineActive: 5,
  lineInactive: 2,
});

export default styles;
