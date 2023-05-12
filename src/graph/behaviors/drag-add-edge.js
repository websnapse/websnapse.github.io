import G6 from '@antv/g6';

export default function dragAddEdge() {
  G6.registerBehavior('drag-add-edge', {
    // Bind the events and response functions for this custom Behavior

    getEvents() {
      return {
        dragstart: 'onDragStart',
        drag: 'onDrag',
        drop: 'onDrop',
      };
    },

    onDragStart(ev) {
      const node = ev.item;
      const graph = this.graph;
      const point = { x: ev.x, y: ev.y };
      const model = node?.getModel();
      const edges = graph.save().edges;

      if (!model) return;

      this.edge = graph.addItem(
        'edge',
        {
          source: model.id,
          target: point,
          label: 1,
        },
        true
      );

      const exist = edges.filter(
        (e) =>
          e.source === this.edge.getSource().getID() && e.target === model.id
      );

      // check if node type is input
      if (model.nodeType === 'input') {
        this.graph.removeItem(this.edge, false);
        this.edge = null;
        this.addingEdge = false;
        return;
      }

      if (exist.length > 0) {
        this.graph.removeItem(this.edge, false);
      }
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
      const model = currentEdge.getModel();

      if (this.edge == currentEdge) {
        this.graph.removeItem(this.edge, false);
        this.edge = null;
        this.addingEdge = false;
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
    },
  });
}
