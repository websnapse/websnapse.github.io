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
            navbar.mode == 'default'
              ? 'tool-button active'
              : 'tool-button inactive'
          "
        >
          <v-icon name="co-cursor" flip="horizontal" />
        </button>
        <button
          @click="changeActiveMode('edit')"
          :class="
            navbar.mode == 'edit'
              ? 'tool-button active'
              : 'tool-button inactive'
          "
        >
          <v-icon name="hi-pencil" />
        </button>
        <button
          @click="changeActiveMode('delete')"
          :class="
            navbar.mode == 'delete'
              ? 'tool-button active'
              : 'tool-button inactive'
          "
        >
          <v-icon name="hi-minus-circle" />
        </button>
        <button
          @click="changeActiveMode('pan')"
          :class="
            navbar.mode == 'pan' ? 'tool-button active' : 'tool-button inactive'
          "
        >
          <v-icon name="hi-hand" />
        </button>
        <button class="tool-button inactive">
          <v-icon name="hi-reply" />
        </button>
        <button class="tool-button inactive">
          <v-icon name="hi-reply" flip="horizontal" />
        </button>
        <button @click="clearAll" class="tool-button inactive">
          <v-icon name="bi-trash" />
        </button>
        <button class="tool-button inactive">
          <v-icon name="bi-upload" />
        </button>
        <button class="tool-button inactive">
          <v-icon name="bi-download" />
        </button>
      </div>
      <div class="flex gap-2">
        <button type="button" @click="openModal" class="nav-button">
          <v-icon name="hi-view-grid-add" class="mr-1" />
          Add node
        </button>
        <button type="button" class="nav-button">
          <v-icon name="hi-beaker" class="mr-1" />
          Samples
        </button>
        <button type="button" class="nav-button">
          <v-icon name="hi-upload" class="mr-1" />
          Upload
        </button>
        <button type="button" class="nav-button">
          <v-icon name="hi-download" class="mr-1" />
          Save
        </button>
        <button type="button" @click="toggleDisplay" class="nav-button">
          <v-icon
            :name="
              navbar.view === 'default'
                ? 'pr-window-maximize'
                : 'pr-window-minimize'
            "
          />
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

const clear_all = ref(false);

const changeActiveMode = (newMode) => {
  navbar.value.mode = newMode;
};

const clearAll = () => {
  emit('clear');
};
</script>
