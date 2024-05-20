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
import { onMounted, ref, watch } from "vue";
import Toolbar from "@/components/Toolbar.vue";
import Dialogs from "@/components/Dialogs.vue";

import createGraph from "@/graph/graph";
import system from "@/stores/system";
import navbar from "@/stores/navbar";
import graph from "@/stores/graph";
import dialog from "@/stores/dialog";
import settings from "@/stores/settings";

import { importSystem } from "@/graph/utils/parse-system";
import { useToast } from "vue-toast-notification";
import { redo, undo } from "@/graph/utils/action-stack";
import ViewControls from "./ViewControls.vue";
import SimulationControls from "./SimulationControls.vue";
import Tick from "./Tick.vue";

const $toast = useToast();

const config = ref(null);

const reset = ref(null);
const load = ref(null);
const clear = ref(null);
const undoAction = ref(null);
const redoAction = ref(null);
const zoomIn = ref(null);
const zoomOut = ref(null);

watch(
  () => system.speed,
  (newDuration) => {
    if (system.ws && system.ws.readyState === WebSocket.OPEN) {
      system.ws.send(
        JSON.stringify({ cmd: "speed", speed: parseInt(newDuration) })
      );
    }
  }
);

const handleBeforeUnload = (event) => {
  system.backupSystem();
};

import rulebook from "@/stores/rulebook";

onMounted(() => {
  const vh = document.getElementById("mountNode").offsetHeight;
  const vw = document.getElementById("mountNode").offsetWidth;

  const g = createGraph("mountNode", vw, vh);

  g.read(importSystem(system.data()));
  graph.value = g;

  // console.log(graph.value.getNodes());
  // rulebook.all_rules = {};
  // graph.value.getNodes().forEach((node) => {
  //   const nodeMap = new Object();

  //   if (node.getModel().type == "regular") {
  //     nodeMap[node.getModel().id] = node.getModel().rules;
  //     rulebook.all_rules = { ...rulebook.all_rules, ...nodeMap };
  //   }
  // });

  load.value = (data) => {
    system.reset = null;
    system.tick = 0;
    g.destroyLayout();
    g.clear();
    g.changeData(importSystem(data), true);
    g.fitCenter();
    $toast.success("System imported successfully", { position: "top-right" });
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
    rulebook.global_rules = {};
    rulebook.all_rules = {};
    rulebook.global_edges = [];
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
    if (settings.view === "simple") {
      g.getNodes().forEach((node) => {
        node.setState("simple", true);
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

  const refreshTick = ref(0);

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
          case "prompt":
            dialog.details = data.choices;
            dialog.chooseRule = true;
            break;
          case "step":
            config.value = JSON.parse(JSON.stringify(data.configurations));
            config.edges = JSON.parse(JSON.stringify(data.edges));
            // console.log(config.edges);
            data.configurations = null;
            if (data.halted && navbar.running) {
              $toast.success("Simulation completed successfully", {
                position: "top-right",
              });
              navbar.running = false;
            }

            if (navbar.running) {
              value.send(
                JSON.stringify({
                  cmd: "received",
                })
              );
            }
            system.tick = data.tick;
            break;
          case "history":
            system.history = data.history;
            break;
          default:
            break;
        }
        event = null;
      };
    }
  );

  watch(
    () => navbar.running,
    (value) => {
      value
        ? g.removeBehaviors([
            "node-interactions",
            "edge-interactions",
            "click-select",
          ])
        : g.addBehaviors([
            "node-interactions",
            "edge-interactions",
            "click-select",
          ]);
    }
  );

  async function processItems(newValue) {
    newValue.forEach(async (item) => {
      var node = g.findById(item.id);

      if (node == undefined) {
        const nodeRules =
          item.id in rulebook.global_rules
            ? rulebook.global_rules[item.id]
            : [];

        g.addItem("node", {
          x: 100,
          y: 100,
          id: item.id,
          type: "regular",
          content: item.content,
          rules: nodeRules,
          delay: 0,
        });
      }
    });

    const idSet = new Set(newValue.map((dict) => dict.id));

    let finNodes = g.getNodes().map((node) => node.getModel().id);

    let adjustGrid = false;
    while (finNodes.length != idSet.size) {
      g.getNodes().forEach(async (node) => {
        if (!idSet.has(node.getModel().id)) {
          adjustGrid = true;
          g.removeItem(node);
        }
      });
      finNodes = g.getNodes().map((node) => node.getModel().id);
    }

    for (const [id, edges] of Object.entries(config.edges)) {
      var node = g.findById(id);

      if (node != undefined) {
        edges.forEach((edge) => {
          var node2 = g.findById(edge);
          if (node2 != undefined) {
            if (
              g
                .getEdges()
                .filter(
                  (oldedge) =>
                    oldedge.getModel().source === id &&
                    oldedge.getModel().target === edge
                ).length == 0
            ) {
              g.addItem("edge", {
                source: node,
                target: node2,
                label: 1,
              });
            }
          }
        });
      }
    }

    const promises = newValue.map(async (item) => {
      var node = g.findById(item.id);

      const { type, content, delay } = node.getModel();

      if (refreshTick.value == 0 || !navbar.running) {
        if (content !== item.content && delay !== item.delay) {
          node.update({
            content: item.content,
            delay: item.delay,
          });
        } else {
          if (content !== item.content) {
            node.update({
              content: item.content,
            });
          }
        }

        if (delay !== item.delay) {
          node.update({
            delay: item.delay,
          });
        }
      }

      if (type === "output") {
        node.getInEdges().forEach(async (edge) => {
          edge.refresh();
        });
      }

      if (!node.hasState(item.state)) {
        node.clearStates(["spiking", "closed", "forgetting"]);
        if (item.state !== "default") {
          node.setState(item.state, true);
        }
        node.getOutEdges().forEach((edge) => {
          edge.setState("spiking", item.state === "spiking");
        });
      }
    });

    if (adjustGrid) {
      g.updateLayout(
        {
          type: "dagre",
          rankdir: "LR",
          linkDistance: 300,
          nodeStrength: 10,
          edgeStrength: 10,
          nodeSpacing: 50,
          minMovement: 0.01,
          maxIteration: 100,
          damping: 0.01,
          preventOverlap: true,
        },
        "center"
      );
    }
    await Promise.all(promises);
  }

  async function updateStates(newValue) {
    const nodes = g
      .getNodes()
      .filter((node) => node.getModel().type !== "input");

    const nodeMap = nodes.reduce((acc, node) => {
      acc[node.getModel().id] = node;
      return acc;
    }, {});

    const promises = newValue.map(async (item) => {
      const node = nodeMap[item.id];

      const { type } = node.getModel();

      if (type === "output") {
        node.getInEdges().forEach(async (edge) => {
          edge.refresh();
        });
      }

      node.clearStates(["spiking", "closed", "forgetting"]);
      if (item.state !== "default") {
        node.setState(item.state, true);
      }

      if (settings.view === "simple") {
        node.setState("simple", true);
      }

      node.getOutEdges().forEach((edge) => {
        edge.setState("spiking", item.state === "spiking");
      });
    });

    Promise.all(promises);
  }

  function changeItems(newValue) {
    const update = {
      nodes: newValue.map((item) => {
        const { id, content, delay, state } = item;
        return {
          id,
          content,
          delay,
          state,
        };
      }),
      edges: g.save().edges,
    };

    if (refreshTick.value == 0 || !navbar.running) {
      g.changeData(update);
    }
    updateStates(newValue);
  }

  watch(
    config,
    (newValue) => {
      if (!newValue) return;
      refreshTick.value = (refreshTick.value + 1) % settings.refreshRate;
      processItems(newValue);
    },
    { deep: true }
  );

  watch(
    () => dialog.hasDialog(),
    (value) => {
      if (value) {
        g.removeBehaviors("keyboard-interactions");
      } else {
        g.addBehaviors("keyboard-interactions");
      }
    }
  );

  window.addEventListener("beforeunload", handleBeforeUnload);

  const resizeObserver = new ResizeObserver((entries) => {
    const { width, height } = entries[0].contentRect;
    g.changeSize(width, height);
    g.fitView();
  });

  resizeObserver.observe(document.getElementById("mountNode"));
});
</script>
