export default async function renderTick(graph, data) {
  const nodes = graph.getNodes();
  const nodeMap = nodes.reduce((acc, node) => {
    acc[node.getModel().id] = node;
    return acc;
  }, {});

  const promises = data.map(async (item) => {
    const node = nodeMap[item.id];
    const { type, content, delay } = node.getModel();

    if (content !== item.content && delay !== item.delay) {
      node.update({
        content: item.content,
        delay: item.delay,
      });
    } else {
      if (content !== item.content) {
        node.update({
          content: item.content,
        });
      }
      if (delay !== item.delay) {
        node.update({
          delay: item.delay,
        });
      }
    }

    if (type === 'output') {
      node.getInEdges().forEach((edge) => {
        edge.refresh();
      });
    }

    if (!node.hasState(item.state)) {
      node.clearStates(['spiking', 'closed', 'forgetting']);

      if (item.state !== 'default') {
        node.setState(item.state, true);
      }
      node.getOutEdges().forEach((edge) => {
        edge.setState('spiking', item.state === 'spiking');
      });
    }
  });
  await Promise.all(promises);
}
