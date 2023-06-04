<template>
  <Toolbar @load="load" @clear="clear" @redo="redoAction" @undo="undoAction" />
  <Dialogs />
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
import { onMounted, ref, watch } from 'vue';
import Toolbar from '@/components/Toolbar.vue';
import Dialogs from '@/components/Dialogs.vue';

import createGraph from '@/graph/graph';
import system from '@/stores/system';
import navbar from '@/stores/navbar';
import graph from '@/stores/graph';
import dialog from '@/stores/dialog';
import settings from '@/stores/settings';

import { importSystem } from '@/graph/utils/parse-system';
import { useToast } from 'vue-toast-notification';
import { redo, undo } from '@/graph/utils/action-stack';

const original = ref(null);
const config = ref(null);
const $toast = useToast();

const reset = ref(null);
const load = ref(null);
const clear = ref(null);
const undoAction = ref(null);
const redoAction = ref(null);

const getHistory = () => {
  dialog.choiceHistory = true;
  system.ws.send(JSON.stringify({ cmd: 'history' }));
};

const stop = () => {
  navbar.running = false;
  system.ws.send(JSON.stringify({ cmd: 'stop' }));
};

const play = async () => {
  navbar.running = true;
  if (!original.value) {
    system.ws = new WebSocket(
      `${import.meta.env.VITE_WS_API}/ws/simulate/${system.mode}`
    );
    original.value = system.data();
  } else {
    system.ws.send(JSON.stringify({ cmd: 'continue' }));
  }
};

const next = async () => {
  system.ws.send(JSON.stringify({ cmd: 'next' }));
};

const prev = async () => {
  system.ws.send(JSON.stringify({ cmd: 'prev' }));
};

watch(
  () => system.speed,
  (newDuration) => {
    if (system.ws) {
      system.ws.send(
        JSON.stringify({ cmd: 'speed', speed: parseInt(newDuration) })
      );
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
    g.clear();
    g.changeData(importSystem(data), true);
    g.fitCenter();
    $toast.success('System imported successfully', { position: 'bottom-left' });
  };

  clear.value = () => {
    g.changeData(
      {
        nodes: [],
        edges: [],
      },
      true
    );
    g.clear();
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

    system.ws.close();
  };

  undoAction.value = () => {
    undo(g);
  };

  redoAction.value = () => {
    redo(g);
  };

  watch(
    () => system.ws,
    (value) => {
      value.onopen = function () {
        value.send(
          JSON.stringify({
            data: system.data(),
            speed: parseInt(system.speed),
          })
        );
      };
      value.onmessage = function (event) {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'prompt':
            dialog.details = data.choices;
            dialog.chooseRule = true;
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
    }
  );

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

  watch(
    config,
    (newValue) => {
      newValue?.map((item) => {
        const node = g.findById(item.id);
        const { type, content, delay } = node.getModel();

        if (content !== item.content || delay !== item.delay) {
          node.update({
            content: item.content,
            delay: item.delay,
          });
        }

        if (type === 'output') {
          node.getInEdges().forEach((edge) => {
            edge.refresh();
          });
        }

        node.clearStates(['spiking', 'closed', 'forgetting']);
        if (item.state !== 'default') {
          node.setState(item.state, true);
        }
        node.getOutEdges().forEach((edge) => {
          edge.setState('spiking', item.state === 'spiking');
        });
      });
    },
    { deep: true, immediate: true }
  );

  watch(
    () => dialog.hasDialog(),
    (value) => {
      if (value) {
        g.removeBehaviors('keyboard-interactions');
      } else {
        g.addBehaviors('keyboard-interactions');
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
