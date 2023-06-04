import { watch, reactive } from 'vue';
import graph from './graph';
import sample from '../data.json';
import { exportSytem } from '@/graph/utils/parse-system';
import { useStorage } from '@vueuse/core';

const system = reactive({
  mode: 'pseudorandom',
  states: [],
  configuration: [],
  speed: 1.5,
  tick: 0,
  history: [],
  backup: useStorage('system', sample),
  reset: null,
  ws: null,

  data() {
    return graph.value ? exportSytem(graph.value) : this.backup;
  },
  backupSystem() {
    this.backup = system.reset
      ? exportSytem(system.reset)
      : exportSytem(graph.value);
  },
});

export default system;
