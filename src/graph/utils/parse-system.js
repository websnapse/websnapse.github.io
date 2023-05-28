export default function parseSystem(system) {
  const { nodes, synapses } = system;

  const graph_nodes = nodes.map((node) => {
    const { id, content, rules, type, position } = node;

    return {
      id,
      content,
      rules,
      type,
      x: position.x,
      y: position.y,
    };
  });
  const graph_edges = synapses.map((synapse) => {
    return {
      source: synapse.from,
      target: synapse.to,
      label: synapse.weight,
    };
  });

  const graph_system = {
    nodes: graph_nodes,
    edges: graph_edges,
  };

  return graph_system;
}
