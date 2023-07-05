import settings from '@/stores/settings';

export default function interact(graph) {
  graph.on('afteradditem', (evt) => {
    const { item } = evt;
    if (item.getType() === 'node') {
      if (settings.view === 'simple') {
        item.setState('simple', true);
      }

      const model = item.getModel();

      if (model.type === 'regular') {
        item.set('model', { ...model, delay: 0 });
      }
    }

    item.setState('dark', settings.dark);
  });

  graph.on('wheel', (evt) => {
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

  graph.on('afterrender', () => {
    graph.fitView([120, 50, 180, 50], null, true);
  });

  graph.on('afterlayout', (evt) => {
    graph.fitView([120, 50, 180, 50], null, true);
  });
}
