export const importSystem = (system) => {
  const { neurons, synapses } = system;

  const graph_nodes = neurons.map((node) => {
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
};

export const exportSytem = (graph) => {
  const nodes = graph.save().nodes;
  const edges = graph.save().edges;

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
    neurons: parsed_nodes,
    synapses: parsed_edges,
  };

  return parsed_system;
};

export const saveSystem = (graph) => {
  const a = document.createElement('a');
  const file = new Blob([JSON.stringify(exportSytem(graph))], {
    type: 'text/plain',
  });
  a.href = URL.createObjectURL(file);
  a.download = 'system.json';
  a.click();
};
