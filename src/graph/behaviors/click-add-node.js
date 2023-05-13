import G6 from '@antv/g6';
import { neuron } from '../../stores/neuron';
import { createNeuron } from '../../utils/dialog';

export default function clickAddNode() {
  G6.registerBehavior('click-add-node', {
    // Bind the events and response functions for this custom Behavior
    getEvents() {
      return {
        'canvas:click': 'onClick', // The event to be listned is canvas:click. The response function is onClick
      };
    },
    // The click event
    async onClick(ev) {
      await createNeuron();
      neuron.value.count += 1;

      const graph = this.graph;
      if (neuron.value.nodeType === 'regular') {
        const node = graph.addItem('node', {
          x: ev.x,
          y: ev.y,
          id: neuron.value.id, // Generate a unique id
          nodeType: neuron.value.nodeType,
          content: neuron.value.content,
          rules: neuron.value.rules.split('\n'),
        });
      } else {
        const node = graph.addItem('node', {
          x: ev.x,
          y: ev.y,
          id: neuron.value.id, // Generate a unique id
          nodeType: neuron.value.nodeType,
          content: neuron.value.content,
        });
      }
    },
  });
}
