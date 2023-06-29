<script setup>
import { useDark, useToggle } from '@vueuse/core';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue';
import Logo from '@/assets/logo.vue';

import { saveSystem } from '@/graph/utils/parse-system';

import settings from '@/stores/settings';
import navbar from '@/stores/navbar.js';
import graph from '@/stores/graph';
import system from '@/stores/system';
import dialog from '@/stores/dialog';
import { ref } from 'vue';

const isDark = useDark();
const toggleDark = useToggle(isDark);

const saveGraph = () => saveSystem(graph.value);

const openFileInput = () => {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  fileInput.id = 'fileInput';
  fileInput.style.display = 'none';
  fileInput.onchange = () => {
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      emit('load', data);
    };
    reader.readAsText(file);
  };
  document.body.appendChild(fileInput);
  document.getElementById('fileInput').click();
  document.body.removeChild(fileInput);
};

const samples = [
  {
    name: '2N Generator',
    file: 'multiples-of/multiples_of(002).json',
  },
  {
    name: 'Bit Adder',
    file: 'bit-adder/bit_adder([7,11]).json',
  },
  {
    name: 'Comparator',
    file: 'comparator/comparator(4,2).json',
  },
  {
    name: 'Subset Sum',
    file: 'subset-sum/subset_sum([1,2,3],5).json',
  },
];

const loadSample = (file) => {
  // load file from public/samples
  fetch(`/samples/${file}`)
    .then((res) => res.json())
    .then((data) => {
      emit('load', data);
    });
};

const emit = defineEmits(['load', 'clear']);

const changeActiveMode = (newMode) => {
  navbar.mode = newMode;
};

const getHistory = () => {
  try {
    system.ws.send(JSON.stringify({ cmd: 'history' }));
  } catch (e) {}
  dialog.choiceHistory = true;
};
</script>

<template>
  <div class="absolute left-0 right-0 z-10 flex gap-2 mx-auto top-2 w-fit">
    <div
      class="flex items-center p-1 border rounded-md shadow-sm bg-light/80 backdrop-blur-sm border-dark/5 dark:border-light/5 dark:bg-neutral/80"
    >
      <Menu as="div" class="relative h-full">
        <MenuButton
          class="flex items-center justify-center px-2 text-sm font-medium text-primary open:bg-primary/40 open:text-light hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-light focus-visible:ring-opacity-75"
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
            class="absolute py-1 mt-2 origin-top-left divide-y rounded-md shadow text-light shadow-dark left-1 w-max divide-dark/10 dark:divide-light/10 bg-dark dark:bg-light dark:text-dark ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            <MenuItem v-slot="{ active }" ref="get-samples">
              <Popover v-slot="{ open }" class="relative">
                <PopoverButton
                  :class="active ? 'bg-primary' : ''"
                  class="menu-button"
                >
                  <v-icon name="la-flask-solid" class="mr-2" />
                  Samples
                </PopoverButton>

                <transition
                  enter-active-class="transition duration-200 ease-out"
                  enter-from-class="-translate-x-1 opacity-0"
                  enter-to-class="translate-x-0 opacity-100"
                  leave-active-class="transition duration-150 ease-in"
                  leave-from-class="translate-x-0 opacity-100"
                  leave-to-class="-translate-x-1 opacity-0"
                >
                  <PopoverPanel
                    class="absolute top-0 z-10 w-full ml-2 left-full"
                  >
                    <ul
                      class="flex flex-col py-1 rounded-lg shadow text-light bg-dark shadow-dark left-1 w-max divide-dark/10 dark:divide-light/10 dark:bg-light dark:text-dark ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                      <li v-for="sample in samples">
                        <button
                          class="w-full px-4 py-2 text-left hover:bg-light/10 dark:hover:bg-dark/10"
                          @click="loadSample(sample.file)"
                        >
                          {{ sample.name }}
                        </button>
                      </li>
                    </ul>
                  </PopoverPanel>
                </transition>
              </Popover>
            </MenuItem>
            <MenuItem v-slot="{ active }" ref="load">
              <button
                :class="active ? 'bg-primary' : ''"
                class="menu-button"
                @click="openFileInput"
              >
                <v-icon name="la-project-diagram-solid" class="mr-2" />
                Load
              </button>
            </MenuItem>
            <MenuItem v-slot="{ active }" ref="save">
              <button
                :class="active ? 'bg-primary' : ''"
                class="menu-button"
                @click="saveGraph"
              >
                <v-icon name="la-save" class="mr-2" />
                Save
              </button>
            </MenuItem>
            <MenuItem v-slot="{ active }" ref="setting" @click="toggleDark()">
              <button :class="active ? 'bg-primary' : ''" class="menu-button">
                <v-icon
                  name="la-moon-solid"
                  v-if="!settings.dark"
                  class="mr-2"
                />
                <v-icon name="la-sun-solid" v-else class="mr-2" />
                Theme
              </button>
            </MenuItem>
          </MenuItems>
        </transition>
      </Menu>
      <div class="flex w-px h-5 mx-1 bg-dark/10 dark:bg-light/10"></div>
      <div class="flex justify-between w-full">
        <div>
          <Popper class="tooltip" hover>
            <template #content>
              Select
              <span class="ml-2 text-light/50 dark:text-dark/50">V</span>
            </template>
            <button
              @click="changeActiveMode('default')"
              class="p-3 tool-button"
              :class="navbar.mode == 'default' ? 'tool-active' : ''"
            >
              <v-icon name="la-mouse-pointer-solid" />
            </button>
          </Popper>
          <Popper class="tooltip" hover>
            <template #content>
              Node
              <span class="ml-2 text-light/50 dark:text-dark/50">N</span>
            </template>
            <button
              type="button"
              @click="changeActiveMode('node')"
              class="p-3 tool-button"
              :class="navbar.mode == 'node' ? 'tool-active' : ''"
            >
              <v-icon name="la-square" />
            </button>
          </Popper>
          <Popper class="tooltip" hover>
            <template #content>
              Edge
              <span class="ml-2 text-light/50 dark:text-dark/50">E</span>
            </template>
            <button
              @click="changeActiveMode('edge')"
              class="p-3 tool-button"
              :class="navbar.mode == 'edge' ? 'tool-active' : ''"
            >
              <v-icon name="la-arrow-left-solid" class="rotate-45" />
            </button>
          </Popper>
          <Popper class="tooltip" hover>
            <template #content>
              Delete
              <span class="ml-2 text-light/50 dark:text-dark/50">D</span>
            </template>
            <button
              @click="changeActiveMode('delete')"
              class="p-3 tool-button"
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
              <span class="ml-2 text-light/50 dark:text-dark/50">H</span>
            </template>
            <button
              @click="changeActiveMode('pan')"
              class="p-3 tool-button"
              :class="navbar.mode == 'pan' ? 'tool-active' : ''"
            >
              <v-icon name="la-hand-paper" />
            </button>
          </Popper>
          <Popper class="tooltip" hover>
            <template #content>
              Clear
              <span class="ml-2 text-light/50 dark:text-dark/50">Q</span>
            </template>
            <button @click="$emit('clear')" class="p-3 tool-button">
              <v-icon name="la-trash-alt-solid" />
            </button>
          </Popper>
        </div>
      </div>
    </div>

    <div
      class="p-1 border rounded-md shadow-sm bg-light/80 backdrop-blur-sm border-dark/5 dark:border-light/5 dark:bg-neutral/80"
    >
      <Popper class="tooltip" hover>
        <template #content> History </template>
        <button @click="getHistory" class="p-3 tool-button">
          <v-icon name="la-history-solid" />
        </button>
      </Popper>
    </div>
  </div>
</template>
