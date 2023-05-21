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
        @click="startSimulate"
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
        <button class="p-1 text-base rounded-full bg-primary">
          <v-icon
            name="bi-play-fill"
            @click="startSimulate"
            v-if="!navbar.running"
            scale="2"
            class="translate-x-[0.1rem]"
          />
          <v-icon
            name="bi-stop-fill"
            v-if="navbar.running"
            scale="2"
            @click="stopSimulate"
          />
        </button>
        <v-icon
          name="la-step-forward-solid"
          @click="simulateNext"
          scale="1.5"
          class="cursor-pointer"
        />
        <v-icon
          name="la-sync-solid"
          class="ml-2 cursor-pointer"
          @click="resetSimulation"
        />
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
import { onMounted, ref, watch } from 'vue';
import { TransitionRoot } from '@headlessui/vue';
import CreateNeuronDialog from '@/components/CreateNeuronDialog.vue';
import EditNeuronDialog from '@/components/EditNeuronDialog.vue';
import EditSynapseDialog from '@/components/EditSynapseDialog.vue';

import createGraph from '@/graph/graph';
import simulateSystem from '@/services/simulator';
import system from '@/stores/system';
import { navbar } from '@/stores/navbar';
import graph from '@/stores/graph';
import {
  createNeuronDialogOpen,
  editSynapseDialogOpen,
  editNeuronDialogOpen,
  dialogDetails,
} from '@/stores/dialog';

import { handleKeyup, handleKeydown } from '@/graph/events/keyboard';
import initializeRegisters from '@/graph/registers';

const props = defineProps(['graph_mode', 'clear_all']);

const original = ref();
const status = ref();
const config = ref();

const status_list = ref([]);
const config_list = ref([]);
const tick = ref(0);
const max_tick = ref(0);
const duration = ref(1000);

const changeTick = (i) => {
  tick.value += i;
  clearInterval(intervalId);
  navbar.running = false;
};

let intervalId = null;
const toggleInterval = () => {
  navbar.running = !navbar.running;
  if (navbar.running) {
    intervalId = setInterval(() => {
      if (tick.value + 1 >= max_tick.value) {
        clearInterval(intervalId);
        navbar.running = false;
      } else {
        tick.value++;
      }
    }, duration.value);
  } else {
    clearInterval(intervalId);
  }
};

/** @type {WebSocket} */
let ws = null;

const resetSimulation = () => {
  navbar.running = false;
  // reset states of all items
  graph.value.read(original.value);
};

// const simulate = async () => {
//   const res = await simulateSystem(system.data);
//   const neuron_keys = res.keys;
//   const configurations = res.configurations.map((config) => {
//     return neuron_keys.reduce((acc, cur, i) => {
//       acc[cur] = config[i];
//       return acc;
//     }, {});
//   });

//   const states = res.states.map((state) => {
//     return neuron_keys.reduce((acc, cur, i) => {
//       acc[cur] = {
//         value:
//           state[i] === 1 ? 'animate' : state[i] === 0 ? 'default' : 'closed',
//       };
//       return acc;
//     }, {});
//   });

//   status_list.value = states;
//   config_list.value = configurations;
//   max_tick.value = configurations.length;
// };

const stopSimulate = () => {
  ws.close();
  graph.value.getNodes().forEach((node) => {
    node.clearStates(['default', 'animate', 'closed']);
    node.setState('default', true);
  });
  graph.value.getEdges().forEach((edge) => {
    edge.clearStates(['default', 'animate', 'closed']);
    edge.setState('default', true);
  });
  navbar.running = false;
};

const startSimulate = async () => {
  ws = new WebSocket('ws://localhost:8000/simulate/ws');
  original.value = system.data;
  ws.onopen = function () {
    ws.send(JSON.stringify(system.data));
  };
  ws.onmessage = function (event) {
    const data = JSON.parse(event.data);

    status.value = data.states;
    config.value = data.configurations;

    if (data.halted === true) {
      navbar.running = false;
    }
  };
  navbar.running = true;
};

const simulateNext = async () => {
  const res = await simulateSystem(system.data);

  const configurations = res.keys.reduce((acc, key, index) => {
    acc[key] = res.configurations[index];
    return acc;
  }, {});

  const states = res.keys.reduce((acc, key, index) => {
    acc[key] = {
      value:
        res.states[index] === 1
          ? 'animate'
          : res.states[index] === 0
          ? 'default'
          : 'closed',
    };
    return acc;
  }, {});

  status.value = states;
  config.value = configurations;
};

watch(duration, (newDuration) => {
  if (navbar.running) {
    if (tick.value < max_tick.value) {
      clearInterval(intervalId);
      intervalId = setInterval(() => {
        tick.value++;
      }, newDuration);
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
  status.value = status_list.value[newTick];
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

  const g = createGraph('mountNode', vw, vh);

  g.data(system.data);
  g.render();

  graph.value = g;

  watch(status, (newValue, oldValue) => {
    for (const key in newValue) {
      const node = g.findById(key);
      const edges = g.getEdges().filter((edge) => {
        return edge.getSource().getID() === key;
      });

      for (const edge of edges) {
        g.setItemState(edge, 'animate', false);
        g.setItemState(edge, 'animate', newValue[key] === 'animate');
      }
      node.clearStates(['default', 'animate', 'closed']);
      node.setState(newValue[key], true);
      node.setState('running', true);
    }
  });

  watch(config, (newValue, oldValue) => {
    for (const key in newValue) {
      const node = g.findById(key);
      const model = node.getModel();

      if (model.type === 'regular') {
        node.update({
          content: newValue[key],
        });
      } else {
        node.update({
          spiketrain: newValue[key],
        });
      }
    }
  });

  window.addEventListener('keyup', handleKeyup);
  window.addEventListener('keydown', handleKeydown);

  const resizeObserver = new ResizeObserver((entries) => {
    const { width, height } = entries[0].contentRect;
    g.changeSize(width, height);
    g.fitView();
  });

  resizeObserver.observe(document.getElementById('mountNode'));
});
</script>
