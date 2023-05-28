import { watch, reactive, computed } from 'vue';
import graph from './graph';
import sample from '../data.json';

const system = reactive({
  data: computed({
    get() {
      const nodes = graph.value?.save().nodes;
      const edges = graph.value?.save().edges;

      const parsed_nodes = nodes?.map((node) => {
        const { id, content, rules, type, x, y } = node;

        if (type === 'input' || type === 'output') {
          return {
            id,
            type,
            content,
            position: {
              x,
              y,
            },
          };
        }

        return {
          id,
          content,
          rules,
          type,
          position: {
            x,
            y,
          },
        };
      });
      const parsed_edges = edges?.map((edge) => {
        return {
          from: edge.source,
          to: edge.target,
          weight: edge.label,
        };
      });

      const parsed_system = {
        nodes: parsed_nodes ?? sample.nodes,
        synapses: parsed_edges ?? sample.synapses,
      };

      return parsed_system;
    },
  }),
  states: [],
  configuration: [],
  duration: 3000,
  tick: 0,
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
  () => system.duration,
  (newDuration) => {
    if (navbar.running) {
      if (tick.value < max_tick.value) {
        clearInterval(intervalId);
        intervalId = setInterval(() => {
          tick.value++;
        }, newDuration);
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
  () => system.duration,
  (newDuration) => {
    // get graph.value items
    const nodes = graph.value?.getNodes();
    const edges = graph.value?.getEdges();

    // set the duration of each node and edge
    nodes?.forEach((node) => {
      const model = node.getModel();
      model.duration = newDuration;
      node.update(model);
    });
    edges?.forEach((edge) => {
      const model = edge.getModel();
      model.duration = newDuration;
      edge.update(model);
    });
  },
  { immediate: true }
);

watch(
  () => system.tick,
  (newTick) => {
    states.value = status_list.value[newTick];
    config.value = config_list.value[newTick];
  }
);

export default system;
