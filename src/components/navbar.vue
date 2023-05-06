<template>
  <div class="w-full border-b flex items-center">
    <Menu as="div" class="relative">
      <MenuButton
        class="px-2 flex items-center justify-center text-sm font-medium hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-base focus-visible:ring-opacity-75"
      >
        <img src="../assets/logo.svg" class="w-10" />
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
              <v-icon name="co-beaker" class="mr-2" />
              Samples
            </button>
          </MenuItem>
          <MenuItem v-slot="{ active }">
            <button :class="active ? 'bg-primary' : ''" class="menu-button">
              <v-icon name="co-graph" class="mr-2" />
              Load
            </button>
          </MenuItem>
          <MenuItem v-slot="{ active }">
            <button :class="active ? 'bg-primary' : ''" class="menu-button">
              <v-icon name="co-save" class="mr-2" />
              Save
            </button>
          </MenuItem>
        </MenuItems>
      </transition>
    </Menu>
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
            <v-icon name="co-cursor" flip="horizontal" />
          </button>
        </Popper>
        <Popper class="tooltip" hover>
          <template #content>
            Edit
            <span class="text-base/50 ml-2">E</span>
          </template>
          <button
            @click="changeActiveMode('edit')"
            class="tool-button"
            :class="navbar.mode == 'edit' ? 'tool-active' : ''"
          >
            <v-icon name="co-pencil" />
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
            <v-icon name="co-x-circle" />
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
            <v-icon name="co-touch-app" />
          </button>
        </Popper>

        <Popper class="tooltip" hover>
          <template #content>
            Undo
            <span class="text-base/50 ml-2">^z</span>
          </template>
          <button class="tool-button">
            <v-icon name="co-action-undo" class="rotate-90" />
          </button>
        </Popper>

        <Popper class="tooltip" hover>
          <template #content>
            Redo
            <span class="text-base/50 ml-2">^Z</span>
          </template>
          <button class="tool-button">
            <v-icon name="co-action-redo" class="-rotate-90" />
          </button>
        </Popper>
        <button @click="clearAll" class="tool-button">
          <v-icon name="co-trash" />
        </button>
      </div>
      <div class="flex gap-2">
        <button type="button" @click="openModal" class="nav-button">
          <v-icon name="hi-view-grid-add" class="mr-1" />
          Add node
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

<script setup>
import { ref } from 'vue';
import { TransitionRoot } from '@headlessui/vue';
import NeuronDialog from './neurondialog.vue';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue';
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
