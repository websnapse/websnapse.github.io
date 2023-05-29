import { updateSynapse } from '@/utils/dialog';
import G6 from '@antv/g6';

export default function edgeInteractions() {
  G6.registerBehavior('edge-interactions', {
    getEvents() {
      return {
        'edge:click': 'onClick',
        'edge:mouseenter': 'onMouseEnter',
        'edge:mouseleave': 'onMouseLeave',
        'edge:dblclick': 'onDblClick',
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
      const model = item.getModel();
      const updated = await updateSynapse(item);
      model.label = updated.label;
      item.update(model);
    },
  });
}
