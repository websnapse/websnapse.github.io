<template>
  <Dialog
    as="div"
    @close="props.closeModal"
    :open="props.isOpen"
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
      <div class="flex min-h-full items-center justify-center p-4 text-center">
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
            class="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
          >
            <DialogTitle
              as="h3"
              class="text-lg font-medium leading-6 text-gray-900"
            >
              Node Properties
            </DialogTitle>

            <div class="grid grid-cols-5 mt-4 gap-4">
              <div class="col-span-5">
                <form class="flex flex-col gap-4">
                  <div class="relative flex flex-col gap-1">
                    <label
                      for="label"
                      class="mb-2 text-sm font-medium text-gray-900"
                    >
                      Label
                    </label>
                    <input
                      type="text"
                      id="label"
                      v-model="neuron.label"
                      class="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                    <Listbox v-model="neuron.nodeType">
                      <div class="relative mt-1">
                        <ListboxButton
                          class="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm"
                        >
                          <span class="block truncate">{{
                            neuron.nodeType
                          }}</span>
                          <span
                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
                          >
                            <v-icon name="bi-chevron-expand" />
                          </span>
                        </ListboxButton>

                        <transition
                          leave-active-class="transition duration-100 ease-in"
                          leave-from-class="opacity-100"
                          leave-to-class="opacity-0"
                        >
                          <ListboxOptions
                            class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                          >
                            <ListboxOption
                              v-slot="{ active, selected }"
                              v-for="person in people"
                              :key="person"
                              :value="person"
                              as="template"
                            >
                              <li
                                :class="[
                                  active
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'text-gray-900',
                                  'relative cursor-default select-none py-2 pl-10 pr-4',
                                ]"
                              >
                                <span
                                  :class="[
                                    selected ? 'font-medium' : 'font-normal',
                                    'block truncate',
                                  ]"
                                  >{{ person }}</span
                                >
                                <span
                                  v-if="selected"
                                  class="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600"
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
                    >
                      Content
                    </label>
                    <input
                      type="text"
                      id="content"
                      v-model="neuron.content"
                      class="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="a"
                      required
                    />
                  </div>
                  <div
                    class="relative flex flex-col gap-1"
                    v-if="neuron.nodeType === 'regular'"
                  >
                    <label
                      for="rules"
                      class="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Rules
                    </label>
                    <textarea
                      id="rules"
                      v-model="neuron.rules"
                      rows="4"
                      class="outline-none block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="a^2/a^2 \to a;0"
                    />
                  </div>
                </form>
              </div>
              <div
                class="relative col-span-2 items-center justify-center hidden"
              >
                <div
                  class="py-4 px-10 flex items-center flex-col border border-black rounded-3xl"
                >
                  <div class="w-fit">$$ a $$</div>
                  <div class="w-fit mt-4">$$ a^2 \to a $$</div>
                  <div class="w-fit">$$ a^2 \to a $$</div>
                </div>
              </div>

              <div class="mt-4">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  @click="closeModal"
                >
                  Create
                </button>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import {
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue';
import { neuron } from '../stores/neuron.js';
const props = defineProps(['isOpen', 'closeModal']);

import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue';

const people = ['regular', 'input', 'output'];
</script>
