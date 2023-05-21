export default function deleteItems(graph) {
  graph.getNodes().forEach((node) => {
    if (node.hasState('selected')) {
      setTimeout(() => {
        graph.removeItem(node);
      }, 100);
    }
  });
  graph.getEdges().forEach((edge) => {
    if (edge.hasState('selected')) {
      setTimeout(() => {
        graph.removeItem(edge);
      }, 100);
    }
  });
}
