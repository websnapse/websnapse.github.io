import { ref } from 'vue';

export const neuron = ref({
  count: 0,
  id: null,
  content: '1',
  spiketrain: '',
  rules: ['a/a \\to a; 0', 'a/a \\to 0'],
  type: 'regular',
});
