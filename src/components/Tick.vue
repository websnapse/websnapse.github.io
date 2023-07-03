<template>
  <div class="absolute flex gap-4 sm:top-2 top-16 left-2 w-fit">
    <div
      class="p-4 leading-none border rounded-md shadow-sm dark:text-dark-50 top-full w-fit bg-light -z-1 bg-light/80 backdrop-blur-sm border-dark/[0.15] dark:border-light/5 dark:bg-neutral/80"
    >
      <v-icon name="la-clock-solid" />
      Tick:
      <span class="ml-2 font-bold dark:text-light/80">{{ system.tick }}</span>
    </div>
  </div>
</template>

<script setup>
import system from '@/stores/system';
</script>
