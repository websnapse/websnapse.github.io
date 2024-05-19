import { reactive } from "vue";

export const neuron = reactive({
  id: null,
  content: 1,
  rules: [],
  type: "regular",
  success: false,
});
