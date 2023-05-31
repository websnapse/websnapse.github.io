import settings from '@/stores/settings';

export default function interact(graph) {
  graph.on('afteradditem', (evt) => {
    const { item } = evt;
    if (item.getType() === 'node') {
      item.setState('simple', settings.view === 'simple');
      item.refresh();
    }
  });
}
