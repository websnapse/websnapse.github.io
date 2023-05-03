import G6 from '@antv/g6';
import { neuron } from '../../stores/neuron';

export default function clickAddNode() {
  G6.registerBehavior('click-add-node', {
    // Bind the events and response functions for this custom Behavior
    getEvents() {
      return {
        'canvas:dblclick': 'onDblClick', // The event to be listned is canvas:click. The response function is onClick
      };
    },
    // The click event
    onDblClick(ev) {
      neuron.value.count += 1;
      const node_label = neuron.value.count;

      const graph = this.graph;
      // Add a new node on the canvas
      const node = graph.addItem('node', {
        x: ev.x,
        y: ev.y,
        id: G6.Util.uniqueId(), // Generate a unique id
        label: neuron.value.label,
        nodeType: neuron.value.nodeType,
        content: neuron.value.content,
        rules: neuron.value.rules.split('\n'),
      });
    },
  });
}
