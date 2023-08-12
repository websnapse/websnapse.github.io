import settings from '@/stores/settings';
export default function interact(graph) {
  graph.on('afteradditem', (evt) => {
    const { item } = evt;

    item.setState('dark', settings.dark);

    if (item.getType() === 'edge') return;

    if (settings.view === 'simple') {
      item.setState('simple', true);
    }
  });

  graph.on('afterupdateitem', (evt) => {
    const { item } = evt;

    item.setState('dark', settings.dark);

    if (item.getType() === 'edge') return;

    if (settings.view === 'simple') {
      item.setState('simple', true);
    }
  });

  graph.on('wheel', () => {
    const zoom = graph.getZoom();

    if (settings.view === 'full') {
      if (zoom < 0.5) {
        graph.getEdges().forEach((edge) => {
          edge.hide();
        });
      } else {
        graph.getEdges().forEach((edge) => {
          edge.show();
        });
      }
    }
  });

  graph.on('afterlayout', () => {
    graph.fitView([120, 50, 180, 50], null, true);
  });
}

function refreshEdge(graph) {
  const edges = graph.save().edges;
  graph.getEdges().forEach((edge, i) => {
    graph.updateItem(edge, {
      curveOffset: edges[i].curveOffset,
      curvePosition: edges[i].curvePosition,
    });
  });
}
