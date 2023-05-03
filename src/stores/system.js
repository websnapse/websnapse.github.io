import { ref } from 'vue';
import graphData from '../data.json';

export const system = ref({
  nodes: graphData.nodes,
  edges: graphData.edges,

  setEdges(newEdges) {
    this.edges = newEdges;
  },

  setNodes(newNodes) {
    this.nodes = newNodes;
  },
});
