import { watch, reactive, computed } from 'vue';
import graph from './graph';
import sample from '../data.json';
import { exportSytem, importSystem } from '@/graph/utils/parse-system';

const system = reactive({
  data: computed(() =>
    graph.value ? exportSytem(graph.value) : importSystem(sample)
  ),
  mode: 'pseudorandom',
  states: [],
  configuration: [],
  duration: 3000,
  tick: 0,
});

watch(graph.value, (newValue) => {
  system.data = exportSytem(newValue);
});

watch(
  () => system.states,
  (newValue, oldValue) => {
    for (const key in newValue) {
      if (newValue[key] !== oldValue[key]) {
        const node = graph.value.findById(key);
        const edges = graph.value.getEdges().filter((edge) => {
          return edge.getSource().getID() === key;
        });

        for (const edge of edges) {
          graph.value.setItemState(edge, 'animate', false);
          graph.value.setItemState(
            edge,
            'animate',
            newValue[key].value === 'animate'
          );
        }
        node.clearStates(['default', 'animate', 'closed']);
        graph.value.setItemState(node, newValue[key].value, true);
        graph.value.setItemState(node, 'running', true);
      }
    }
  }
);

watch(
  () => system.configuration,
  (newValue, oldValue) => {
    for (const key in newValue) {
      if (newValue[key] !== oldValue[key]) {
        const node = graph.value.findById(key);
        node.update({
          content: newValue[key],
        });
      }
    }
  }
);

watch(
  () => system.tick,
  (newTick) => {
    states.value = status_list.value[newTick];
    config.value = config_list.value[newTick];
  }
);

export default system;
