<template>
  <Dialog as="div" :open="props.isOpen" class="relative z-10">
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
      <div
        class="relative flex items-center justify-center min-h-full p-4 text-center"
      >
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
            class="relative w-full max-w-sm p-6 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
            ref="choices"
          >
            <form class="relative">
              <table class="relative w-full border-separate border-spacing-y-2">
                <DialogTitle
                  as="caption"
                  class="text-lg font-bold leading-6 text-left text-gray-900"
                >
                  Applicable Rules
                </DialogTitle>
                <tr v-for="neuron in Object.keys(props.details)">
                  <td
                    class="text-sm font-medium text-gray-900 equation w-fit"
                    v-if="props.details[neuron].length"
                    v-html="getKatex(neuron)"
                  />
                  <Listbox
                    v-model="selected_rules[neuron]"
                    v-if="props.details[neuron].length"
                  >
                    <td class="relative flex-1">
                      <ListboxButton
                        class="relative w-full p-3 text-sm text-left text-gray-900 border border-gray-300 rounded-lg outline-none group bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <span
                          class="block equation"
                          v-html="
                            getKatex(
                              getNode(neuron).rules[selected_rules[neuron]] ??
                                getNode(neuron).rules[props.details[neuron][0]]
                            )
                          "
                        ></span>
                        <span
                          class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
                        >
                          <v-icon
                            name="bi-chevron-down"
                            class="block group-aria-expanded:hidden"
                          />
                        </span>
                      </ListboxButton>
                      <transition
                        leave-active-class="transition duration-100 ease-in"
                        leave-from-class="opacity-100"
                        leave-to-class="opacity-0"
                      >
                        <ListboxOptions
                          class="absolute z-10 w-full py-1 mt-1 overflow-auto bg-white rounded-md shadow-lg text-light max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                        >
                          <ListboxOption
                            v-slot="{ active }"
                            v-for="index in props.details[neuron]"
                            :key="index"
                            :value="index"
                            as="template"
                          >
                            <li
                              class="relative px-4 py-2 text-gray-900 cursor-default select-none"
                              :class="active ? 'bg-primary/40' : ''"
                            >
                              <span
                                :class="[
                                  active ? 'font-medium' : 'font-normal',
                                  'block equation',
                                ]"
                                v-html="getKatex(getNode(neuron).rules[index])"
                              ></span>
                            </li>
                          </ListboxOption>
                        </ListboxOptions>
                      </transition>
                    </td>
                  </Listbox>
                </tr>
              </table>
              <button
                type="submit"
                class="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                @click.prevent="checkDetails"
              >
                Submit
              </button>
            </form>
          </DialogPanel>
        </TransitionChild>
      </div>
    </div>
  </Dialog>
</template>
<style>
.equation > .katex-display,
.katex-display {
  margin: 0;
}
.equation > .katex-display,
.equation > .katex-display > .katex {
  text-align: left;
}
</style>

<script setup>
import katex from 'katex';

import { computed } from 'vue';
import {
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue';
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue';
import system from '@/stores/system';

const props = defineProps(['isOpen', 'closeModal', 'details', 'socket']);

const getKatex = (text) => {
  return katex.renderToString(String(text), {
    throwOnError: false,
    displayMode: true,
  });
};

const selected_rules = computed(() => {
  const rules = {};
  for (const neuron in props.details) {
    if (Array.isArray(props.details[neuron])) {
      rules[neuron] = props.details[neuron][0];
    } else {
      rules[neuron] = props.details[neuron];
    }
  }
  return rules;
});

const getNode = (id) => {
  return system.data().neurons.find((neuron) => neuron.id === id);
};

const checkDetails = () => {
  props.socket.send(
    JSON.stringify({
      cmd: 'choice',
      choice: selected_rules.value,
    })
  );
  props.closeModal();
};
</script>
