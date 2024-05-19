import { createNeuron } from "@/utils/dialog";
import { neuron } from "../../stores/neuron";

export default async function addNode(ev, graph) {
  neuron.id = Math.random().toString(36).substr(2, 5);
  await createNeuron();

  if (!neuron.success) return;

  neuron.success = false;

  neuron.count += 1;
  if (neuron.type === "regular") {
    graph.addItem("node", {
      x: ev.x,
      y: ev.y,
      id: neuron.id, // Generate a unique id
      type: neuron.type,
      content: neuron.content,
      rules: neuron.rules,
    });
  } else {
    graph.addItem("node", {
      x: ev.x,
      y: ev.y,
      id: neuron.id, // Generate a unique id
      type: neuron.type,
      content: neuron.content,
    });

    neuron.content = 1;
    neuron.rules = [];
  }
}
