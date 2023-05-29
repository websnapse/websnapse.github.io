<script setup>
import { ref } from 'vue';
import Toolbar from '@/components/Toolbar.vue';
import Canvas from '@/components/Canvas.vue';

const clear = ref(false);

const clearAll = () => {
  clear.value = true;
  setTimeout(() => {
    clear.value = false;
  }, 100);
};
</script>

<template>
  <main class="flex flex-col h-screen">
    <Toolbar @clear="clearAll" />
    <Canvas :graph_mode="mode" :clear_all="clear" />
  </main>
</template>

<style>
@import 'katex/dist/katex.min.css';
</style>
