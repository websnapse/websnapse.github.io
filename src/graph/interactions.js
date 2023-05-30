import navbar from '../stores/navbar';

export default function interact(graph) {
  graph.on('afteradditem', (evt) => {
    const { item } = evt;
    if (item.getType() === 'node') {
      item.setState('simple', navbar.view !== 'simple');
      item.refresh();
    }
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
