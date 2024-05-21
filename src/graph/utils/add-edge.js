import rulebook from "../../stores/rulebook";
import { createEdge, createRule } from "@/utils/dialog";
import graph from "../../stores/graph";
import { rule } from "postcss";

export default async function addEdge() {
  rulebook.from = "";
  rulebook.to = "";
  rulebook.weight = 1;

  await createEdge();

  const newEdge = new Object();
  newEdge["from"] = rulebook.from;
  newEdge["to"] = rulebook.to;
  newEdge["weight"] = rulebook.weight;

  const src_node = graph.value.findById(rulebook.from);
  const dst_node = graph.value.findById(rulebook.to);
  if (rulebook.from != "" && rulebook.to != "") {
    if (src_node != undefined && dst_node != undefined) {
      graph.value.addItem("edge", {
        source: rulebook.from,
        target: rulebook.to,
        label: rulebook.weight,
      });
    } else {
      rulebook.global_edges = [...rulebook.global_edges, newEdge];
    }
  }
}
