import { useDark, useStorage } from '@vueuse/core';
import { computed, reactive, watch } from 'vue';

const gridImage = {
  dotted:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDIwQzIxIDIwLjU1MjMgMjAuNTUyMyAyMSAyMCAyMUMxOS40NDc3IDIxIDE5IDIwLjU1MjMgMTkgMjBDMTkgMTkuNDQ3NyAxOS40NDc3IDE5IDIwIDE5QzIwLjU1MjMgMTkgMjEgMTkuNDQ3NyAyMSAyMFoiIGZpbGw9ImJsYWNrIiBmaWxsLW9wYWNpdHk9IjAuMTUiLz4KPC9zdmc+Cgo=',
  lines:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2UwZTBlMCIgb3BhY2l0eT0iMC4yIiBzdHJva2Utd2lkdGg9IjEiLz48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTBlMGUwIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=',
};

const settings = reactive({
  dark: useDark(),
  grid: useStorage('grid', 'dotted'),
  gridImage: computed(() => {
    return gridImage[settings.grid];
  }),
  view: useStorage('view', 'full'),
  refreshRate: useStorage('refresh', 1),
  label: useStorage('label', true),
});

watch(
  () => settings.grid,
  () => {
    const grid = document.querySelector('.g6-grid');

    if (grid) {
      grid.style.backgroundImage = `url(${settings.gridImage})`;
    }
  },
  { immediate: true }
);

export default settings;
