import { ref, watch } from 'vue';
import navbar from './navbar';
import settings from './settings';

const graph = ref(null);

watch(
  () => settings.view,
  (value) => {
    graph.value.getNodes().forEach((node) => {
      value === 'simple'
        ? graph.value.setItemState(node, 'simple', true)
        : graph.value.setItemState(node, 'simple', false);
    });
    graph.value.refresh();
  }
);

watch(
  () => settings.dark,
  (value) => {
    graph.value.getNodes().forEach((node) => {
      graph.value.setItemState(node, 'dark', value);

      const { type, dark_rules, light_rules, dark_label, light_label } =
        node.getModel();
      const group = node.getContainer();
      const rules_shape = group.find((ele) => {
        return ele.get('name') === 'rules';
      });
      const label_shape = group.find((ele) => {
        return ele.get('name') === 'label';
      });

      if (type === 'regular') {
        rules_shape.attr({
          img: value ? dark_rules : light_rules,
        });
      }

      label_shape.attr({
        img: value ? dark_label : light_label,
      });
    });
    graph.value.getEdges().forEach((edge) => {
      graph.value.setItemState(edge, 'dark', value);
    });
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
