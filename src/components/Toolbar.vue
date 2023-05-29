<script setup>
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue';
import { navbar } from '@/stores/navbar.js';
import Logo from '@/assets/logo.vue';
import graph from '@/stores/graph';
import parseSystem from '@/graph/utils/parse-system';
import { useDark, useToggle } from '@vueuse/core';
import { undo, redo } from '@/graph/utils/action-stack';

const isDark = useDark();
const toggleDark = useToggle(isDark);

const toggleDisplay = () => {
  navbar.view = navbar.view == 'default' ? 'simple' : 'default';
};

const openFileInput = () => {
  document.getElementById('fileInput').click();
};

const handleFileUpload = (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    const contents = e.target.result;
    const json = JSON.parse(contents);
    graph.value.read(parseSystem(json));
  };
  reader.readAsText(file);
};

const emit = defineEmits(['clear']);

const changeActiveMode = (newMode) => {
  navbar.mode = newMode;
};

const clearAll = () => {
  emit('clear');
};
</script>

<template>
  <div
    class="absolute left-0 right-0 flex items-center p-1 mx-auto rounded-md shadow-lg top-2 w-fit bg-base dark:bg-light"
  >
    <Menu as="div" class="relative h-full">
      <MenuButton
        class="flex items-center justify-center px-2 text-sm font-medium text-primary open:bg-primary/40 open:text-base hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-base focus-visible:ring-opacity-75"
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
          class="absolute py-1 mt-2 text-base origin-top-left divide-y rounded-md shadow shadow-dark left-1 w-max divide-dark/10 bg-dark dark:bg-light ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <MenuItem v-slot="{ active }" ref="samples">
            <button :class="active ? 'bg-primary' : ''" class="menu-button">
              <v-icon name="la-flask-solid" class="mr-2" />
              Samples
            </button>
          </MenuItem>
          <MenuItem v-slot="{ active }" ref="load">
            <button
              :class="active ? 'bg-primary' : ''"
              class="menu-button"
              @click="openFileInput"
            >
              <input
                type="file"
                id="fileInput"
                style="display: none"
                @change="handleFileUpload"
              />
              <v-icon name="la-project-diagram-solid" class="mr-2" />
              Load
            </button>
          </MenuItem>
          <MenuItem v-slot="{ active }" ref="save">
            <button :class="active ? 'bg-primary' : ''" class="menu-button">
              <v-icon name="la-save" class="mr-2" />
              Save
            </button>
          </MenuItem>
          <MenuItem v-slot="{ active }" ref="settings" @click="toggleDark()">
            <button :class="active ? 'bg-primary' : ''" class="menu-button">
              <v-icon name="la-cog-solid" class="mr-2" />
              Settings
            </button>
          </MenuItem>
        </MenuItems>
      </transition>
    </Menu>
    <div class="flex w-px h-5 mx-1 bg-dark/10" />
    <div class="flex justify-between w-full">
      <div>
        <Popper class="tooltip" hover>
          <template #content>
            Select
            <span class="ml-2 text-base/50">V</span>
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
            <span class="ml-2 text-base/50">N</span>
          </template>
          <button
            type="button"
            @click="changeActiveMode('node')"
            class="tool-button"
            :class="navbar.mode == 'node' ? 'tool-active' : ''"
          >
            <v-icon name="la-square" />
          </button>
        </Popper>
        <Popper class="tooltip" hover>
          <template #content>
            Edge
            <span class="ml-2 text-base/50">E</span>
          </template>
          <button
            @click="changeActiveMode('edge')"
            class="tool-button"
            :class="navbar.mode == 'edge' ? 'tool-active' : ''"
          >
            <v-icon name="la-arrow-left-solid" class="rotate-45" />
          </button>
        </Popper>
        <Popper class="tooltip" hover>
          <template #content>
            Delete
            <span class="ml-2 text-base/50">D</span>
          </template>
          <button
            @click="changeActiveMode('delete')"
            class="tool-button"
            :class="navbar.mode == 'delete' ? 'tool-active' : ''"
          >
            <v-icon
              name="la-eraser-solid"
              class="after:content-[' '] after:block after:bg-dark-50 after:h-2 after:w-full"
            />
          </button>
        </Popper>

        <Popper class="tooltip" hover>
          <template #content>
            Hand
            <span class="ml-2 text-base/50">H</span>
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
            <span class="ml-2 text-base/50">^z</span>
          </template>
          <button class="tool-button" @click="undo">
            <v-icon name="la-undo-solid" />
          </button>
        </Popper>

        <Popper class="tooltip" hover>
          <template #content>
            Redo
            <span class="ml-2 text-base/50">^Z</span>
          </template>
          <button class="tool-button" @click="redo">
            <v-icon name="la-redo-solid" />
          </button>
        </Popper>
        <Popper class="tooltip" hover>
          <template #content>
            Clear
            <span class="ml-2 text-base/50">Q</span>
          </template>
          <button @click="clearAll" class="tool-button">
            <v-icon name="la-trash-alt-solid" />
          </button>
        </Popper>
        <Popper class="tooltip" hover>
          <template #content>
            View
            <span class="ml-2 text-base/50">Y</span>
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
</template>