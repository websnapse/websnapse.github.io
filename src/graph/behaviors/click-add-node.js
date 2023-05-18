import G6 from '@antv/g6';
import { neuron } from '../../stores/neuron';
import { createNeuron } from '../../utils/dialog';

export default function clickAddNode() {
  G6.registerBehavior('click-add-node', {
    getEvents() {
      return {
        click: 'onClick',
      };
    },
    async onClick(ev) {
      console.log(ev);
      await createNeuron();
      neuron.value.count += 1;

      const graph = this.graph;
      if (neuron.value.type === 'regular') {
        const node = graph.addItem('node', {
          x: ev.x,
          y: ev.y,
          id: neuron.value.id, // Generate a unique id
          type: neuron.value.type,
          content: neuron.value.content,
          rules: neuron.value.rules,
        });
      } else {
        const node = graph.addItem('node', {
          x: ev.x,
          y: ev.y,
          id: neuron.value.id, // Generate a unique id
          type: neuron.value.type,
          spiketrain: neuron.value.content,
        });
      }
    },
  });
}
