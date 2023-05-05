<template>
  <div class="w-screen h-10 bg-gray-200 flex items-center px-5 gap-10">
    <div class="h-full w-fit flex items-center font-bold text-2xl">
      WebSnapse
    </div>
    <div class="flex justify-between w-full">
      <div>
        <button
          @click="changeActiveMode('default')"
          :class="
            mode == 'default' ? 'nav-button active' : 'nav-button inactive'
          "
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
          :class="
            mode == 'remove' ? 'nav-button active' : 'nav-button inactive'
          "
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
      <div class="flex gap-2">
        <button
          type="button"
          @click="openModal"
          class="rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
        >
          Add node
        </button>
        <button
          type="button"
          class="rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
        >
          Samples
        </button>
        <button
          type="button"
          class="rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
        >
          Upload
        </button>
        <button
          type="button"
          class="rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
        >
          Save
        </button>
        <button
          type="button"
          @click="toggleDisplay"
          class="rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
        >
          Display Mode
        </button>
      </div>
    </div>
  </div>
  <TransitionRoot appear :show="isOpen" as="template">
    <NeuronDialog :isOpen="isOpen" :closeModal="closeModal" />
  </TransitionRoot>
</template>

<style scoped>
.MathJax_Display {
  margin: 0;
}
</style>

<script setup>
import { ref } from 'vue';
import { TransitionRoot } from '@headlessui/vue';
import NeuronDialog from './neurondialog.vue';
import { neuron } from '../stores/neuron.js';
import { navbar } from '../stores/navbar.js';

const isOpen = ref(false);

const closeModal = () => {
  console.log(neuron.value);
  isOpen.value = false;
};
const openModal = () => {
  isOpen.value = true;
};

const toggleDisplay = () => {
  navbar.value.view = navbar.value.view == 'default' ? 'simple' : 'default';
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
