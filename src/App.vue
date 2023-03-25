<script setup>
import navbar from './components/navbar.vue';
import graph from './components/graph.vue';
import { ref } from 'vue';

const mode = ref('default');
const clear = ref(false);

const changeMode = (newmode) => {
  mode.value = newmode
};

const clearAll = () => {
  clear.value = true;
  setTimeout(() => {
    clear.value = false;
  }, 100);
};
</script>

<template>
  <navbar @changeMode="changeMode" @clear="clearAll" />
  <graph :graph_mode="mode" :clear_all="clear" />
</template>

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
