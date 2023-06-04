import { computed, ref } from 'vue';

export const createNeuronDialogOpen = ref(false);

export const editSynapseDialogOpen = ref(false);

export const editNeuronDialogOpen = ref(false);

export const chooseRuleDialogOpen = ref(false);

export const choiceHistoryDialogOpen = ref(false);

export const dialogDetails = ref(null);

export const hasDialog = computed(() => {
  return (
    createNeuronDialogOpen.value ||
    editSynapseDialogOpen.value ||
    editNeuronDialogOpen.value ||
    chooseRuleDialogOpen.value ||
    choiceHistoryDialogOpen.value
  );
});
