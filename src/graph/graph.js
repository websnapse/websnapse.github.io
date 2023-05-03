import G6 from '@antv/g6';
import interact from './interactions';

export default function createGraph(container, width, height, contextMenu) {
  const grid = new G6.Grid();

  const graph = new G6.Graph({
    container: container, // Specify mount container
    plugins: [grid, contextMenu], // Configure Grid and Minimap to the graph
    width: width,
    height: height,
    fitCenter: true,
    linkCenter: false,
    pixelRatio: 2,
    layout: {
      type: 'force',
      linkDistance: 400,
      preventOverlap: true,
    },

    defaultNode: {
      type: 'neuron',

      // anchorPoints: [
      //   [0, 0.5],
      //   [0.5, 0],
      //   [1, 0.5],
      //   [0.5, 1],
      // ],
    },

    defaultEdge: {
      type: 'circle-running',
    },

    animate: true,
    animateCfg: {
      duration: 100,
      easing: 'easeCubic',
    },

    modes: {
      default: [
        'click-select',
        {
          type: 'zoom-canvas',
          enableOptimize: true,
          optimizeZoom: 0.2,
        },
        {
          type: 'drag-canvas',
          enableOptimize: true,
          trigger: 'a',
        },
        'brush-select',
        'drag-node',
        // 'tooltip',
        'click-add-node',
        'click-add-edge',
        // {
        //   type: 'create-edge',
        //   trigger: 'click',
        // },
      ],

      add: [
        'click-select',
        // 'drag-canvas',
        'zoom-canvas',
        'drag-node',
        'click-add-node',
        'tooltip',
      ],

      remove: ['click-select', 'remove-node', 'tooltip'],
    },
  });

  interact(graph);

  return graph;
}
