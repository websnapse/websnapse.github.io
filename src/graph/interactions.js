import { updateNeuron, updateSynapse } from '../utils/dialog';
import { navbar } from '../stores/navbar';

export default function interact(graph) {
  graph.on('canvas:click', (evt) => {});

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
    console.log(item.getModel());
    item.setState('selected', true);
  });

  // graph.on('node:mouseenter', (evt) => {
  //   const { item } = evt;
  //   item.setState('hover', true);
  // });

  // graph.on('node:mouseleave', (evt) => {
  //   const { item } = evt;
  //   item.clearStates('hover');
  // });

  // graph.on('node:dblclick', async function (evt) {
  //   const { item } = evt;
  //   const model = item.getModel();
  //   const updated = await updateNeuron(item);

  //   if (!updated.success) return;

  //   if (updated.type === 'regular') {
  //     model.id = updated.id;
  //     model.content = updated.content;
  //     model.rules = updated.rules;
  //   } else {
  //     model.id = updated.id;
  //     model.spiketrain = updated.spiketrain;
  //   }

  //   item.update(model);
  // });

  graph.on('edge:dblclick', async function (evt) {
    const { item } = evt;
    const model = item.getModel();
    const updated = await updateSynapse(item);
    model.label = updated.weight;
    item.update(model);
  });

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
