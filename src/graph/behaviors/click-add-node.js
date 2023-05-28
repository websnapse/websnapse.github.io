import G6 from '@antv/g6';
import { neuron } from '../../stores/neuron';
import { createNeuron } from '../../utils/dialog';
import addNode from '../utils/add-node';

export default function clickAddNode() {
  G6.registerBehavior('click-add-node', {
    getEvents() {
      return {
        'canvas:click': 'onClick',
      };
    },
    async onClick(ev) {
      const graph = this.graph;
      await addNode(ev, graph);
    },
  });
}
