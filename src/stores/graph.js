import { ref, watch } from 'vue';
import { navbar } from './navbar';

const graph = ref(null);

watch(
  () => navbar.view,
  (newView) => {
    graph.value.getNodes().forEach((node) => {
      newView !== 'simple'
        ? graph.value.setItemState(node, 'simple', true)
        : graph.value.clearItemStates(node);
    });
    graph.value.refresh();
  }
);

watch(
  () => navbar.mode,
  (val) => {
    graph.value.setMode(val);
    switch (val) {
      case 'default':
        graph.value.get('canvas').setCursor('default');
        break;
      case 'pan':
        graph.value.get('canvas').setCursor('grab');
        break;
      case 'edge':
        graph.value.get('canvas').setCursor('alias');
        break;
      case 'node':
        graph.value.get('canvas').setCursor('copy');
        break;
      case 'delete':
        graph.value.get('canvas').setCursor('not-allowed');
        break;
      default:
        graph.value.get('canvas').setCursor('default');
        break;
    }
  }
);

export default graph;
