<template>
  <button @click="changeData">change</button>
  <div id="mountNode" class="flex justify-center items-start"></div>
</template>

<script setup>
import G6 from '@antv/g6';
import { onMounted, ref, watch } from 'vue';
import { createGraph } from '../utils/g6-graph';
import { initializeRegisters } from '../utils/g6-registers';
import { neuron } from '../stores/neuron';
import { system } from '../stores/system';

const props = defineProps(['graph_mode', 'clear_all']);

const data = system;

console.log(system);

const vh = window.innerHeight - 40;
const vw = window.innerWidth;

const init = async () => {
  await initializeRegisters(neuron);
};

init();

const changeData = () => {
  data.value = {
    nodes: [
      {
        label: 'n1',
        nodeType: 'regular',
        id: 'n_1',
        content: 'a',
        rules: ['a \\to a;0', 'a^2 \\to 0'],
        x: 100,
        y: 100,
      },
    ],
  };
};

const status = ref(false);

// setTimeout(() => {
//   status.value = 'animate';
// }, 1000);

// setInterval(function() {
//   status.value = 'normal';
// }, 2000);

// switch status value to animate and normal periodically
setInterval(function () {
  status.value = !status.value;
}, 3000);

const updateEdges = (edges) => {
  system.value.setEdges(edges);
  console.log(system.value.edges);
};

const g6 = (system) => {
  // For graph instantiation, at least the mounting container, width and height need to be set for the graph
  const graph = createGraph('mountNode', vw, vh, updateEdges);

  graph.data(data.value);
  graph.render();

  watch(
    () => props.graph_mode,
    (val) => {
      graph.setMode(val);
    }
  );

  watch(status, (val) => {
    // loop over nodes and change status
    graph.getNodes().forEach((node) => {
      graph.setItemState(node, 'animate', val);
    });
    graph.getEdges().forEach((edge) => {
      graph.setItemState(edge, 'animate', val);
    });
  });

  watch(system, (newSystem) => {
    graph.changeData(newSystem);
    console.log(newSystem);
  });

  watch(
    () => props.clear_all,
    () => {
      if (props.clear_all) graph.clear();
    }
  );
};

onMounted(async () => {
  g6(data);
  if (typeof window !== 'undefined')
    window.onresize = () => {
      if (!graph || graph.get('destroyed')) return;
      if (!container || !container.scrollWidth || !container.scrollHeight)
        return;
      graph.changeSize(container.scrollWidth, container.scrollHeight);
    };
});
</script>
