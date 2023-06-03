export default function deleteItems(graph) {
  graph.findAllByState('node', 'selected').forEach((node) => {
    setTimeout(() => {
      graph.removeItem(node);
    }, 100);
  });
  graph.findAllByState('edge', 'selected').forEach((edge) => {
    setTimeout(() => {
      graph.removeItem(edge);
    }, 100);
  });
}
