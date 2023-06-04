<template>
  <div class="absolute z-10 flex gap-2 mx-auto left-4 bottom-4 w-fit">
    <div
      class="flex items-center border divide-x rounded-md shadow-sm bg-light/80 backdrop-blur-sm border-dark/5 dark:border-light/5 dark:bg-neutral/80"
    >
      <div>
        <Popper class="tooltip" hover>
          <button class="p-2 tool-button" @click="$emit('zoomIn')">
            <v-icon scale="0.8" name="la-plus-solid" />
          </button>
        </Popper>
      </div>
      <div>
        <Popper class="tooltip" hover>
          <button class="p-2 tool-button" @click="$emit('zoomOut')">
            <v-icon scale="0.8" name="la-minus-solid" />
          </button>
        </Popper>
      </div>
    </div>
    <div
      class="flex items-center border divide-x rounded-md shadow-sm bg-light/80 backdrop-blur-sm border-dark/5 dark:border-light/5 dark:bg-neutral/80"
    >
      <div>
        <Popper class="tooltip" hover>
          <template #content>
            Undo
            <span class="ml-2 text-light/50 dark:text-dark/50">^z</span>
          </template>
          <button class="p-2 tool-button" @click="$emit('undo')">
            <v-icon scale="0.8" name="la-undo-solid" />
          </button>
        </Popper>
      </div>
      <div>
        <Popper class="tooltip" hover>
          <template #content>
            Redo
            <span class="ml-2 text-light/50 dark:text-dark/50">^Z</span>
          </template>
          <button class="p-2 tool-button" @click="$emit('redo')">
            <v-icon scale="0.8" name="la-redo-solid" />
          </button>
        </Popper>
      </div>
    </div>
    <div
      class="flex items-center border rounded-md shadow-sm bg-light/80 backdrop-blur-sm border-dark/5 dark:border-light/5 dark:bg-neutral/80"
    >
      <Popper class="tooltip" hover>
        <template #content>
          View
          <span class="ml-2 text-light/50 dark:text-dark/50">Y</span>
        </template>
        <button type="button" @click="toggleDisplay" class="p-2 tool-button">
          <v-icon
            scale="0.8"
            :name="
              settings.view === 'simple'
                ? 'pr-window-maximize'
                : 'pr-window-minimize'
            "
          />
        </button>
      </Popper>
    </div>
  </div>
</template>

<script setup>
import settings from '@/stores/settings';

const toggleDisplay = () => {
  settings.view = settings.view === 'full' ? 'simple' : 'full';
};
</script>
