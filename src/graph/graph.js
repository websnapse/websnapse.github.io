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
      nodeStrength: 10,
      edgeStrength: 1,
      collideStrength: 0.8,
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
          type: 'brush-select',
          trigger: 'shift',
          includeEdges: true,
          brushStyle: {
            lineWidth: 1,
            stroke: '#1890ff',
            fill: '#1890ff',
            fillOpacity: 0.2,
            opacity: 0.3,
            cursor: 'crosshair',
          },
        },
        {
          type: 'shortcuts-call',
          // subject key
          trigger: 'ctrl',
          // vice key
          combinedKey: 'c',
          // move the graph to 10,10
          functionName: 'fitCenter',
        },
        {
          type: 'zoom-canvas',
          enableOptimize: true,
          optimizeZoom: 0.2,
        },
        {
          type: 'drag-canvas',
          // enableOptimize: true,
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
