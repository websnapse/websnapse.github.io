<template>
  <div
    class="absolute p-1 top-2 left-0 right-0 mx-auto w-fit shadow-lg rounded-md bg-base flex items-center"
  >
    <Menu as="div" class="relative h-full">
      <MenuButton
        class="text-primary open:bg-primary/40 open:text-base px-2 flex items-center justify-center text-sm font-medium hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-base focus-visible:ring-opacity-75"
      >
        <Logo class="h-10 w-fit" />
        <v-icon name="bi-chevron-down" scale="0.5" />
      </MenuButton>

      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <MenuItems
          class="shadow shadow-dark absolute left-1 mt-2 w-max origin-top-left divide-y divide-dark/10 rounded-md py-1 bg-dark text-base ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <MenuItem v-slot="{ active }">
            <button :class="active ? 'bg-primary' : ''" class="menu-button">
              <v-icon name="la-flask-solid" class="mr-2" />
              Samples
            </button>
          </MenuItem>
          <MenuItem v-slot="{ active }">
            <button :class="active ? 'bg-primary' : ''" class="menu-button">
              <v-icon name="la-project-diagram-solid" class="mr-2" />
              Load
            </button>
          </MenuItem>
          <MenuItem v-slot="{ active }">
            <button :class="active ? 'bg-primary' : ''" class="menu-button">
              <v-icon name="la-save" class="mr-2" />
              Save
            </button>
          </MenuItem>
        </MenuItems>
      </transition>
    </Menu>
    <div class="w-px bg-dark/10 flex mx-1 h-5" />
    <div class="flex justify-between w-full">
      <div>
        <Popper class="tooltip" hover>
          <template #content>
            Select
            <span class="text-base/50 ml-2">V</span>
          </template>
          <button
            @click="changeActiveMode('default')"
            class="tool-button"
            :class="navbar.mode == 'default' ? 'tool-active' : ''"
          >
            <v-icon name="la-mouse-pointer-solid" />
          </button>
        </Popper>

        <Popper class="tooltip" hover>
          <template #content>
            Node
            <span class="text-base/50 ml-2">N</span>
          </template>
          <button type="button" @click="openModal" class="tool-button">
            <v-icon name="la-square" />
          </button>
        </Popper>
        <Popper class="tooltip" hover>
          <template #content>
            Edge
            <span class="text-base/50 ml-2">E</span>
          </template>
          <button
            @click="changeActiveMode('edit')"
            class="tool-button"
            :class="navbar.mode == 'edit' ? 'tool-active' : ''"
          >
            <v-icon name="la-arrow-left-solid" class="rotate-45" />
          </button>
        </Popper>
        <Popper class="tooltip" hover>
          <template #content>
            Delete
            <span class="text-base/50 ml-2">D</span>
          </template>
          <button
            @click="changeActiveMode('delete')"
            class="tool-button"
            :class="navbar.mode == 'delete' ? 'tool-active' : ''"
          >
            <v-icon name="la-eraser-solid" />
          </button>
        </Popper>

        <Popper class="tooltip" hover>
          <template #content>
            Hand
            <span class="text-base/50 ml-2">H</span>
          </template>
          <button
            @click="changeActiveMode('pan')"
            class="tool-button"
            :class="navbar.mode == 'pan' ? 'tool-active' : ''"
          >
            <v-icon name="la-hand-paper" />
          </button>
        </Popper>

        <Popper class="tooltip" hover>
          <template #content>
            Undo
            <span class="text-base/50 ml-2">^z</span>
          </template>
          <button class="tool-button">
            <v-icon name="la-undo-solid" />
          </button>
        </Popper>

        <Popper class="tooltip" hover>
          <template #content>
            Redo
            <span class="text-base/50 ml-2">^Z</span>
          </template>
          <button class="tool-button">
            <v-icon name="la-redo-solid" />
          </button>
        </Popper>
        <Popper class="tooltip" hover>
          <template #content>
            Clear
            <span class="text-base/50 ml-2">Q</span>
          </template>
          <button @click="clearAll" class="tool-button">
            <v-icon name="la-trash-alt-solid" />
          </button>
        </Popper>
        <Popper class="tooltip" hover>
          <template #content>
            View
            <span class="text-base/50 ml-2">Y</span>
          </template>
          <button type="button" @click="toggleDisplay" class="tool-button">
            <v-icon
              :name="
                navbar.view === 'default'
                  ? 'pr-window-maximize'
                  : 'pr-window-minimize'
              "
            />
          </button>
        </Popper>
      </div>
    </div>
  </div>
  <TransitionRoot appear :show="isOpen" as="template">
    <NeuronDialog :isOpen="isOpen" :closeModal="closeModal" />
  </TransitionRoot>
</template>

<script setup>
import { ref } from 'vue';
import { TransitionRoot } from '@headlessui/vue';
import NeuronDialog from './neurondialog.vue';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue';
import { neuron } from '../stores/neuron.js';
import { navbar } from '../stores/navbar.js';
import Logo from '../assets/logo.vue';

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
