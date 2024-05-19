import dialog from "../stores/dialog";
import { clone } from "@antv/util";

import { watch } from "vue";

export const updateNeuron = (item) => {
  const model = clone(item.getModel());
  return new Promise((resolve, reject) => {
    const { id, content, rules, type } = model;
    if (model.type !== "regular") {
      dialog.details = { id, type, content };
    } else {
      dialog.details = { id, content, rules, type };
    }
    dialog.editNeuron = true;

    watch(
      () => dialog.editNeuron,
      (newVal, oldVal) => {
        resolve(dialog.details);
      }
    );
  });
};

export const updateSynapse = (item) => {
  const { label } = clone(item.getModel());
  return new Promise((resolve, reject) => {
    dialog.details = { label: label };
    dialog.editSynapse = true;

    watch(
      () => dialog.editSynapse,
      (newVal, oldVal) => {
        resolve(dialog.details);
      }
    );
  });
};

/**
 *
 * @returns {Promise<void>}
 */
export const createNeuron = () => {
  return new Promise((resolve, reject) => {
    dialog.createNeuron = true;

    watch(
      () => dialog.createNeuron,
      (newVal, oldVal) => {
        resolve();
      }
    );
  });
};

export const createRule = () => {
  return new Promise((resolve, reject) => {
    dialog.createRule = true;

    watch(
      () => dialog.createRule,
      (newVal, oldVal) => {
        resolve();
      }
    );
  });
};

export const createEdge = () => {
  return new Promise((resolve, reject) => {
    dialog.createEdge = true;

    watch(
      () => dialog.createEdge,
      (newVal, oldVal) => {
        resolve();
      }
    );
  });
};
