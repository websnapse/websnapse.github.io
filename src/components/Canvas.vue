<template>
  <Toolbar @load="loadData" @clear="clearAll" />
  <div class="flex flex-col">
    <TransitionRoot appear :show="createNeuronDialogOpen" as="template">
      <CreateNeuronDialog
        :isOpen="createNeuronDialogOpen"
        :closeModal="() => (createNeuronDialogOpen = false)"
      />
    </TransitionRoot>
    <TransitionRoot appear :show="chooseRuleDialogOpen" as="template">
      <ChooseRuleDialog
        :isOpen="chooseRuleDialogOpen"
        :closeModal="() => (chooseRuleDialogOpen = false)"
        :details="dialogDetails"
        :socket="ws"
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
    <div
      id="mountNode"
      class="flex items-start justify-center w-screen h-screen overflow-hidden"
    >
      <div class="back"></div>
    </div>
    <div
      id="simulationControls"
      class="absolute left-0 right-0 flex flex-col items-center justify-center px-8 py-4 mx-auto rounded-3xl w-fit bottom-2 bg-light/40 dark:bg-neutral backdrop-blur-sm"
    >
      <div class="flex items-center gap-2 text-dark/50 dark:text-dark-50">
        <button
          class="toggle"
          @click="toggleMode"
          :class="
            system.mode === 'pseudorandom'
              ? `after:content-['']`
              : `after:content-none`
          "
        >
          <v-icon
            name="la-random-solid"
            :class="system.mode === 'pseudorandom' ? 'active-toggle' : ''"
          />
        </button>
        <v-icon
          name="la-step-backward-solid"
          @click="changeTick(-1)"
          scale="1.25"
          class="cursor-pointer"
        />
        <button
          class="p-1 rounded-full text-light bg-primary dark:bg-primary/20 dark:text-primary"
        >
          <v-icon
            name="bi-play-fill"
            @click="startSimulate"
            v-if="!navbar.running"
            scale="2"
            class="translate-x-[0.1rem]"
          />
          <v-icon name="bi-stop-fill" v-else scale="2" @click="stopSimulate" />
        </button>
        <v-icon
          name="la-step-forward-solid"
          @click="simulateNext"
          scale="1.25"
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
          :value="system.duration"
          @mouseup="(e) => (system.duration = e.target.value)"
          class="mt-4 slider"
        />
        <div>
          <span class="text-xs text-dark/40 dark:text-light/40"
            >{{ system.duration / 2000 }}x</span
          >
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
import ChooseRuleDialog from '@/components/ChooseRuleDialog.vue';

import createGraph from '@/graph/graph';
import system from '@/stores/system';
import navbar from '@/stores/navbar';
import graph from '@/stores/graph';
import {
  createNeuronDialogOpen,
  editSynapseDialogOpen,
  editNeuronDialogOpen,
  dialogDetails,
  chooseRuleDialogOpen,
} from '@/stores/dialog';

import { handleKeyup, handleKeydown } from '@/graph/events/keyboard';
import { importSystem } from '@/graph/utils/parse-system';
import Toolbar from './Toolbar.vue';
import { exportSytem } from '@/graph/utils/parse-system';

const original = ref(null);
const status = ref();
const config = ref();

const status_list = ref([]);
const config_list = ref([]);
const tick = ref(0);

const changeTick = (i) => {
  tick.value += i;
  clearInterval(intervalId);
  navbar.running = false;
};

let intervalId = null;

/** @type {WebSocket} */
let ws = null;
let resetSimulation = null;

const stopSimulate = () => {
  navbar.running = false;
  ws.close();
  graph.value.getNodes().forEach((node) => {
    node?.clearStates(['default', 'spiking', 'closed']);
    node?.setState('default', true);
  });
  graph.value.getEdges().forEach((edge) => {
    edge?.clearStates(['default', 'spiking', 'closed']);
    edge?.setState('default', true);
  });
};

const startSimulate = async () => {
  ws = new WebSocket(`${import.meta.env.VITE_WS_API}/${system.mode}`);
  if (!original.value) {
    original.value = exportSytem(graph.value);
  }
  ws.onopen = function () {
    ws.send(
      JSON.stringify({
        data: exportSytem(graph.value),
        duration: system.duration,
      })
    );
  };
  ws.onmessage = function (event) {
    const data = JSON.parse(event.data);
    if (data.type === 'prompt') {
      dialogDetails.value = data.choices;
      chooseRuleDialogOpen.value = true;
    } else {
      status.value = data.states;
      config.value = data.configurations;

      if (data.halted === true) {
        navbar.running = false;
      }
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
          ? 'spiking'
          : res.states[index] === 0
          ? 'default'
          : 'closed',
    };
    return acc;
  }, {});

  status.value = states;
  config.value = configurations;
};

watch(tick, (newTick) => {
  status.value = status_list.value[newTick];
  config.value = config_list.value[newTick];
});

const toggleMode = () => {
  system.mode = system.mode === 'pseudorandom' ? 'guided' : 'pseudorandom';
};

const loadData = ref(null);
const clearAll = ref(null);

onMounted(() => {
  const vh = document.getElementById('mountNode').offsetHeight;
  const vw = document.getElementById('mountNode').offsetWidth;

  const g = createGraph('mountNode', vw, vh);

  g.read(system.data);
  graph.value = g;

  loadData.value = (data) => {
    g.read(importSystem(data));
    graph.value = g;
  };

  clearAll.value = () => {
    g.clear();
    graph.value = g;
  };

  resetSimulation = () => {
    navbar.running = false;
    const data = importSystem(original.value);
    g.changeData(data);
    original.value = null;
    graph.value = g;
  };

  watch(status, (newValue, oldValue) => {
    for (const key in newValue) {
      const node = g.findById(key);
      const edges = g.getEdges().filter((edge) => {
        return edge.getSource().getID() === key;
      });

      for (const edge of edges) {
        edge.getStates().forEach((state) => {
          if (state !== newValue[key]) {
            edge.clearStates(state);
          }
        });
        edge.setState('spiking', newValue[key] === 'spiking');
      }

      node.clearStates(['default', 'spiking', 'closed']);
      node.setState(newValue[key], true);
      node.setState('running', true);
    }
  });

  watch(config, (newValue, oldValue) => {
    for (const key in newValue) {
      const node = g.findById(key);
      const model = {
        content: node.getModel().content,
        delay: node.getModel().delay,
      };

      if (model !== newValue[key]) {
        node.update(newValue[key]);
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
