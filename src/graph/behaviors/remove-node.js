import G6 from '@antv/g6';

export default function removeNode() {
  G6.registerBehavior('remove-node', {
    getEvents() {
      return {
        'node:click': 'onClick',
      };
    },
    onClick(ev) {
      const graph = this.graph;
      const node = ev.item;
      const model = node.getModel();
      setTimeout(() => {
        graph.remove(node);
      }, 100);

      // graph.refresh();
    },
  });
}
