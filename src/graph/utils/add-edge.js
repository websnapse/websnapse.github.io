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

  if (rulebook.from != "" && rulebook.to != "") {
    rulebook.global_edges = [...rulebook.global_edges, newEdge];
    graph.value.addItem("edge", {
      source: rulebook.from,
      target: rulebook.to,
      label: rulebook.weight,
    });
  }
}
