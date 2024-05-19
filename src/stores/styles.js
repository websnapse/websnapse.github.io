import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config.js";
import { reactive } from "vue";

const fullConfig = resolveConfig(tailwindConfig);

const styles = reactive({
  content: "#0d0e0e",
  darkContent: "#9f96a0",
  primary: fullConfig.theme.colors.primary,
  darkPrimary: fullConfig.theme.colors.light,
  error: fullConfig.theme.colors.error,
  light: fullConfig.theme.colors.light,
  dark: "#1e1e1e",
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
