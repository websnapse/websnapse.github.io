import { createNeuron } from '@/utils/dialog';
import { neuron } from '../../stores/neuron';

export default async function addNode(ev, graph) {
  await createNeuron();

  if (!neuron.success) return;

  neuron.success = false;

  neuron.count += 1;
  if (neuron.type === 'regular') {
    graph.addItem('node', {
      x: ev.x,
      y: ev.y,
      id: neuron.id, // Generate a unique id
      type: neuron.type,
      content: neuron.content,
      rules: neuron.rules,
    });
  } else {
    graph.addItem('node', {
      x: ev.x,
      y: ev.y,
      id: neuron.id, // Generate a unique id
      type: neuron.type,
      content: neuron.content,
    });
  }
}
