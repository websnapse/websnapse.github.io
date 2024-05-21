import rulebook from "../../stores/rulebook";
import { createRule } from "@/utils/dialog";
import graph from "../../stores/graph";
import system from "@/stores/system";
import { rule } from "postcss";

export default async function addRule() {
  rulebook.rules = [];
  rulebook.current_neuron_id = null;

  await createRule();
  if (rulebook.success) {
    const node = graph.value.findById(rulebook.current_neuron_id);
    if (node != null) {
      const { id, x, y, type, rules, content } = node.getModel();

      const newRules = [...rules, ...rulebook.rules];

      if (type == "regular") {
        graph.value.updateItem(
          node,
          {
            rules: newRules,
          },
          false
        );
        // graph.addItem("node", {
        //   x: x,
        //   y: y,
        //   id: id,
        //   type: type,
        //   content: content,
        //   rules: rules,
        // });
        rulebook.all_rules[node.getModel().id] = newRules;
      }
    } else {
      // graph.value.addItem("node", {
      //   x: 100,
      //   y: 100,
      //   id: rulebook.current_neuron_id,
      //   type: "regular",
      //   content: 0,
      //   rules: rulebook.rules,
      // });

      // graph.value.hideItem(rulebook.current_neuron_id);

      // const newSystem = exportSystem(graph.value);
      // console.log(newSystem);
      if (rulebook.current_neuron_id in rulebook.global_rules) {
        rulebook.global_rules[rulebook.current_neuron_id] = [
          ...rulebook.global_rules[rulebook.current_neuron_id],
          ...rulebook.rules,
        ];
      } else {
        rulebook.global_rules[rulebook.current_neuron_id] = rulebook.rules;
      }
    }

    console.log(rulebook);
  }
  rulebook.success = false;
}
