import G6 from '@antv/g6';

export default function removeNode() {
  G6.registerBehavior('remove-item', {
    getEvents() {
      return {
        'node:click': 'onNodeClick',
        'edge:click': 'onEdgeClick',
      };
    },
    onNodeClick(ev) {
      const graph = this.graph;
      const node = ev.item;
      setTimeout(() => {
        graph.remove(node);
      }, 100);
    },
    onEdgeClick(ev) {
      const graph = this.graph;
      const edge = ev.item;
      setTimeout(() => {
        graph.remove(edge);
      }, 100);
    },
  });
}
