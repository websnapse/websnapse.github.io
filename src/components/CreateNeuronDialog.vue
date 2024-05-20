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
            class="w-full max-w-sm p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
          >
            <DialogTitle
              as="h3"
              class="text-lg font-medium leading-6 text-gray-900"
            >
              Node Properties
            </DialogTitle>

            <div class="grid grid-cols-5 gap-4 mt-4">
              <div class="col-span-5">
                <form class="flex flex-col gap-4">
                  <div class="relative flex flex-col gap-1">
                    <label
                      for="label"
                      class="mb-2 text-sm font-medium text-gray-900"
                    >
                      ID
                    </label>
                    <input
                      type="text"
                      id="label"
                      v-model="neuron.id"
                      class="input-field"
                      placeholder="n1"
                      required
                    />
                  </div>
                  <div class="relative flex flex-col gap-1">
                    <label
                      for="type"
                      class="mb-2 text-sm font-medium text-gray-900"
                    >
                      Type
                    </label>
                    <Listbox v-model="neuron.type">
                      <div class="relative mt-1">
                        <ListboxButton
                          class="w-full p-3 text-sm text-left text-gray-900 border border-gray-300 rounded-lg outline-none group bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <span class="block truncate">{{ neuron.type }}</span>
                          <span
                            class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
                          >
                            <v-icon
                              name="bi-chevron-expand"
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
                            class="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                          >
                            <ListboxOption
                              v-slot="{ active, selected }"
                              v-for="type in types"
                              :key="type"
                              :value="type"
                              as="template"
                            >
                              <li
                                :class="[
                                  active
                                    ? 'bg-primary/30 text-dark'
                                    : 'text-gray-900',
                                  'relative cursor-default select-none py-2 pl-10 pr-4',
                                ]"
                              >
                                <span
                                  :class="[
                                    selected ? 'font-medium' : 'font-normal',
                                    'block truncate',
                                  ]"
                                  >{{ type }}</span
                                >
                                <span
                                  v-if="selected"
                                  class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary"
                                >
                                  <v-icon name="bi-check" />
                                </span>
                              </li>
                            </ListboxOption>
                          </ListboxOptions>
                        </transition>
                      </div>
                    </Listbox>
                  </div>
                  <div class="relative flex flex-col gap-1">
                    <label
                      for="content"
                      class="mb-2 text-sm font-medium text-gray-900"
                      v-if="neuron.type === 'regular'"
                    >
                      Content
                    </label>
                    <label
                      for="content"
                      class="mb-2 text-sm font-medium text-gray-900"
                      v-else-if="neuron.type === 'input'"
                    >
                      Spike Train
                    </label>
                    <MathEditor
                      v-bind:model-value="neuron.content"
                      v-if="neuron.type !== 'output'"
                      @change="(value) => (neuron.content = value)"
                    />
                  </div>
                  <div
                    class="relative flex flex-col gap-1"
                    v-if="neuron.type === 'regular'"
                  >
                    <label
                      for="rules"
                      class="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Rules
                    </label>
                    <MathEditor
                      v-for="(rule, index) in neuron.rules"
                      v-bind:model-value="rule"
                      @change="(value) => (neuron.rules[index] = value)"
                      @delete="neuron.rules.splice(index, 1)"
                    />
                    <button
                      class="py-2 text-sm font-medium border-2 border-dashed rounded-md text-dark/50"
                      @click.prevent="addRule"
                    >
                      Add Rule
                    </button>
                  </div>
                  <button
                    type="submit"
                    class="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    @click.prevent="checkDetails"
                  >
                    Create
                  </button>
                </form>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { neuron } from "@/stores/neuron";

import {
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/vue";
import MathEditor from "@/components/MathEditor.vue";

const props = defineProps(["isOpen", "closeModal"]);

const types = ["regular", "input", "output"];

const addRule = () => {
  neuron.rules.push("");
  setTimeout(() => {
    const mathField =
      document.getElementsByClassName("math")[neuron.rules.length];
    mathField.children[0].children[0].children[0].focus();
  }, 0);
};

import rulebook from "@/stores/rulebook";

const checkDetails = () => {
  if (neuron.type === "regular") {
    neuron.rules.forEach((rule) => {
      if (rule === "") {
        alert("Please enter rules");
        return;
      }
    });
  }

  if (neuron.type === "output") {
    neuron.content = "";
  }

  if (neuron.type === "regular") {
    rulebook.all_rules[neuron.id] = neuron.rules;
  }

  neuron.success = true;

  props.closeModal();
};
</script>
