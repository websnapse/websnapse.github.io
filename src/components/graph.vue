<template>
  <div id="mountNode" class="flex justify-center items-start"></div>
</template>

<script setup>
import G6 from '@antv/g6';
import { onMounted, ref, watch } from 'vue';
import { initializeGraph, createGraph } from '../utils/graph';

import graphData from '../data.json';

const props = defineProps(['graph_mode', 'clear_all']);

const data = graphData;

const formula = ref('$$x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}.$$');

const vh = window.innerHeight - 40;
const vw = window.innerWidth;

const neurons = ref(0);

initializeGraph(neurons);

const g6 = (data) => {
  // For graph instantiation, at least the mounting container, width and height need to be set for the graph
  const graph = createGraph('mountNode', vw, vh);

  graph.on('aftercreateedge', (e) => {
    const edges = graph.save().edges;
    G6.Util.processParallelEdges(edges);
    graph.getEdges().forEach((edge, i) => {
      graph.updateItem(edge, {
        curveOffset: edges[i].curveOffset,
        curvePosition: edges[i].curvePosition,
      });
    });
  });

  graph.on('click', (ev) => {
    const shape = ev.target;
    const item = ev.item;
    // console.log(graph.getNodes());
    if (item) {
      const type = item.getType();
      // console.log(type);
    }
  });
  // Data loading and rendering of Graphs
  graph.data(data);
  graph.render();

  watch(
    () => props.graph_mode,
    (val) => {
      graph.setMode(val);
    }
  );

  watch(
    () => props.clear_all,
    () => {
      if (props.clear_all) graph.clear();
    }
  );
};

onMounted(() => {
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
