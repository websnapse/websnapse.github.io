import { computed, reactive } from 'vue';

export const neuron = reactive({
  count: 0,
  id: null,
  content: '1',
  rules: [],
  type: 'regular',
  success: false,
});
