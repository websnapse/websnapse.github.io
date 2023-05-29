import { computed, reactive } from 'vue';

export const neuron = reactive({
  count: 0,
  id: computed(() => {
    return Math.random().toString(36).substr(2, 9);
  }),
  content: '1',
  rules: [],
  type: 'regular',
  success: false,
});
