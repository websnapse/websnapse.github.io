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
      class="flex flex-col items-center w-full justify-center py-8 absolute bottom-0 bg-white/40 backdrop-blur-sm"
    >
      <div class="flex gap-1 items-center">
        <v-icon name="bi-shuffle" class="mr-2" />
        <v-icon name="bi-skip-start" scale="1.5" />
        <button
          class="rounded-full p-1 bg-primary text-white"
          @click="() => (navbar.running = !navbar.running)"
        >
          <v-icon name="bi-play-fill" scale="2" class="translate-x-[0.1rem]" />
        </button>
        <v-icon name="bi-skip-end" scale="1.5" />
        <v-icon name="bi-arrow-repeat" class="ml-2" />
      </div>
      <div>
        <label
          for="default-range"
          class="block text-sm font-medium text-gray-900 dark:text-white"
        >
          Default range
        </label>
        <input
          id="default-range"
          type="range"
          min="500"
          max="3500"
          step="500"
          v-model="duration"
          class="w-full h-2 bg-primary/30 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import G6 from '@antv/g6';
import { onMounted, ref, watch, computed } from 'vue';
import { TransitionRoot } from '@headlessui/vue';

import createGraph from '../graph/graph';
import initializeRegisters from '../graph/registers';
import { neuron } from '../stores/neuron';
import { system } from '../stores/system';
import { navbar } from '../stores/navbar';
import RuleDialog from './ruledialog.vue';
import WeightDialog from './weightdialog.vue';
import { clone } from '@antv/util';

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

// const vh = window.innerHeight - 40;
// const vw = window.innerWidth;

const changeData = () => {
  data.value = {
    nodes: [
      {
        label: 'n1',
        nodeType: 'regular',
        id: 'n_1',
        content: 'a',
        rules: ['a \\to a;0', 'a^2 \\to 0'],
        x: 100,
        y: 100,
      },
    ],
  };
};

// programmatically create a status ref containing an object with the node labels from the data and their status
const status = ref(
  data.value.nodes.reduce((acc, cur) => {
    acc[cur.id] = {
      value: 'default',
    };
    return acc;
  }, {})
);

// programmatically create an array of 5 elements
const array = Array.from(Array(5).keys()).map((_) => {
  return data.value.nodes.reduce((acc, cur) => {
    acc[cur.id] = {
      value: Math.random() > 0.5 ? 'default' : 'animate',
    };
    return acc;
  }, {});
});

const status_list = ref(array);

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

  const contextMenu = new G6.Menu({
    getContent(evt) {
      let content;
      const position = { x: evt.canvasX, y: evt.canvasY };
      mouse.value = position;
      if (evt.target && evt.target.isCanvas && evt.target.isCanvas()) {
        content = [
          { img: '/node.svg', text: 'New Node' },
          { img: '/fit.svg', text: 'Fit View' },
          { img: '/layout.svg', text: 'Auto layout' },
          { img: '/save.svg', text: 'Save' },
          { img: '/delete.svg', text: 'Clear' },
        ];
      } else if (evt.item) {
        const itemType = evt.item.getType();
        switch (itemType) {
          case 'node':
            content = [
              { img: '/content.svg', text: 'Edit content' },
              { img: '/rule.svg', text: 'Edit rules' },
              { img: '/focus.svg', text: 'Focus node' },
              { img: '/delete.svg', text: 'Delete' },
            ];
            break;
          case 'edge':
            content = [
              { img: '/weight.svg', text: 'Edit weight' },
              { img: '/delete.svg', text: 'Delete' },
            ];
            break;
          default:
            break;
        }
      }
      return `
    <ul>
      ${content
        .map(
          (item) =>
            `<li class='context-menu-item'>
              <img src=${item.img} class="context-menu-icon" />
              ${item.text}
            </li>`
        )
        .join('')}
    </ul>`;
    },
    handleMenuClick: (target, item) => {
      const command = target.innerText;
      // get target position
      const point = target.getBoundingClientRect();
      point.x = point.x + point.width / 2;
      point.y = (point.y + point.height) / 2;

      const model = item?.getModel();
      // get mouse positions in the graph canvas
      switch (command) {
        case 'New Node':
          const last_node = graph.getNodes()[graph.getNodes().length - 1];
          const last_node_id = last_node.getModel().id;
          const orig_id = last_node_id.split('-')[0];
          // get the duplicate number of the last node
          const duplicate = parseInt(last_node_id.split('-')[1] ?? 1) + 1;
          graph.addItem('node', {
            x: point.x,
            y: point.y,
            id: `${orig_id}-${duplicate}`, // Generate a unique id
            nodeType: neuron.value.nodeType,
            content: neuron.value.content,
            rules: neuron.value.rules.split('\n'),
          });
          break;
        case 'Fit View':
          graph.fitView();
          break;
        case 'Save':
          const system_edges = graph.save().edges;
          const system_nodes = graph.save().nodes;
          const parsed_nodes = system_nodes.map((node) => {
            return {
              id: node.id,
              content: node.content,
              rules: node.rules,
              x: node.x,
              y: node.y,
            };
          });
          const parsed_edges = system_edges.map((edge) => {
            return {
              source: edge.source,
              target: edge.target,
              label: edge.label,
            };
          });

          const parsed_system = {
            nodes: parsed_nodes,
            edges: parsed_edges,
          };

          // download the json file
          const a = document.createElement('a');
          const file = new Blob([JSON.stringify(parsed_system)], {
            type: 'text/plain',
          });
          a.href = URL.createObjectURL(file);
          a.download = 'system.json';
          a.click();
          break;
        case 'Clear':
          graph.clear();
          break;
        case 'Auto layout':
          graph.layout();
          break;
        case 'Focus node':
          graph.focusItem(item);
          break;
        case 'Edit content':
          // get item config
          const content = model.content.split('^');
          model.content =
            content[0] + '^{' + String(Number(content[1] ?? 1) + 1) + '}';
          item.update(model);
          item.refresh();
          break;
        case 'Edit rules':
          // get item config
          model.rules = ['a \\to a;0'];
          item.update(model);
          item.refresh();
          break;
        case 'Edit weight':
          // get item config
          async function update() {
            const updated = await updateEdge(item);
            model.label = updated.weight;
            item.update(model);
          }
          update();
          break;
        case 'Delete':
          setTimeout(() => {
            graph.getNodes().forEach((node) => {
              if (node.hasState('selected')) {
                graph.removeItem(node);
              }
            });
            graph.removeItem(item);
          }, 100);
          break;
      }
    },
    offsetX: 16 + 10,
    offsetY: 0,
    itemTypes: ['node', 'edge', 'canvas'],
  });

  const graph = createGraph('mountNode', vw, vh, contextMenu);

  graph.on('rules:dblclick', async function (evt) {
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

  const undo = () => {
    const undoStack = graph.getUndoStack();
    if (!undoStack || undoStack.length === 0) {
      return;
    }

    const currentData = undoStack.pop();
    console.log(currentData);
    if (currentData) {
      const { action } = currentData;
      graph.pushStack(action, clone(currentData.data), 'redo');
      let data = currentData.data.before;

      if (action === 'add') {
        data = currentData.data.after;
      }

      switch (action) {
        case 'visible': {
          Object.keys(data).forEach((key) => {
            const array = data[key];
            if (!array) return;
            array.forEach((model) => {
              const item = graph.findById(model.id);
              if (model.visible) {
                graph.showItem(item, false);
              } else {
                graph.hideItem(item, false);
              }
            });
          });
          break;
        }
        case 'render':
        case 'update':
          Object.keys(data).forEach((key) => {
            const array = data[key];
            if (!array) return;
            array.forEach((model) => {
              const item = graph.findById(model.id);
              delete model.id;
              graph.updateItem(item, model, false);
              if (item.getType() === 'combo') graph.updateCombo(item);
            });
          });
          break;
        case 'changedata':
          graph.changeData(data, false);
          break;
        case 'delete': {
          Object.keys(data).forEach((key) => {
            const array = data[key];
            if (!array) return;
            array.forEach((model) => {
              const itemType = model.itemType;
              delete model.itemType;
              graph.addItem(itemType, model, false);
            });
          });
          break;
        }
        case 'add':
          Object.keys(data).forEach((key) => {
            const array = data[key];
            if (!array) return;
            array.forEach((model) => {
              graph.removeItem(model.id, false);
            });
          });
          break;
        case 'updateComboTree':
          Object.keys(data).forEach((key) => {
            const array = data[key];
            if (!array) return;
            array.forEach((model) => {
              graph.updateComboTree(model.id, model.parentId, false);
            });
          });
          break;
        case 'createCombo':
          const afterCombos = currentData.data.after.combos;
          const createdCombo = afterCombos[afterCombos.length - 1];
          Object.keys(data).forEach((key) => {
            const array = data[key];
            if (!array) return;
            array.forEach((model) => {
              graph.updateComboTree(model.id, model.parentId, false);
            });
          });
          graph.removeItem(createdCombo.id, false);
          break;
        case 'uncombo':
          const targetCombo = data.combos[data.combos.length - 1];
          const childrenIds = data.nodes
            .concat(data.combos)
            .map((child) => child.id)
            .filter((id) => id !== targetCombo.id);
          graph.createCombo(targetCombo, childrenIds, false);
          break;
        case 'layout':
          graph.updateLayout(data, undefined, undefined, false);
          break;
        default:
      }
      graph.refresh();
    }
  };

  const redo = () => {
    const redoStack = graph.getRedoStack();

    if (!redoStack || redoStack.length === 0) {
      return;
    }

    const currentData = redoStack.pop();
    if (currentData) {
      const { action } = currentData;
      let data = currentData.data.after;
      graph.pushStack(action, clone(currentData.data));
      if (action === 'delete') {
        data = currentData.data.before;
      }

      if (!data) return;

      switch (action) {
        case 'visible': {
          Object.keys(data).forEach((key) => {
            const array = data[key];
            if (!array) return;
            array.forEach((model) => {
              const item = graph.findById(model.id);
              if (model.visible) {
                graph.showItem(item, false);
              } else {
                graph.hideItem(item, false);
              }
            });
          });
          break;
        }
        case 'render':
        case 'update':
          Object.keys(data).forEach((key) => {
            const array = data[key];
            if (!array) return;
            array.forEach((model) => {
              const item = graph.findById(model.id);
              delete model.id;
              graph.updateItem(item, model, false);
              if (item.getType() === 'combo') graph.updateCombo(item);
            });
          });
          break;
        case 'changedata':
          graph.changeData(data, false);
          break;
        case 'delete':
          if (data.edges) {
            data.edges.forEach((model) => {
              graph.removeItem(model.id, false);
            });
          }
          if (data.nodes) {
            data.nodes.forEach((model) => {
              graph.removeItem(model.id, false);
            });
          }
          if (data.combos) {
            data.combos.forEach((model) => {
              graph.removeItem(model.id, false);
            });
          }
          break;
        case 'add': {
          Object.keys(data).forEach((key) => {
            const array = data[key];
            if (!array) return;
            array.forEach((model) => {
              const itemType = model.itemType;
              delete model.itemType;
              graph.addItem(itemType, model, false);
            });
          });
          break;
        }
        case 'updateComboTree':
          Object.keys(data).forEach((key) => {
            const array = data[key];
            if (!array) return;
            array.forEach((model) => {
              graph.updateComboTree(model.id, model.parentId, false);
            });
          });
          break;
        case 'createCombo':
          const createdCombo = data.combos[data.combos.length - 1];
          graph.createCombo(
            createdCombo,
            createdCombo.children.map((child) => child.id),
            false
          );
          break;
        case 'uncombo':
          const beforeCombos = currentData.data.before.combos;
          const targertCombo = beforeCombos[beforeCombos.length - 1];
          graph.uncombo(targertCombo.id, false);
          break;
        case 'layout':
          graph.updateLayout(data, undefined, undefined, false);
          break;
        default:
      }
    }
  };

  const handleKeydown = (evt) => {
    const { key } = evt;
    if (key === 'h') {
      navbar.value.mode = 'pan';
    }

    if (key === 'Control') {
      navbar.value.mode = 'addEdge';
    }

    if (evt.ctrlKey && evt.key === 'z') {
      undo();
    }

    if (evt.ctrlKey && evt.shiftKey && evt.key === 'Z') {
      redo();
    }
  };

  const handleMousedown = (evt) => {
    // check if middle mouse button is pressed
    if (evt.button === 1) {
      navbar.value.mode = 'pan';
      // move the graph to the mouse position
      graph.translate(mouse.value.x, mouse.value.y);
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
        node.refresh();
      });
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

  watch(
    () => navbar.value.running,
    (isRunning) => {
      let i = 0;
      let run = setInterval(request, duration.value);
      function request() {
        console.log(duration);
        clearInterval(run);
        status.value = status_list.value[i % 5];
        i++;

        run = setInterval(request, duration.value);
      }
      if (isRunning) {
      } else {
        // stop the interval
        clearInterval(run);
      }
    }
  );

  // if the width and height of mountNode changes, update width and height of graph
  const resizeObserver = new ResizeObserver((entries) => {
    const { width, height } = entries[0].contentRect;
    graph.changeSize(width, height);
  });

  resizeObserver.observe(document.getElementById('mountNode'));
});
</script>
