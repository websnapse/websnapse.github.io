import { ref } from 'vue';

export const neuron = ref({
  count: 0,
  id: null,
  content: 'a',
  rules: 'a/a \\to a; 0',
  nodeType: 'regular',
});
