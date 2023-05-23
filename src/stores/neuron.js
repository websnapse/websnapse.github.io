import { reactive } from 'vue';

export const neuron = reactive({
  count: 0,
  id: null,
  content: '1',
  rules: ['a/a \\to a; 0', 'a/a \\to 0'],
  type: 'regular',
  success: false,
});
