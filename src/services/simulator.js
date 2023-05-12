import { parse_rule } from '../utils/parser';

class MatrixSNPSystem {
  constructor(nodes, edges, adj_mtx) {
    this.neurons = nodes;
    this.synapses = edges;
    this.adj_mtx = adj_mtx;

    this.set_neuron_order();
    this.set_rule_order();
    console.log(this.rules);
  }

  set_neuron_order() {
    this.neuron_keys = this.neurons.map((node) => node.id);
    this.neuron_count = this.neuron_keys.length;
  }

  set_rule_order() {
    this.rule_count = 0;
    this.rules = {};
    this.neuron_rule_map = {};
    this.neurons.map((n, neuron_idx) => {
      console.log(n);
      if (n.rules) {
        this.neuron_rule_map[neuron_idx] = [];
        n.rules.map((rule) => {
          const { bound, consumption, production, delay } = parse_rule(rule);
          this.rules[`r${this.rule_count}`] = {
            bound,
            consumption,
            production,
            delay,
          };
          this.neuron_rule_map[neuron_idx].push(this.rule_count);
          this.rule_count += 1;
        });
      }
    });
  }
}

export default async function simulateSystem(system) {
  const { nodes, edges, adj_mtx } = system;
  const res = await fetch('http://localhost:8000/simulate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nodes,
      edges,
    }),
  });
  const data = await res.json();
  return data;
}
