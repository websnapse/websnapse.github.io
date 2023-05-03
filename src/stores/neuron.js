import { ref } from 'vue';

export const neuron = ref({
  count: 0,
  label: null,
  content: null,
  rules: null,

  addNeuron() {
    this.count += 1;
  },

  setNeuronDetails(label, content, rules) {
    this.label = label;
    this.content = content;
    this.rules = rules;
  },
});
