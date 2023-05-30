import { reactive } from 'vue';

const navbar = reactive({
  view: 'simple',
  running: false,
  mode: 'default',
});

export default navbar;
