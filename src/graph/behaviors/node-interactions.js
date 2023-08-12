import { updateNeuron } from '@/utils/dialog';
import { clone } from '@antv/util';
import G6 from '@antv/g6';

export default function nodeInteractions() {
  G6.registerBehavior('node-interactions', {
    getEvents() {
      return {
        'node:click': 'onClick',
        'node:mouseenter': 'onMouseEnter',
        'node:mouseleave': 'onMouseLeave',
        'node:dblclick': 'onDblClick',
      };
    },
    onClick(evt) {
      const { item } = evt;
      item.setState('selected', true);
    },
    onMouseEnter(evt) {
      const { item } = evt;
      item.setState('hover', true);
    },
    onMouseLeave(evt) {
      const { item } = evt;
      item.clearStates('hover');
    },
    async onDblClick(evt) {
      const { item } = evt;
      const model = clone(item.getModel());
      const updated = await updateNeuron(item);

      if (!updated.success) return;

      if (updated.type === 'regular') {
        if (updated.rules !== model.rules) {
          // get item edges
          let edges = [];
          item.getEdges().forEach((edge) => edges.push(clone(edge.getModel())));
          setTimeout(() => {
            this.graph.removeItem(item);
            this.graph.addItem('node', {
              ...model,
              ...updated,
            });
            edges.forEach((edge) => {
              this.graph.addItem('edge', edge);
            });
          }, 100);
        }
      } else {
        if (updated.type === 'regular') {
          model.id = updated.id;
          model.content = updated.content;
          model.rules = updated.rules;
        } else {
          model.id = updated.id;
          model.content = updated.content;
        }
        this.graph.updateItem(item, model, true);
      }
    },
  });
}
