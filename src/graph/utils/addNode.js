import { createNeuron } from '@/utils/dialog';
import { neuron } from '../../stores/neuron';

export default async function addNode(ev, graph) {
  await createNeuron();

  if (!neuron.value?.success) return;

  neuron.value.count += 1;
  if (neuron.value.type === 'regular') {
    graph.addItem('node', {
      x: ev.x,
      y: ev.y,
      id: neuron.value.id, // Generate a unique id
      type: neuron.value.type,
      content: neuron.value.content,
      rules: neuron.value.rules,
    });
  } else {
    graph.addItem('node', {
      x: ev.x,
      y: ev.y,
      id: neuron.value.id, // Generate a unique id
      type: neuron.value.type,
      spiketrain: neuron.value.spiketrain,
    });
  }
}
