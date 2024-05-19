export default function duplicateItems(graph) {
  const copies = [];

  graph.findAllByState("node", "selected").forEach((node) => {
    const model = node.getModel();
    copies.push({
      type: "node",
      model: {
        ...model,
        id: `${model.id}-copy`,
        x: model.x + 10,
        y: model.y + 10,
      },
    });
    node.clearStates("selected");
  });
  graph.findAllByState("edge", "selected").forEach((edge) => {
    const model = edge.getModel();
    copies.push({
      type: "edge",
      model: {
        ...model,
        id: `${model.id}-copy`,
        source: `${model.source}-copy`,
        target: `${model.target}-copy`,
      },
    });
    edge.clearStates("selected");
  });

  graph.addItems(copies, true);

  copies.forEach((copy) => {
    graph.setItemState(copy.model.id, "selected", true);
  });
}
