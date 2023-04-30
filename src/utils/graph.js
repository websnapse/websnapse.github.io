import G6 from '@antv/g6';
import { convertMath, getMathWidth } from './mathjax';

export const initializeGraph = (neurons) => {
  G6.registerNode(
    'neuron',
    {
      drawShape: function drawShape(cfg, group) {
        const color = '#0d0e0e';
        const r = 20;
        const p = 20;
        const h = 20;

        const render = [cfg.title, cfg.content, ...cfg.rules].map((key) => {
          return getMathWidth(key);
        });
        const mw = Math.max(...render.map((item) => item.width));
        const mh = render.reduce((acc, item) => acc + item.height, 0);

        console.log(render);

        const shape = group.addShape('rect', {
          attrs: {
            x: 0,
            y: 0,
            width: 2 * p + mw,
            height: 2 * p + mh,
            stroke: color,
            radius: r,
            fill: '#ffffff',
          },
          // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
          name: 'main-box',
        });

        // title text
        group.addShape('dom', {
          attrs: {
            textBaseline: 'top',
            y: -25,
            x: -25,
            width: mw,
            height: render[0].height,
            html: `
            <div style="display: flex; justify-content: start;">
              ${render[0].dom}
            </div>
            `,
          },
          // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
          name: 'title',
        });

        group.addShape('dom', {
          attrs: {
            y: p,
            x: 0,
            width: mw + 2 * p,
            height: render[1].height,
            html: `
            <div style="display: flex; justify-content: center;">
              ${render[1].dom}
            <div>
            `,
          },
          // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
          name: 'title',
        });

        // The content list
        cfg.rules.forEach((item, index) => {
          // name text
          group.addShape('dom', {
            attrs: {
              width: mw + 2 * p,
              height: render[2 + index].height,
              y:
                p +
                render
                  .slice(0, 1 + index + 1)
                  .reduce((acc, item) => acc + item.height, 0),
              x: 0,
              html: `
              <div style="display: flex; justify-content: center;">
                ${render[2 + index].dom}
              <div>
              `,
            },
            // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
            name: `index-title-${index}`,
          });
        });

        group.addShape('circle', {
          attrs: {
            x: mw / 2 + p,
            y: mh + 2 * p,
            r: r / 2,
            fill: '#000000',
            cursor: 'grab',
          },
          name: `circle`,
          draggable: true,
        });
        return shape;
      },
    },
    'single-node'
  );

  G6.registerBehavior('click-add-node', {
    // Bind the events and response functions for this custom Behavior
    getEvents() {
      return {
        'canvas:click': 'onClick', // The event to be listned is canvas:click. The response function is onClick
      };
    },
    // The click event
    onClick(ev) {
      neurons.value += 1;
      const node_label = neurons.value;

      const graph = this.graph;
      // Add a new node on the canvas
      const node = graph.addItem('node', {
        x: ev.x,
        y: ev.y,
        id: G6.Util.uniqueId(), // Generate a unique id
        label: `n${node_label}`,
      });
    },
  });

  // Register the custom Behavior of adding a edge by clicking
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

      // console.log(`model: ${model.id}`);
      // console.log(`point: ${point}`);
      if (this.addingEdge && this.edge) {
        graph.updateItem(this.edge, {
          target: model.id,
        });

        this.edge = null;
        this.addingEdge = false;
      } else {
        // Add a new edge to the graph with the currently clicked node's position as the end point
        this.edge = graph.addItem('edge', {
          source: model.id,
          target: point,
        });
        this.addingEdge = true;
      }
    },
    // The response function for mousemove defined in getEvents
    onMousemove(ev) {
      // The current position of the mouse
      const point = { x: ev.x, y: ev.y };
      if (this.addingEdge && this.edge) {
        // Update the end point of the edge to be the current position of the mouse
        this.graph.updateItem(this.edge, {
          target: point,
        });
      }
    },
    // The response function for 'edge:click' defined in getEvents
    onEdgeClick(ev) {
      const currentEdge = ev.item;
      // The click event while dragging
      if (this.addingEdge && this.edge == currentEdge) {
        graph.removeItem(this.edge);
        this.edge = null;
        this.addingEdge = false;
      }
    },
  });

  G6.registerBehavior('remove-node', {
    getEvents() {
      return {
        'node:click': 'onClick',
      };
    },
    onClick(ev) {
      const graph = this.graph;
      // const selected = graph.findAllByState('node', 'selected');
      const node = ev.item;
      // console.log(selected)
      // const $node = selected[0].getContainer().get('item');
      const model = node.getModel();
      // console.log(node);
      // console.log($node);

      // const edges = node.getEdges();
      // edges.forEach((edge) => {
      //     edge.destroy();
      // });
      // graph.clearItemStates(node);
      setTimeout(() => {
        graph.remove(node);
      }, 100);

      // graph.refresh();
    },
  });
};

export const createGraph = (container, width, height) => {
  return new G6.Graph({
    container: container, // Specify mount container
    width: width,
    height: height,
    fitCenter: true,
    renderer: 'svg',

    // Default node set
    defaultNode: {
      type: 'neuron',
      size: [150, 100],
      color: '#000',
      style: {
        fill: '#fff',
        lineWidth: 1,
        radius: 10,
      },
      labelCfg: {
        style: {
          fill: '#000',
          fontSize: 20,
        },
        position: 'top',
      },

      anchorPoints: [
        [0, 0.5],
        [0.5, 0],
        [1, 0.5],
        [0.5, 1],
      ],
    },

    // Default edge set
    defaultEdge: {
      type: 'quadratic',
      style: {
        stroke: '#000',
        lineWidth: 1,
        // fill: "#000",
        startArrow: false,
        endArrow: {
          path: G6.Arrow.triangle(5, -5, 0),
          lineWidth: 1,
        },

        // lineDash: 2
      },
    },

    nodeStateStyles: {
      // The node style when the state 'hover' is true
      hover: {
        fill: 'lightsteelblue',
      },
      // The node style when the state 'click' is true
      click: {
        stroke: '#000',
        lineWidth: 3,
      },
    },
    // The edge styles in different states
    edgeStateStyles: {
      // The edge style when the state 'click' is true
      click: {
        stroke: 'steelblue',
      },
    },

    modes: {
      default: [
        // 'click-select',
        'drag-canvas',
        'zoom-canvas',
        'drag-node',
        // 'tooltip',
        // {
        //   type: 'create-edge',
        //   trigger: 'drag',
        // },
      ],

      add: [
        'click-select',
        'drag-canvas',
        'zoom-canvas',
        'drag-node',
        'click-add-node',
        'click-add-edge',
        'tooltip',
      ],

      remove: ['click-select', 'remove-node', 'tooltip'],
    },
  });
};
