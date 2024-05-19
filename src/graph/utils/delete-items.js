import rulebook from "@/stores/rulebook";

export default function deleteItems(graph) {
  graph.findAllByState("node", "selected").forEach((node) => {
    setTimeout(() => {
      delete rulebook.all_rules[node.getModel().id];
      graph.removeItem(node);
    }, 100);
  });
  graph.findAllByState("edge", "selected").forEach((edge) => {
    setTimeout(() => {
      for (const [index, cur_edge] of Object.entries(rulebook.global_edges)) {
        if (
          cur_edge["from"] == edge.getModel().source &&
          cur_edge["to"] == edge.getModel().target
        ) {
          rulebook.global_edges.splice(index, 1);
          break;
        }
      }
      graph.removeItem(edge);
    }, 100);
  });
}
