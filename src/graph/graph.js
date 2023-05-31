import G6 from '@antv/g6';
import interact from './interactions';
import initializeContextMenu from './context-menu';
import initializeRegisters from './registers';
import style from '@/stores/styles';
import settings from '@/stores/settings';

export default function createGraph(container, width, height) {
  initializeRegisters();

  const grid = new G6.Grid({
    img: settings.gridImage,
  });

  const graph = new G6.Graph({
    minZoom: 0.5,
    container: container,
    plugins: [grid],
    width: width,
    height: height,
    fitViewPadding: [120, 0, 180, 0],
    linkCenter: false,
    pixelRatio: 0.5,
    optimizeThreshold: 5,
    layout: {
      type: 'force',
      linkDistance: (d) => {
        return Math.max(400 / parseInt(d.label), 200);
      },
      nodeStrength: 10,
      edgeStrength: (d) => {
        return Math.min(parseInt(d.label), 10);
      },
      collideStrength: 1,
      damping: 0.01,
      nodeSpacing: 50,
      minMovement: 0.01,
      maxIteration: 100,
      preventOverlap: true,
    },
    directed: true,

    enabledStack: true,

    maxStep: 20,

    defaultNode: {
      type: 'neuron',
    },

    defaultEdge: {
      type: 'synapse',
      labelCfg: {
        autorotate: true,
        style: {
          fill: settings.dark ? style.darkContent : style.content,
          fontSize: 20,
          background: {
            fill: settings.dark ? style.dark : style.light,
            padding: [5, 5, 5, 5],
            radius: 5,
          },
        },
      },
    },

    modes: {
      default: [
        'click-select',
        {
          type: 'brush-select',
          trigger: 'drag',
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
        'zoom-canvas',
        'node-interactions',
        'edge-interactions',
        'drag-node',
      ],

      node: [
        'click-add-node',
        'drag-node',
        'node-interactions',
        'edge-interactions',
      ],

      edge: ['drag-add-edge'],

      addEdge: ['drag-add-edge'],

      pan: ['drag-canvas', 'zoom-canvas'],

      delete: [
        'click-select',
        'remove-item',
        'node-interactions',
        'edge-interactions',
      ],
    },
  });

  const contextMenu = initializeContextMenu(graph);

  graph.addPlugin(contextMenu);
  interact(graph);

  return graph;
}
