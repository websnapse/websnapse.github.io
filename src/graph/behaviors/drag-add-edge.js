import G6 from '@antv/g6';

export default function dragAddEdge() {
  G6.registerBehavior('drag-add-edge', {
    getEvents() {
      return {
        'node:dragstart': 'onDragStart',
        'node:drag': 'onDrag',
        drop: 'onDrop',
      };
    },

    onDragStart(ev) {
      const node = ev.item;
      const graph = this.graph;
      const point = { x: ev.x, y: ev.y };
      const model = node?.getModel();
      const edges = graph.save().edges;

      if (model.type === 'output') return;

      const exist = edges.filter(
        (e) => e.source === model.id && e.target === model.id
      );

      if (exist.length > 0) return;

      this.edge = graph.addItem(
        'edge',
        {
          source: model.id,
          target: point,
          label: 1,
        },
        true
      );
    },

    onDrag(ev) {
      const point = { x: ev.x, y: ev.y };
      if (this.edge) {
        this.graph.updateItem(
          this.edge,
          {
            target: point,
          },
          false
        );
      }
    },

    onDrop(ev) {
      const currentEdge = ev.item;
      const source = this.edge?.getSource();
      const model = ev?.item?.getModel();

      if (!source) return;

      if (model.type === 'input' || !model) {
        this.graph.removeItem(this.edge, false);
        this.edge = null;
        this.addingEdge = false;
        return;
      }

      if (this.edge == currentEdge) {
        this.graph.removeItem(this.edge, false);
      } else if (this.edge.getSource() !== currentEdge) {
        this.graph.updateItem(
          this.edge,
          {
            target: model.id,
          },
          false
        );
      } else {
        this.graph.removeItem(this.edge, false);
      }
      this.edge = null;
      this.addingEdge = false;
    },
  });
}
