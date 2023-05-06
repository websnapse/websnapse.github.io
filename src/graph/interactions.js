export default function interact(graph) {
  graph.on('click', (ev) => {
    const shape = ev.target;
    const item = ev.item;
    if (item) {
      const type = item.getType();
    }
  });

  graph.on('node:mouseenter', (evt) => {
    const { item } = evt;
    item.setState('hover', true);
  });

  graph.on('node:mouseleave', (evt) => {
    const { item } = evt;
    item.clearStates('hover');
  });

  graph.on('edge:mouseenter', (evt) => {
    const { item } = evt;
    item.setState('hover', true);
  });

  graph.on('edge:mouseleave', (evt) => {
    const { item } = evt;
    item.clearStates('hover');
  });

  graph.on('edge:click', (evt) => {
    const { item } = evt;
    item.setState('selected', true);
  });

  graph.on('node:click', (evt) => {
    const { item } = evt;
    item.setState('selected', true);
  });

  graph.on('canvas:click', (evt) => {
    graph.getNodes().forEach((node) => {
      if (node.hasState('selected')) {
        node.setState('selected', false);
      }
    });
    graph.getEdges().forEach((edge) => {
      if (edge.hasState('selected')) {
        edge.setState('selected', false);
      }
    });
  });

  graph.on('node:mouseleave', function (evt) {
    const node = evt.item;
    const model = node.getModel();
    graph.updateItem(node, {
      label: model.oriLabel,
      labelCfg: {
        style: {
          fill: '#555',
        },
      },
    });
  });

  graph.on('content:dblclick', function (evt) {
    console.log('edit content');
  });

  graph.on('wheelzoom', (e) => {
    e.stopPropagation();
    // className g6-component-tooltip by default
    const menu = Array.from(
      document.getElementsByClassName('g6-component-contextmenu')
    );
    menu.forEach((tooltip) => {
      if (tooltip && tooltip.style) {
        tooltip.style.transformOrigin = '0 0';
        tooltip.style.transform = `scale(${graph.getZoom()})`;
      }
    });
  });
}
