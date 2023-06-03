<template>
  <Dialog
    as="div"
    :open="props.isOpen"
    @close="props.closeModal"
    class="relative z-10"
  >
    <TransitionChild
      as="template"
      enter="duration-300 ease-out"
      enter-from="opacity-0"
      enter-to="opacity-100"
      leave="duration-200 ease-in"
      leave-from="opacity-100"
      leave-to="opacity-0"
    >
      <div class="fixed inset-0 bg-black bg-opacity-25" />
    </TransitionChild>

    <div class="fixed inset-0 overflow-y-auto">
      <div class="flex items-center justify-center min-h-full p-4 text-center">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0 scale-95"
          enter-to="opacity-100 scale-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100 scale-100"
          leave-to="opacity-0 scale-95"
        >
          <DialogPanel
            class="w-full max-w-xl p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
          >
            <DialogTitle
              as="h3"
              class="text-lg font-medium leading-6 text-gray-900"
            >
              Decision History
            </DialogTitle>

            <div class="w-full mt-4 overflow-auto max-h-[80vh]">
              <table class="w-full h-full overflow-scroll">
                <thead>
                  <tr class="bg-dark/20">
                    <th class="p-4 text-left border border-gray-200">Time</th>
                    <th
                      v-for="neuron in system.data().neurons"
                      v-html="getKatex(neuron.id)"
                      class="p-4 font-bold text-left border border-gray-200 equation"
                    ></th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(decision, tick) in system.history"
                    :class="tick % 2 ? 'bg-dark/10' : ''"
                  >
                    <td class="p-4 text-left border border-gray-200">
                      {{ tick }}
                    </td>
                    <td
                      class="p-4 text-left border border-gray-200 equation"
                      v-for="(rule, neuron) in decision"
                      v-html="getRule(neuron, rule)"
                    ></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import katex from 'katex';

import {
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue';
import system from '@/stores/system';
import { foldString } from '@/utils/math';

const props = defineProps(['isOpen', 'closeModal']);

const getKatex = (text) => {
  return katex.renderToString(String(text), {
    throwOnError: false,
    displayMode: true,
  });
};

const data = system.data();

const getRule = (neuron, rule) => {
  return getKatex(
    data.neurons[neuron].type === 'regular'
      ? data.neurons[neuron].rules[rule] ?? '-'
      : rule
      ? foldString(rule)
      : '-'
  );
};
</script>
