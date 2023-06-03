<template>
  <Toolbar @load="load" @clear="clear" />

  <button
    @click="getHistory"
    class="absolute p-1 border rounded-md shadow-sm tool-button top-2 right-2 bg-light/80 backdrop-blur-sm border-dark/5 dark:border-light/5 dark:bg-neutral/80"
  >
    <Popper class="tooltip" hover placement="left">
      <template #content> History </template>
      <v-icon name="la-history-solid" />
    </Popper>
  </button>
  <div class="flex flex-col">
    <TransitionRoot appear :show="createNeuronDialogOpen" as="template">
      <CreateNeuronDialog
        :isOpen="createNeuronDialogOpen"
        :closeModal="() => (createNeuronDialogOpen = false)"
      />
    </TransitionRoot>
    <TransitionRoot appear :show="choiceHistoryDialogOpen" as="template">
      <ChoiceHistoryDialog
        :isOpen="choiceHistoryDialogOpen"
        :closeModal="() => (choiceHistoryDialogOpen = false)"
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
    <TransitionRoot appear :show="chooseRuleDialogOpen" as="template">
      <ChooseRuleDialog
        :isOpen="chooseRuleDialogOpen"
        :closeModal="() => (chooseRuleDialogOpen = false)"
        :details="dialogDetails"
        :socket="ws"
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
      class="absolute left-0 right-0 flex flex-col items-center justify-center px-8 py-4 mx-auto border rounded-3xl w-fit bottom-2 bg-light/40 border-dark/5 dark:border-light/5 dark:bg-neutral/40 backdrop-blur-sm"
    >
      <div class="flex items-center gap-2 text-dark/50 dark:text-dark-50">
        <Popper class="tooltip" hover placement="top">
          <template #content>
            {{ system.mode.charAt(0).toUpperCase() + system.mode.slice(1) }}
          </template>
          <button
            class="toggle"
            @click="
              () =>
                (system.mode =
                  system.mode === 'pseudorandom' ? 'guided' : 'pseudorandom')
            "
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
        </Popper>
        <v-icon
          name="la-step-backward-solid"
          @click="prev"
          scale="1.25"
          class="cursor-pointer"
        />
        <button
          class="p-1 rounded-full text-light bg-primary dark:bg-primary/20 dark:text-primary"
        >
          <v-icon
            name="bi-play-fill"
            @click="play"
            v-if="!navbar.running"
            scale="2"
            class="translate-x-[0.1rem]"
          />
          <v-icon name="bi-stop-fill" v-else scale="2" @click="stop" />
        </button>
        <v-icon
          name="la-step-forward-solid"
          @click="next"
          scale="1.25"
          class="cursor-pointer"
        />
        <Popper class="tooltip" hover placement="top">
          <template #content> Reset </template>
          <v-icon
            name="la-sync-solid"
            class="ml-2 cursor-pointer"
            @click="reset"
          />
        </Popper>
      </div>
      <div class="flex flex-col items-center justify-center gap-1">
        <input
          id="default-range"
          type="range"
          min="0.25"
          max="2.75"
          step="0.25"
          :value="system.speed"
          @input="(e) => (system.speed = e.target.value)"
          class="mt-4 slider"
        />
        <div>
          <span class="text-xs text-dark/40 dark:text-light/40"
            >{{ system.speed }}x</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { TransitionRoot } from '@headlessui/vue';
import CreateNeuronDialog from '@/components/CreateNeuronDialog.vue';
import EditNeuronDialog from '@/components/EditNeuronDialog.vue';
import EditSynapseDialog from '@/components/EditSynapseDialog.vue';
import ChooseRuleDialog from '@/components/ChooseRuleDialog.vue';
import Toolbar from './Toolbar.vue';

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
  hasDialog,
  choiceHistoryDialogOpen,
} from '@/stores/dialog';

import { handleKeyup, handleKeydown } from '@/graph/events/keyboard';
import { importSystem, exportSytem } from '@/graph/utils/parse-system';
import { useToast } from 'vue-toast-notification';
import ChoiceHistoryDialog from './ChoiceHistoryDialog.vue';
import settings from '@/stores/settings';

const original = ref(null);
const config = ref();
const $toast = useToast();

/** @type {WebSocket} */
let ws = null;
const reset = ref(null);
const load = ref(null);
const clear = ref(null);
const history = ref(null);

const getHistory = () => {
  choiceHistoryDialogOpen.value = true;
  ws.send(JSON.stringify({ cmd: 'history' }));
};

const stop = () => {
  navbar.running = false;
  ws.send(JSON.stringify({ cmd: 'stop' }));
};

const play = async () => {
  navbar.running = true;
  if (!original.value) {
    ws = new WebSocket(
      `${import.meta.env.VITE_WS_API}/ws/simulate/${system.mode}`
    );
    original.value = system.data();
    ws.onopen = function () {
      ws.send(
        JSON.stringify({
          data: system.data(),
          speed: parseInt(system.speed),
        })
      );
    };
    ws.onmessage = function (event) {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'prompt':
          dialogDetails.value = data.choices;
          chooseRuleDialogOpen.value = true;
          break;
        case 'step':
          config.value = data.configurations;
          if (data.halted && navbar.running) {
            $toast.success('Simulation completed successfully');
            navbar.running = false;
          }
          break;
        case 'history':
          system.history = data.history;
          break;
        default:
          break;
      }
    };
  } else {
    ws.send(JSON.stringify({ cmd: 'continue' }));
  }
};

const next = async () => {
  ws.send(JSON.stringify({ cmd: 'next' }));
};

const prev = async () => {
  ws.send(JSON.stringify({ cmd: 'prev' }));
};

watch(
  () => system.speed,
  (newDuration) => {
    if (ws) {
      ws.send(JSON.stringify({ cmd: 'speed', speed: parseInt(newDuration) }));
    }
  }
);

const handleBeforeUnload = (event) => {
  event.preventDefault();
};

onMounted(() => {
  const vh = document.getElementById('mountNode').offsetHeight;
  const vw = document.getElementById('mountNode').offsetWidth;

  const g = createGraph('mountNode', vw, vh);

  g.read(importSystem(system.data()));
  graph.value = g;

  load.value = (data) => {
    original.value = null;
    g.destroyLayout();
    g.read(importSystem(data), true);
    g.fitCenter();
  };

  clear.value = () => {
    g.clear();
    graph.value = g;
  };

  reset.value = async () => {
    if (!original.value) return;

    navbar.running = false;
    const data = importSystem(original.value);
    data.nodes.forEach((node) => {
      node.delay = 0;
    });
    g.changeData(data);
    if (settings.view === 'simple') {
      g.getNodes().forEach((node) => {
        node.setState('simple', true);
      });
    }
    original.value = null;

    ws.close();
  };

  watch(
    () => navbar.running,
    (value) => {
      value
        ? g.removeBehaviors([
            'node-interactions',
            'edge-interactions',
            'click-select',
          ])
        : g.addBehaviors([
            'node-interactions',
            'edge-interactions',
            'click-select',
          ]);
    }
  );

  watch(config, (newValue) => {
    newValue.map((item) => {
      const node = g.findById(item.id);
      const content = node.getModel().content;
      const delay = node.getModel().delay;

      if (content !== item.content || delay !== item.delay) {
        node.update({
          content: item.content,
          delay: item.delay,
        });
      }

      node.clearStates(['spiking', 'closed']);
      if (item.state !== 'default') {
        node.setState(item.state, true);
      }
      node.getEdges().forEach((edge) => {
        if (edge.getSource().getID() !== item.id) return;

        edge.setState('spiking', item.state === 'spiking');
      });
    });
  });

  const keyupHandler = (e) => handleKeyup(e, g);
  const keydownHandler = (e) => handleKeydown(e, g);

  window.addEventListener('keyup', keyupHandler);
  window.addEventListener('keydown', keydownHandler);
  window.addEventListener('beforeunload', handleBeforeUnload);

  watch(
    () => hasDialog.value,
    (value) => {
      if (value) {
        window.removeEventListener('keyup', keyupHandler);
        window.removeEventListener('keydown', keydownHandler);
      } else {
        window.addEventListener('keyup', keyupHandler);
        window.addEventListener('keydown', keydownHandler);
      }
    }
  );

  const resizeObserver = new ResizeObserver((entries) => {
    const { width, height } = entries[0].contentRect;
    g.changeSize(width, height);
    g.fitView();
  });

  resizeObserver.observe(document.getElementById('mountNode'));
});
</script>
