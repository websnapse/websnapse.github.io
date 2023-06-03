import {
  createNeuronDialogOpen,
  editNeuronDialogOpen,
  editSynapseDialogOpen,
  dialogDetails,
} from '../stores/dialog';
import { clone } from '@antv/util';

import { watch } from 'vue';

export const updateNeuron = (item) => {
  const model = clone(item.getModel());
  return new Promise((resolve, reject) => {
    const { id, content, rules, type } = model;
    if (model.type !== 'regular') {
      dialogDetails.value = { id, type, content };
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
  const { label } = clone(item.getModel());
  return new Promise((resolve, reject) => {
    dialogDetails.value = { label: label };
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
