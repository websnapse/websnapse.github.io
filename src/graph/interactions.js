import settings from '@/stores/settings';

export default function interact(graph) {
  graph.on('afteradditem', (evt) => {
    const { item } = evt;
    if (item.getType() === 'node') {
      item.setState('simple', settings.view === 'simple');
      item.refresh();
    }
  });

  graph.on('wheel', (evt) => {
    const zoom = graph.getZoom();

    if (zoom < 0.5) {
      graph.getEdges().forEach((edge) => {
        edge.hide();
      });
    } else {
      graph.getEdges().forEach((edge) => {
        edge.show();
      });
    }
  });
}
