<template>
  <div class="flex flex-col">
    <TransitionRoot appear :show="createNeuronDialogOpen" as="template">
      <CreateNeuronDialog
        :isOpen="createNeuronDialogOpen"
        :closeModal="() => (createNeuronDialogOpen = false)"
      />
    </TransitionRoot>
    <TransitionRoot appear :show="editNeuronDialogOpen" as="template">
      <EditNeuronDialog
        :isOpen="editNeuronDialogOpen"
        :closeModal="() => (editNeuronDialogOpen = false)"
        :details="dialogDetails"
      />
    </TransitionRoot>
    <TransitionRoot appear :show="editSynapseDialogOpen" as="template">
      <EditSynapseDialog
        :isOpen="editSynapseDialogOpen"
        :closeModal="() => (editSynapseDialogOpen = false)"
        :details="dialogDetails"
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
import CreateNeuronDialog from './CreateNeuronDialog.vue';
import EditNeuronDialog from './EditNeuronDialog.vue';
import EditSynapseDialog from './EditSynapseDialog.vue';

import createGraph from '../graph/graph';
import simulateSystem from '../services/simulator';
import system from '../stores/system';
import { navbar } from '../stores/navbar';
import graph from '../stores/graph';
import {
  createNeuronDialogOpen,
  editSynapseDialogOpen,
  editNeuronDialogOpen,
  dialogDetails,
} from '../stores/dialog';

import { undo, redo } from '../graph/utils/actionStack';
import initializeRegisters from '../graph/registers';

const props = defineProps(['graph_mode', 'clear_all']);

const states = ref(
  system.data.nodes.reduce((acc, cur) => {
    acc[cur.id] = {
      value: 'default',
    };
    return acc;
  }, {})
);

const config = ref(
  system.data.nodes.reduce((acc, cur) => {
    acc[cur.id] = cur.content;
    return acc;
  }, {})
);

const status_list = ref([]);
const config_list = ref([]);
const tick = ref(0);
const max_tick = ref(0);
const duration = ref(2000);

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
      if (tick.value + 1 >= max_tick.value) {
        clearInterval(intervalId);
        navbar.value.running = false;
      } else {
        tick.value++;
      }
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

const simulate = async () => {
  const res = await simulateSystem(system.data);
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

  switch (key) {
    case 'h':
      navbar.value.mode = 'default';
      break;
    case 'v':
      navbar.value.mode = 'default';
      break;
    case 'e':
      navbar.value.mode = 'edge';
      break;
    case 'n':
      navbar.value.mode = 'node';
      break;
    case 'd':
      navbar.value.mode = 'delete';
      break;
    case 'Delete':
      graph.value.getNodes().forEach((node) => {
        if (node.hasState('selected')) {
          graph.value.removeItem(node);
        }
      });
      graph.value.getEdges().forEach((edge) => {
        if (edge.hasState('selected')) {
          graph.value.removeItem(edge);
        }
      });
      break;
    case 'Control':
      navbar.value.mode = 'default';
      break;
    default:
      break;
  }
};

const handleKeydown = (evt) => {
  const { key } = evt;

  switch (key) {
    case 'h':
      navbar.value.mode = 'pan';
      break;
    case 'z':
      if (evt.ctrlKey) {
        undo(graph.value);
      }
      break;
    case 'Z':
      if (evt.ctrlKey && evt.shiftKey) {
        redo(graph.value);
      }
      break;
    default:
  }
};

watch(states, (newValue, oldValue) => {
  for (const key in newValue) {
    if (newValue[key] !== oldValue[key]) {
      const node = graph.value.findById(key);
      const edges = graph.value.getEdges().filter((edge) => {
        return edge.getSource().getID() === key;
      });

      for (const edge of edges) {
        graph.value.setItemState(edge, 'animate', false);
        graph.value.setItemState(
          edge,
          'animate',
          newValue[key].value === 'animate'
        );
      }
      node.clearStates(['default', 'animate', 'closed']);
      graph.value.setItemState(node, newValue[key].value, true);
      graph.value.setItemState(node, 'running', true);
    }
  }
});

watch(duration, (newDuration) => {
  if (navbar.value.running) {
    if (tick.value < max_tick.value) {
      clearInterval(intervalId);
      intervalId = setInterval(() => {
        tick.value++;
      }, newDuration);
    }
  }
});

watch(config, (newValue, oldValue) => {
  for (const key in newValue) {
    if (newValue[key] !== oldValue[key]) {
      const node = graph.value.findById(key);
      node.update({
        content: newValue[key],
      });
    }
  }
});

watch(
  duration,
  (newDuration) => {
    // get graph.value items
    const nodes = graph.value?.getNodes();
    const edges = graph.value?.getEdges();

    // set the duration of each node and edge
    nodes?.forEach((node) => {
      const model = node.getModel();
      model.duration = newDuration;
      node.update(model);
    });
    edges?.forEach((edge) => {
      const model = edge.getModel();
      model.duration = newDuration;
      edge.update(model);
    });
  },
  { immediate: true }
);

watch(tick, (newTick) => {
  states.value = status_list.value[newTick];
  config.value = config_list.value[newTick];
});

watch(
  () => props.clear_all,
  () => {
    if (props.clear_all) graph.value.clear();
  }
);

onMounted(() => {
  const vh = document.getElementById('mountNode').offsetHeight;
  const vw = document.getElementById('mountNode').offsetWidth;
  initializeRegisters();
  graph.value = createGraph('mountNode', vw, vh);

  graph.value.data(system.data);
  graph.value.render();

  window.addEventListener('keyup', handleKeyup);
  window.addEventListener('keydown', handleKeydown);

  // if the width and height of mountNode changes, update width and height of graph.value
  const resizeObserver = new ResizeObserver((entries) => {
    const { width, height } = entries[0].contentRect;
    graph.value.changeSize(width, height);
    graph.value.fitView();
  });

  resizeObserver.observe(document.getElementById('mountNode'));
});
</script>
