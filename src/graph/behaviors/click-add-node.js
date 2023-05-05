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
      const node_id = neuron.value.count;

      const graph = this.graph;
      const last_node = graph.getNodes()[graph.getNodes().length - 1];
      const last_node_id = last_node?.getModel()?.id;
      const orig_id = last_node_id?.split('-')[0] || 'n1';
      // get the duplicate number of the last node
      const duplicate = last_node_id
        ? '-' + Number(parseInt(last_node_id?.split('-')[1] ?? 1) + 1)
        : '';

      // replace the duplicatenumber
      // Add a new node on the canvas
      const node = graph.addItem('node', {
        x: ev.x,
        y: ev.y,
        id: `${orig_id}${duplicate}`, // Generate a unique id
        nodeType: neuron.value.nodeType,
        content: neuron.value.content,
        rules: neuron.value.rules.split('\n'),
      });
    },
  });
}
