<template>
  <Toolbar @load="load" @clear="clear" />
  <Dialogs />
  <ViewControls
    @redo="redoAction"
    @undo="undoAction"
    @zoomIn="zoomIn"
    @zoomOut="zoomOut"
  />
  <SimulationControls @reset="reset" />
  <Tick />
  <div
    id="mountNode"
    class="flex items-start justify-center w-screen h-screen overflow-hidden"
  >
    <div class="back"></div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import Toolbar from '@/components/Toolbar.vue';
import Dialogs from '@/components/Dialogs.vue';
import Tick from '@/components/Tick.vue';
import ViewControls from '@/components/ViewControls.vue';
import SimulationControls from '@/components/SimulationControls.vue';

import createGraph from '@/graph/graph';
import renderTick from '@/graph/utils/render-tick';
import system from '@/stores/system';
import navbar from '@/stores/navbar';
import graph from '@/stores/graph';
import dialog from '@/stores/dialog';
import settings from '@/stores/settings';

import { importSystem } from '@/graph/utils/parse-system';
import { useToast } from 'vue-toast-notification';
import { redo, undo } from '@/graph/utils/action-stack';

const $toast = useToast();

const config = ref(null);
const reset = ref(null);
const load = ref(null);
const clear = ref(null);
const undoAction = ref(null);
const redoAction = ref(null);
const zoomIn = ref(null);
const zoomOut = ref(null);
const refreshTick = ref(0);

const handleBeforeUnload = () => {
  system.backupSystem();
};

onMounted(() => {
  const vh = document.getElementById('mountNode').offsetHeight;
  const vw = document.getElementById('mountNode').offsetWidth;

  const g = createGraph('mountNode', vw, vh);

  g.read(importSystem(system.data()));
  graph.value = g;

  load.value = (data) => {
    system.reset = null;
    system.tick = 0;
    g.destroyLayout();
    g.clear();
    g.changeData(importSystem(data), true);
    g.fitCenter();
    $toast.success('System imported successfully', { position: 'top-right' });
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
    system.reset = null;
  };

  reset.value = async () => {
    if (!system.reset) return;

    navbar.running = false;
    const data = importSystem(system.reset);
    data.nodes.forEach((node) => {
      node.delay = 0;
    });
    g.changeData(data);
    if (settings.view === 'simple') {
      g.getNodes().forEach((node) => {
        node.setState('simple', true);
      });
    }
    system.reset = null;
    system.tick = 0;

    system.ws.close();
  };

  undoAction.value = () => {
    undo(g);
  };

  redoAction.value = () => {
    redo(g);
  };

  zoomIn.value = () => {
    const zoom = g.getZoom();
    const center = g.getGraphCenterPoint();
    g.zoomTo(zoom + 0.4, center, true, {
      duration: 100,
    });
  };

  zoomOut.value = () => {
    const zoom = g.getZoom();
    const center = g.getGraphCenterPoint();
    g.zoomTo(zoom - 0.4, center, true, {
      duration: 100,
    });
  };

  // when websocket changes
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
            config.value = JSON.parse(JSON.stringify(data.configurations));
            data.configurations = null;
            if (data.halted && navbar.running) {
              $toast.success('Simulation completed successfully', {
                position: 'top-right',
              });
              navbar.running = false;
            }

            if (navbar.running) {
              value.send(
                JSON.stringify({
                  cmd: 'received',
                })
              );
            }
            system.tick = data.tick;
            break;
          case 'history':
            system.history = data.history;
            break;
          default:
            break;
        }
        event = null;
      };
    }
  );

  // remove interactions when running
  watch(
    () => navbar.running,
    (value) => {
      value
        ? g.removeBehaviors([
            'node-interactions',
            'edge-interactions',
            'click-select',
            'brush-select',
          ])
        : g.addBehaviors([
            'node-interactions',
            'edge-interactions',
            'click-select',
            'brush-select',
          ]);
    }
  );

  watch(
    config,
    async (newValue) => {
      if (!newValue) return;
      refreshTick.value = (refreshTick.value + 1) % settings.refreshRate;
      await renderTick(g, newValue);
    },
    { deep: true }
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
  window.addEventListener('beforeunload', handleBeforeUnload);
});
</script>
