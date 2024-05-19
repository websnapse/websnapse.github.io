import { reactive, watch } from "vue";
import { useStorage } from "@vueuse/core";
import system from "./system";

const rulebook = reactive({
  book: [],
  rules: useStorage("newRules", []),
  current_neuron_id: "",
  all_rules: useStorage("allRules", {}),
  global_rules: useStorage("globalRules", {}),

  to: "",
  from: "",
  weight: 1,
  global_edges: useStorage("globalEdges", []),

  success: false,
});

export default rulebook;
