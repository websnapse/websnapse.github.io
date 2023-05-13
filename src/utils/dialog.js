import {
  createNeuronDialogOpen,
  editNeuronDialogOpen,
  editSynapseDialogOpen,
  dialogDetails,
} from '../stores/dialog';

import { watch } from 'vue';

export const updateNeuron = (item) => {
  const { id, content, rules, nodeType } = item.getModel();
  return new Promise((resolve, reject) => {
    dialogDetails.value = { id, content, rules, nodeType };
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

export const createNeuron = () => {
  return new Promise((resolve, reject) => {
    createNeuronDialogOpen.value = true;

    watch(createNeuronDialogOpen, (newVal, oldVal) => {
      resolve();
    });
  });
};
