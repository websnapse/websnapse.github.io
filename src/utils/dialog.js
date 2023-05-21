import {
  createNeuronDialogOpen,
  editNeuronDialogOpen,
  editSynapseDialogOpen,
  dialogDetails,
} from '../stores/dialog';

import { watch } from 'vue';

export const updateNeuron = (item) => {
  const model = item.getModel();
  return new Promise((resolve, reject) => {
    const { id, content, rules, type, spiketrain } = model;
    if (model.type !== 'regular') {
      dialogDetails.value = { id, type, spiketrain };
    } else {
      dialogDetails.value = { id, content, rules, type };
    }
    editNeuronDialogOpen.value = true;

    watch(editNeuronDialogOpen, (newVal, oldVal) => {
      resolve(dialogDetails.value);
    });
  });
};

export const updateSynapse = (item) => {
  const { label } = item.getModel();
  return new Promise((resolve, reject) => {
    dialogDetails.value = { weight: label };
    editSynapseDialogOpen.value = true;

    watch(editSynapseDialogOpen, (newVal, oldVal) => {
      resolve(dialogDetails.value);
    });
  });
};

/**
 *
 * @returns {Promise<void>}
 */
export const createNeuron = () => {
  return new Promise((resolve, reject) => {
    createNeuronDialogOpen.value = true;

    watch(createNeuronDialogOpen, (newVal, oldVal) => {
      resolve();
    });
  });
};
