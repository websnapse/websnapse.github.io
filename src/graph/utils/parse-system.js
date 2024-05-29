import rulebook from "@/stores/rulebook";
import system from "@/stores/system";
import { rule } from "postcss";

export const importSystem = (system) => {
  console.log("import");
  rulebook.all_rules = {};
  rulebook.global_rules = {};
  rulebook.global_edges = [];

  const { neurons, synapses, rule_dict } = system;
  var allnodes = new Set();

  if (rule_dict == undefined) {
    var graph_nodes = neurons.map((node) => {
      var { id, content, type, rules, position } = node;

      rulebook.all_rules[id] = rules;
      allnodes.add(id);
      return {
        id,
        content,
        rules,
        type,
        x: position.x,
        y: position.y,
      };
    });
    var graph_edges = [];
    synapses.forEach((synapse) => {
      if (allnodes.has(synapse.from) && allnodes.has(synapse.to)) {
        graph_edges = [
          ...graph_edges,
          {
            source: synapse.from,
            target: synapse.to,
            label: synapse.weight,
          },
        ];
      } else {
        rulebook.global_edges = [
          ...rulebook.global_edges,
          {
            from: synapse.from,
            to: synapse.to,
            weight: synapse.weight,
          },
        ];
      }
    });

    const graph_system = {
      nodes: graph_nodes,
      edges: graph_edges,
    };

    console.log(graph_system);

    return graph_system;
  }
  var graph_nodes = neurons.map((node) => {
    var { id, content, rules, type, position } = node;
    allnodes.add(id);
    return {
      id,
      content,
      rules: [],
      type,
      x: position.x,
      y: position.y,
    };
  });

  console.log(graph_nodes);

  var graph_edges = [];
  synapses.forEach((synapse) => {
    if (allnodes.has(synapse.from) && allnodes.has(synapse.to)) {
      graph_edges = [
        ...graph_edges,
        {
          source: synapse.from,
          target: synapse.to,
          label: synapse.weight,
        },
      ];
    } else {
      rulebook.global_edges = [
        ...rulebook.global_edges,
        {
          from: synapse.from,
          to: synapse.to,
          weight: synapse.weight,
        },
      ];
    }
  });

  rule_dict.forEach((rule) => {
    const to_idx = rule.indexOf("\\to");
    const right_idx = rule.indexOf("\\right]");

    if (to_idx < right_idx) {
      // regular
      const curRule = rule.substring(6, right_idx).trim();
      const curNeuron = rule.substring(right_idx + 9, rule.length - 1).trim();

      const index = graph_nodes.findIndex((obj) => obj.id === curNeuron);

      if (index != -1) {
        graph_nodes[index] = {
          ...graph_nodes[index],
          rules: [...graph_nodes[index].rules, curRule],
        };

        if (curNeuron in rulebook.all_rules) {
          rulebook.all_rules[curNeuron] = [
            ...rulebook.all_rules[curNeuron],
            curRule,
          ];
        } else {
          rulebook.all_rules[curNeuron] = [curRule];
        }
      } else {
        if (curNeuron in rulebook.global_rules) {
          rulebook.global_rules[curNeuron] = [
            ...rulebook.global_rules[curNeuron],
            curRule,
          ];
        } else {
          rulebook.global_rules[curNeuron] = [curRule];
        }
      }
    } else {
      const regex = /\{([^\}]*)\}/g;

      const matches = [];
      let match;
      while ((match = regex.exec(rule)) !== null) {
        matches.push(match[1]);
      }
      const index = graph_nodes.findIndex((obj) => obj.id === matches[0]);

      const openingIndex = rule.indexOf("_{");
      const closingIndex = rule.indexOf("}", openingIndex + 1);
      const before = rule.slice(0, openingIndex);
      const after = rule.slice(closingIndex + 1);
      const modRule = before + after;

      if (index != -1) {
        graph_nodes[index] = {
          ...graph_nodes[index],
          rules: [...graph_nodes[index].rules, modRule],
        };
        if (matches[0] in rulebook.all_rules) {
          rulebook.all_rules[matches[0]] = [
            ...rulebook.all_rules[matches[0]],
            modRule,
          ];
        } else {
          rulebook.all_rules[matches[0]] = [modRule];
        }
      } else {
        if (matches[0] in rulebook.global_rules) {
          rulebook.global_rules[matches[0]] = [
            ...rulebook.global_rules[matches[0]],
            modRule,
          ];
        } else {
          rulebook.global_rules[matches[0]] = [modRule];
        }
      }
    }
  });

  const graph_system = {
    nodes: graph_nodes,
    edges: graph_edges,
  };

  return graph_system;
};

export const exportSystem = (graph) => {
  console.log("export");

  const nodes = graph.save().nodes;
  const edges = graph.save().edges;

  const parsed_nodes = nodes?.map((node) => {
    var { id, content, type, rules, x, y } = node;
    if (type === "input" || type === "output") {
      return {
        id,
        type,
        content,
        position: {
          x,
          y,
        },
      };
    }

    return {
      id,
      content,
      rules,
      type,
      position: {
        x,
        y,
      },
    };
  });

  const parsed_edges = edges?.map((edge) => {
    return {
      from: edge.source,
      to: edge.target,
      weight: edge.label,
    };
  });

  var graph_rules = [];
  Object.entries(rulebook.all_rules).forEach(([node, rules]) => {
    if (rules != undefined) {
      rules.forEach((rule) => {
        if (rule.includes("\\left[")) {
          const idx = rule.indexOf("\\right]");
          const newRule =
            rule.slice(0, idx + 7) + "_{" + node + "}" + rule.slice(idx + 7);
          graph_rules = [...graph_rules, newRule];
        } else {
          const newRule = `\\left[${rule.trim()} \\right]_{${node}}`;
          graph_rules = [...graph_rules, newRule];
        }
      });
    }
  });
  Object.entries(rulebook.global_rules).forEach(([node, rules]) => {
    if (rules != undefined) {
      rules.forEach((rule) => {
        if (rule.includes("\\left[")) {
          const idx = rule.indexOf("\\right]");
          const newRule =
            rule.slice(0, idx + 7) + "_{" + node + "}" + rule.slice(idx + 7);
          graph_rules = [...graph_rules, newRule];
        } else {
          const newRule = `\\left[${rule.trim()} \\right]_{${node}}`;
          graph_rules = [...graph_rules, newRule];
        }
      });
    }
  });

  const graph_edges = rulebook.global_edges.map((edge) => {
    return {
      from: edge.from,
      to: edge.to,
      weight: edge.weight,
    };
  });

  const parsed_system = {
    neurons: parsed_nodes,
    synapses: [...parsed_edges, ...graph_edges],
    rule_dict: graph_rules,
  };

  return parsed_system;
};

export const saveSystem = (graph) => {
  const a = document.createElement("a");
  const file = new Blob([JSON.stringify(exportSystem(graph))], {
    type: "text/plain",
  });
  a.href = URL.createObjectURL(file);
  a.download = "system.json";
  a.click();
};
