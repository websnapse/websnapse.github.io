<template>
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
  <div id="mountNode" class="flex justify-center items-start"></div>
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

const vh = window.innerHeight - 40;
const vw = window.innerWidth;

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

let i = 0;
// setInterval(() => {
//   i += 1;
//   status.value = status_list.value[i % 5];
// }, 3000);

// switch status value to animate and normal periodically
// setInterval(function () {
//   status.value = !status.value;
// }, 3000);

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

let graph;

const g6 = async (system) => {
  await initializeRegisters(neuron);

  const contextMenu = new G6.Menu({
    getContent(evt) {
      let content;
      const position = { x: evt.clientX, y: evt.clientY };
      mouse.value = position;
      console.log(position);
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
          const system = graph.save().edges;
          // download the json file
          const a = document.createElement('a');
          const file = new Blob([JSON.stringify(system)], {
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
          console.log(content);
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

  graph = createGraph('mountNode', vw, vh, contextMenu);

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

  graph.data(data.value);
  graph.render();

  watch(
    () => props.graph_mode,
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

  // watch navbar view
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
};

onMounted(async () => {
  g6(data);
});
</script>
