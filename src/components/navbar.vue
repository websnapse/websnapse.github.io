<template>
  <div
    class="w-screen h-10 bg-gray-200 flex justify-start items-center px-5 gap-10"
  >
    <div class="h-full w-fit flex items-center font-bold text-2xl">
      WebSnapse
    </div>
    <div>
      <button
        @click="changeActiveMode('default')"
        :class="mode == 'default' ? 'nav-button active' : 'nav-button inactive'"
      >
        <v-icon name="bi-cursor-fill" />
      </button>

      <button
        @click="changeActiveMode('add')"
        :class="mode == 'add' ? 'nav-button active' : 'nav-button inactive'"
      >
        <v-icon name="bi-plus-circle" />
      </button>

      <button
        @click="changeActiveMode('remove')"
        :class="mode == 'remove' ? 'nav-button active' : 'nav-button inactive'"
      >
        <v-icon name="bi-x-circle" />
      </button>

      <button class="nav-button inactive">
        <v-icon name="bi-arrow-counterclockwise" />
      </button>

      <button class="nav-button inactive">
        <v-icon name="bi-arrow-clockwise" />
      </button>

      <button @click="clearAll" class="nav-button inactive">
        <v-icon name="bi-trash" />
      </button>

      <button class="nav-button inactive">
        <v-icon name="bi-upload" />
      </button>

      <button class="nav-button inactive">
        <v-icon name="bi-download" />
      </button>
    </div>
    <div>
      <button
        type="button"
        @click="openModal"
        class="rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
      >
        Open dialog
      </button>
    </div>
  </div>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-10">
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
          class="flex min-h-full items-center justify-center p-4 text-center"
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
                        for="default-search"
                        class="mb-2 text-sm font-medium text-gray-900"
                      >
                        Label
                      </label>
                      <input
                        type="search"
                        id="default-search"
                        v-model="neuron.label"
                        class="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="n1"
                        required
                      />
                    </div>
                    <div class="relative flex flex-col gap-1">
                      <label
                        for="default-search"
                        class="mb-2 text-sm font-medium text-gray-900"
                      >
                        Content
                      </label>
                      <input
                        type="search"
                        id="default-search"
                        v-model="neuron.content"
                        class="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="a"
                        required
                      />
                    </div>
                    <div class="relative flex flex-col gap-1">
                      <label
                        for="message"
                        class="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Rules
                      </label>
                      <textarea
                        id="message"
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
  </TransitionRoot>
</template>

<style scoped>
.MathJax_Display {
  margin: 0;
}
</style>

<script setup>
import { ref } from 'vue';
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue';

import { neuron } from '../stores/neuron.js';

const isOpen = ref(false);

const closeModal = () => {
  console.log(neuron.value);
  isOpen.value = false;
};
const openModal = () => {
  isOpen.value = true;
};

const emit = defineEmits(['changeMode', 'clear']);

const mode = ref('default');
const clear_all = ref(false);

const changeActiveMode = (new_mode) => {
  mode.value = new_mode;
  emit('changeMode', new_mode);
};

const clearAll = () => {
  emit('clear');
};
</script>
