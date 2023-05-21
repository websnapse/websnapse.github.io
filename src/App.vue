<script setup>
import { ref } from 'vue';
import Navbar from './components/navbar.vue';
import Graph from './components/graph.vue';

const mode = ref('default');
const clear = ref(false);

const changeMode = (newmode) => {
  mode.value = newmode;
};

const clearAll = () => {
  clear.value = true;
  setTimeout(() => {
    clear.value = false;
  }, 100);
};
</script>

<template>
  <main class="flex flex-col h-screen">
    <navbar @clear="clearAll" />
    <graph :graph_mode="mode" :clear_all="clear" />
  </main>
</template>

<style>
@import 'katex/dist/katex.min.css';
</style>
