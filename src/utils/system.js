const parsed_system = computed(() => {
  const { nodes, edges } = graph.save();

  const parsed_nodes = nodes.map((node) => {
    const { id, content, rules, type, x, y, spiketrain } = node;

    if (type === 'input' || type === 'output') {
      return {
        id,
        type,
        spiketrain,
        x,
        y,
      };
    }

    return {
      id,
      content,
      rules,
      type,
      x,
      y,
    };
  });
  const parsed_edges = edges.map((edge) => {
    return {
      source: edge.source,
      target: edge.target,
      label: edge.label,
    };
  });

  const parsed_system = {
    nodes: parsed_nodes,
    edges: parsed_edges,
  };

  return parsed_system;
});
