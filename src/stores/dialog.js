import { reactive } from "vue";

export const dialog = reactive({
  createNeuron: false,
  editSynapse: false,
  editNeuron: false,
  chooseRule: false,
  choiceHistory: false,
  rulebook: false,
  createRule: false,
  createEdge: false,
  details: null,

  hasDialog() {
    return (
      this.createNeuron ||
      this.editSynapse ||
      this.editNeuron ||
      this.chooseRule ||
      this.choiceHistory ||
      this.rulebook ||
      this.createRule ||
      this.createEdge
    );
  },
});

export default dialog;
