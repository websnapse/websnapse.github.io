import { handleKeydown, handleKeyup } from '@/graph/events/keyboard';
import { computed, ref, watch } from 'vue';

export const createNeuronDialogOpen = ref(false);

export const editSynapseDialogOpen = ref(false);

export const editNeuronDialogOpen = ref(false);

export const chooseRuleDialogOpen = ref(false);

export const dialogDetails = ref(null);

const hasDialog = computed(() => {
  return (
    createNeuronDialogOpen.value ||
    editSynapseDialogOpen.value ||
    editNeuronDialogOpen.value ||
    chooseRuleDialogOpen.value
  );
});

watch(
  () => hasDialog.value,
  (value) => {
    if (value) {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('keyup', handleKeyup);
    } else {
      window.addEventListener('keydown', handleKeydown);
      window.addEventListener('keyup', handleKeyup);
    }
  }
);
