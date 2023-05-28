import G6 from '@antv/g6';

export default function clickAddEdge() {
  G6.registerBehavior('click-add-edge', {
    // Bind the events and response functions for this custom Behavior

    getEvents() {
      return {
        'node:click': 'onClick', // The event to be listned is node:click. The response function is onClick
        mousemove: 'onMousemove', // The event to be listned is mousemove. The response function is onMousemove
        'edge:click': 'onEdgeClick', // The event to be listned is edge:click. The response function is onEdgeClick
      };
    },
    // The response function for 'node:click' defined in getEvents
    onClick(ev) {
      const node = ev.item;
      const graph = this.graph;
      // The position of the node where the mouse is currently clicking on
      const point = { x: ev.x, y: ev.y };
      const model = node.getModel();
      const edges = graph.save().edges;

      // If this is the first node clicked, add a edge from it
      // Otherwise, if this is the second node clicked, then we should add a edge bewteen the previous node and this node
      if (this.addingEdge && this.edge) {
        const exist = edges.filter(
          (e) =>
            e.source === this.edge.getSource().getID() && e.target === model.id
        );

        if (model.type === 'input') {
          this.graph.removeItem(this.edge);
          this.edge = null;
          this.addingEdge = false;
          return;
        }

        if (this.edge.getSource() !== node) {
          graph.updateItem(this.edge, {
            target: model.id,
          });
        } else {
          this.graph.removeItem(this.edge);
        }

        if (exist.length > 0) {
          this.graph.removeItem(this.edge);
        }

        this.edge = null;
        this.addingEdge = false;
      } else {
        // Add a new edge to the graph with the currently clicked node's position as the end point
        if (model.type !== 'output') {
          this.edge = graph.addItem('edge', {
            source: model.id,
            target: point,
          });
          this.addingEdge = true;
        }
      }
    },

    onMousemove(ev) {
      const point = { x: ev.x, y: ev.y };
      if (this.addingEdge && this.edge) {
        this.graph.updateItem(this.edge, {
          target: point,
        });
      }
    },

    onEdgeClick(ev) {
      const currentEdge = ev.item;
      if (this.addingEdge && this.edge == currentEdge) {
        this.graph.removeItem(this.edge);
        this.edge = null;
        this.addingEdge = false;
      }
    },
  });
}
