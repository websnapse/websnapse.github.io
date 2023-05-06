<template>
  <div class="flex flex-col flex-1">
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
    <div
      id="mountNode"
      class="flex flex-1 justify-center items-start"
      @keydown="(e) => console.log(e)"
    ></div>
    <div
      id="simulationControls"
      class="flex flex-col left-0 px-4 right-0 mx-auto items-center w-fit justify-center py-4 absolute bottom-0 bg-white/40 backdrop-blur-sm"
    >
      <div class="flex gap-1 items-center">
        <v-icon name="bi-shuffle" class="mr-2" />
        <v-icon
          name="bi-skip-start"
          @click="changeTick(-1)"
          scale="1.5"
          class="cursor-pointer"
        />
        <button
          class="rounded-full p-1 bg-primary text-white"
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
          name="bi-skip-end"
          @click="changeTick(1)"
          scale="1.5"
          class="cursor-pointer"
        />
        <v-icon name="bi-arrow-repeat" class="ml-2" @click="resetSimulation" />
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
          class="slider mt-4"
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
import { neuron } from '../stores/neuron';
import { system } from '../stores/system';
import { navbar } from '../stores/navbar';

import { undo, redo } from '../graph/utils/actionStack';

const props = defineProps(['graph_mode', 'clear_all']);

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

const configArray = Array.from(Array(5).keys()).map((_) => {
  return data.value.nodes.reduce((acc, cur) => {
    acc[cur.id] = parseInt(Math.random() * 5);
    return acc;
  }, {});
});

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
  // reset the interval
  clearInterval(intervalId);
  navbar.value.running = false;
};

let intervalId = null;

const toggleInterval = () => {
  navbar.value.running = !navbar.value.running;
  if (navbar.value.running) {
    intervalId = setInterval(() => {
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

onMounted(async () => {
  const vh = document.getElementById('mountNode').offsetHeight;
  const vw = document.getElementById('mountNode').offsetWidth;
  const graph = initializeGraph(data, vh, vw);

  graph.data(data.value);
  graph.render();

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
  window.addEventListener('mousemove', (evt) => {
    if (navbar.value.mode === 'pan') {
      const dx = evt.clientX - mouse.value.x;
      const dy = evt.clientY - mouse.value.y;
      const point = graph.getPointByClient(dx, dy);
      graph.translate(point.x, point.y);
      graph.get('canvas').setCursor('grab');
    } else graph.get('canvas').setCursor('default');
  });

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
        graph.setItemState(node, 'animate', newValue[key].value === 'animate');
        graph.setItemState(node, 'running', true);
      }
    }
  });

  watch(config, (newValue, oldValue) => {
    for (const key in newValue) {
      if (newValue[key] !== oldValue[key]) {
        console.log(key);
        const node = graph.findById(key);
        console.log(node);
        node.update({
          content: newValue[key],
        });
      }
    }
  });

  watch(system, (newSystem) => {
    graph.changeData(newSystem);
    console.log(newSystem);
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
          ? node.setState('simple', true)
          : node.clearStates('simple');
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
    status.value = status_list.value[newTick % 5];
    config.value = config_list.value[newTick % 5];
  });

  // watch(
  //   () => navbar.value.running,
  //   (isRunning) => {
  //     let i = 0;
  //     let run = setInterval(request, duration.value);
  //     function request() {
  //       console.log(duration);
  //       clearInterval(run);
  //       status.value = status_list.value[i % 5];
  //       i++;

  //       run = setInterval(request, duration.value);
  //     }
  //     if (isRunning) {
  //     } else {
  //       // stop the interval
  //       clearInterval(run);
  //     }
  //   }
  // );

  // if the width and height of mountNode changes, update width and height of graph
  const resizeObserver = new ResizeObserver((entries) => {
    const { width, height } = entries[0].contentRect;
    console.log(width, height);
    graph.changeSize(width, height);
  });

  resizeObserver.observe(document.getElementById('mountNode'));
});
</script>
