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
    <Navbar @changeMode="changeMode" @clear="clearAll" />
    <Graph :graph_mode="mode" :clear_all="clear" />
  </main>
</template>

<style>
@import 'katex/dist/katex.min.css';
</style>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
