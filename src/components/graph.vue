<template>
  <div class="flex flex-col">
    <TransitionRoot appear :show="ruleDialogOpen" as="template">
      <RuleDialog
        :isOpen="ruleDialogOpen"
        :closeModal="closeRuleDialog"
        :details="neuronDetails"
      />
    </TransitionRoot>
    <TransitionRoot appear :show="weightDialogOpen" as="template">
      <WeightDialog
        :isOpen="weightDialogOpen"
        :closeModal="closeWeightDialog"
        :details="edgeDetails"
      />
    </TransitionRoot>
    <div>
      <button
        class="absolute p-2 text-base rounded-lg top-2 right-2 bg-primary"
        @click="simulate"
      >
        <v-icon name="bi-play-fill" scale="1.5" />
      </button>
    </div>
    <div
      id="mountNode"
      class="flex items-start justify-center w-screen h-screen overflow-hidden"
    />
    <div
      id="simulationControls"
      class="absolute left-0 right-0 flex flex-col items-center justify-center px-8 py-4 mx-auto rounded-3xl w-fit bottom-2 bg-base/40 backdrop-blur-sm"
    >
      <div class="flex items-center gap-1 text-dark/50">
        <v-icon name="la-random-solid" class="mr-2" />
        <v-icon
          name="la-step-backward-solid"
          @click="changeTick(-1)"
          scale="1.5"
          class="cursor-pointer"
        />
        <button
          class="p-1 text-base rounded-full bg-primary"
          @click="toggleInterval"
        >
          <v-icon
            name="bi-play-fill"
            v-if="!navbar.running"
            scale="2"
            class="translate-x-[0.1rem]"
          />
          <v-icon name="bi-pause-fill" v-if="navbar.running" scale="2" />
        </button>
        <v-icon
          name="la-step-forward-solid"
          @click="changeTick(1)"
          scale="1.5"
          class="cursor-pointer"
        />
        <v-icon name="la-sync-solid" class="ml-2" @click="resetSimulation" />
      </div>
      <div class="flex flex-col items-center justify-center gap-1">
        <input
          id="default-range"
          type="range"
          min="500"
          max="3500"
          step="500"
          :value="duration"
          @mouseup="(e) => (duration = e.target.value)"
          class="mt-4 slider"
        />
        <div>
          <span class="text-xs text-dark/40">{{ duration / 2000 }}x</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue';
import { TransitionRoot } from '@headlessui/vue';
import RuleDialog from './ruledialog.vue';
import WeightDialog from './weightdialog.vue';

import createGraph from '../graph/graph';
import initializeRegisters from '../graph/registers';
import simulateSystem from '../services/simulator';
import { neuron } from '../stores/neuron';
import { system } from '../stores/system';
import { navbar } from '../stores/navbar';

import { undo, redo } from '../graph/utils/actionStack';

const props = defineProps(['graph_mode', 'clear_all']);

const simulate = ref(null);

const neuronDetails = ref({
  id: '',
  content: '',
  rules: '',
});

const edgeDetails = ref({
  weight: '',
});

const weightDialogOpen = ref(false);

const ruleDialogOpen = ref(false);

const closeRuleDialog = () => {
  ruleDialogOpen.value = false;
};

const closeWeightDialog = () => {
  weightDialogOpen.value = false;
};

const data = system;

// programmatically create a status ref containing an object with the node labels from the data and their status
const status = ref(
  data.value.nodes.reduce((acc, cur) => {
    acc[cur.id] = {
      value: 'default',
    };
    return acc;
  }, {})
);

const config = ref(
  data.value.nodes.reduce((acc, cur) => {
    acc[cur.id] = cur.content;
    return acc;
  }, {})
);

// programmatically create an array of 5 elements
const statusArray = Array.from(Array(5).keys()).map((_) => {
  return data.value.nodes.reduce((acc, cur) => {
    acc[cur.id] = {
      value: Math.random() > 0.5 ? 'default' : 'animate',
    };
    return acc;
  }, {});
});

const status_list = ref([status.value, ...statusArray]);
console.log(status_list.value);

const configArray = Array.from(Array(5).keys()).map((_) => {
  return data.value.nodes.reduce((acc, cur) => {
    acc[cur.id] = parseInt(Math.random() * 5);
    return acc;
  }, {});
});

const max_tick = ref(5);

const config_list = ref([config.value, ...configArray]);

const neurons = computed(() => {
  return Object.keys(status.value);
});

// switchs tatus value to get from the status_list ref at index i
const switchStatus = (i) => {
  status.value[neurons.value[i]].value =
    status.value[neurons.value[i]].value === 'default' ? 'animate' : 'default';
};

const duration = ref(2000);

const switchState = (i) => {
  status.value = status_list.value[i];
};

const mouse = ref({ x: 0, y: 0 });

const updateNeuron = (item) => {
  const { id, content, rules } = item.getModel();
  return new Promise((resolve, reject) => {
    neuronDetails.value = { id, content, rules };
    ruleDialogOpen.value = true;

    watch(ruleDialogOpen, (newVal, oldVal) => {
      resolve(neuronDetails.value);
    });
  });
};

const updateEdge = (item) => {
  const { label } = item.getModel();
  return new Promise((resolve, reject) => {
    edgeDetails.value = { weight: label };
    weightDialogOpen.value = true;

    watch(weightDialogOpen, (newVal, oldVal) => {
      resolve(edgeDetails.value);
    });
  });
};

const initializeGraph = (system, vh, vw) => {
  initializeRegisters(neuron);

  const graph = createGraph('mountNode', vw, vh);

  graph.on('node:dblclick', async function (evt) {
    const { item } = evt;
    const model = item.getModel();
    const updated = await updateNeuron(item);
    model.id = updated.id;
    model.content = updated.content;
    model.rules = updated.rules;
    item.update(model);
  });

  graph.on('edge:dblclick', async function (evt) {
    const { item } = evt;
    const model = item.getModel();
    const updated = await updateEdge(item);
    model.label = updated.weight;
    item.update(model);
  });

  // after node is added to the graph, set its state to whatever the value of navbar view is
  graph.on('afteradditem', (evt) => {
    const { item } = evt;
    // check if item is a node
    if (item.getType() === 'node') {
      item.setState('simple', navbar.value.view !== 'simple');
      item.refresh();
    }
  });

  return graph;
};

const tick = ref(0);

const changeTick = (i) => {
  tick.value += i;
  clearInterval(intervalId);
  navbar.value.running = false;
};

let intervalId = null;

const toggleInterval = () => {
  navbar.value.running = !navbar.value.running;
  if (navbar.value.running) {
    intervalId = setInterval(() => {
      if (tick.value === max_tick.value) {
        clearInterval(intervalId);
        navbar.value.running = false;
      }
      tick.value++;
    }, duration.value);
  } else {
    clearInterval(intervalId);
  }
};

const resetSimulation = () => {
  navbar.value.running = false;
  clearInterval(intervalId);
  tick.value = 0;
};

onMounted(() => {
  const vh = document.getElementById('mountNode').offsetHeight;
  const vw = document.getElementById('mountNode').offsetWidth;
  const graph = initializeGraph(data, vh, vw);

  graph.data(data.value);
  graph.render();

  const body = computed(() => {
    const { nodes, edges } = graph.save();
    const adj_mtx = graph.getAdjMatrix(false, true);

    const parsed_adj_mtx = adj_mtx.map((row) =>
      Array(row.length)
        .fill(0)
        .map((val, i) => (row[i] === 1 ? 1 : 0))
    );

    console.log(parsed_adj_mtx);
    const parsed_nodes = nodes.map((node) => {
      return {
        id: node.id,
        content: node.content,
        rules: node.rules,
        nodeType: node.nodeType,
      };
    });
    const parsed_edges = edges.map((edge) => {
      return {
        source: edge.source,
        target: edge.target,
        label: edge.label,
      };
    });

    const parsed_system = {
      nodes: parsed_nodes,
      edges: parsed_edges,
      adj_mtx: parsed_adj_mtx,
    };

    return parsed_system;
  });

  simulate.value = async () => {
    const res = await simulateSystem(body.value);
    const neuron_keys = res.keys;
    const configurations = res.configurations.map((config) => {
      return neuron_keys.reduce((acc, cur, i) => {
        acc[cur] = config[i];
        return acc;
      }, {});
    });

    const states = res.states.map((state) => {
      return neuron_keys.reduce((acc, cur, i) => {
        acc[cur] = {
          value:
            state[i] === 1 ? 'animate' : state[i] === 0 ? 'default' : 'closed',
        };
        return acc;
      }, {});
    });

    status_list.value = states;
    config_list.value = configurations;
    max_tick.value = configurations.length;
  };

  const handleKeyup = (evt) => {
    const { key } = evt;

    if (key === 'Delete') {
      graph.getNodes().forEach((node) => {
        if (node.hasState('selected')) {
          graph.removeItem(node);
        }
      });
      graph.getEdges().forEach((edge) => {
        if (edge.hasState('selected')) {
          graph.removeItem(edge);
        }
      });
    }

    if (key === 'v') {
      navbar.value.mode = 'default';
    }
    if (key === 'h') {
      navbar.value.mode = 'default';
      graph.get('canvas').setCursor('default');
    }
    if (key === 'e') {
      navbar.value.mode = 'edit';
    }
    if (key === 'd') {
      navbar.value.mode = 'delete';
    }
    if (key === 'Control') {
      navbar.value.mode = 'default';
    }
  };

  const handleKeydown = (evt) => {
    const { key } = evt;
    if (key === 'h') {
      navbar.value.mode = 'pan';
      graph.get('canvas').setCursor('grab');
    }

    if (key === 'Control') {
      navbar.value.mode = 'addEdge';
    }

    if (evt.ctrlKey && evt.key === 'z') {
      undo(graph);
    }

    if (evt.ctrlKey && evt.shiftKey && evt.key === 'Z') {
      redo(graph);
    }
  };

  const handleMousedown = (evt) => {
    // check if middle mouse button is pressed
    if (evt.button === 1) {
      navbar.value.mode = 'pan';
      mouse.value.x = evt.clientX;
      mouse.value.y = evt.clientY;
    }
  };

  const handleMouseup = (evt) => {
    if (evt.button === 1) {
      navbar.value.mode = 'default';
    }
  };

  window.addEventListener('keyup', handleKeyup);
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('mousedown', handleMousedown);
  window.addEventListener('mouseup', handleMouseup);
  // window.addEventListener('mousemove', (evt) => {
  //   if (navbar.value.mode === 'pan') {
  //     const dx = evt.clientX - mouse.value.x;
  //     const dy = evt.clientY - mouse.value.y;
  //     const point = graph.getPointByClient(dx, dy);
  //     graph.translate(point.x, point.y);
  //     graph.get('canvas').setCursor('grab');
  //   } else graph.get('canvas').setCursor('default');
  // });

  watch(
    () => navbar.value.mode,
    (val) => {
      graph.setMode(val);
    }
  );

  watch(status, (newValue, oldValue) => {
    for (const key in newValue) {
      if (newValue[key] !== oldValue[key]) {
        const node = graph.findById(key);
        const edges = graph.getEdges().filter((edge) => {
          return edge.getSource().getID() === key;
        });

        for (const edge of edges) {
          graph.setItemState(edge, 'animate', false);
          graph.setItemState(
            edge,
            'animate',
            newValue[key].value === 'animate'
          );
        }
        graph.clearItemStates(node);
        graph.setItemState(node, newValue[key].value, true);
        graph.setItemState(node, 'running', true);
      }
    }
  });

  watch(duration, (newDuration) => {
    if (navbar.value.running) {
      clearInterval(intervalId);
      intervalId = setInterval(() => {
        tick.value++;
      }, newDuration);
    }
  });

  watch(config, (newValue, oldValue) => {
    for (const key in newValue) {
      if (newValue[key] !== oldValue[key]) {
        const node = graph.findById(key);
        node.update({
          content: newValue[key],
        });
      }
    }
  });

  watch(system, (newSystem) => {
    graph.changeData(newSystem);
  });

  watch(
    () => props.clear_all,
    () => {
      if (props.clear_all) graph.clear();
    }
  );

  watch(
    () => navbar.value.view,
    (newView) => {
      graph.getNodes().forEach((node) => {
        newView !== 'simple'
          ? graph.setItemState(node, 'simple', true)
          : graph.clearItemStates(node);
      });
      graph.refresh();
    }
  );

  watch(
    duration,
    (newDuration) => {
      // get graph items
      const nodes = graph.getNodes();
      const edges = graph.getEdges();

      // set the duration of each node and edge
      nodes.forEach((node) => {
        const model = node.getModel();
        model.duration = newDuration;
        node.update(model);
      });
      edges.forEach((edge) => {
        const model = edge.getModel();
        model.duration = newDuration;
        edge.update(model);
      });
    },
    { immediate: true }
  );

  watch(tick, (newTick) => {
    status.value = status_list.value[newTick];
    config.value = config_list.value[newTick];
  });

  // if the width and height of mountNode changes, update width and height of graph
  const resizeObserver = new ResizeObserver((entries) => {
    const { width, height } = entries[0].contentRect;
    graph.changeSize(width, height);
    graph.fitView();
  });

  resizeObserver.observe(document.getElementById('mountNode'));
});
</script>
