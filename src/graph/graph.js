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
    container: container,
    plugins: [grid],
    width: width,
    height: height,
    linkCenter: false,
    pixelRatio: 1.5,

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
        {
          type: 'zoom-canvas',
          enableOptimize: true,
          optimizeZoom: 0.5,
        },
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

      edge: ['drag-add-edge', 'zoom-canvas'],

      addEdge: ['drag-add-edge', 'zoom-canvas'],

      pan: ['drag-canvas', 'zoom-canvas'],

      delete: [
        'click-select',
        'remove-item',
        'node-interactions',
        'edge-interactions',
      ],

      disabled: ['drag-canvas', 'zoom-canvas'],
    },
  });

  const contextMenu = initializeContextMenu(graph);

  interact(graph);

  return graph;
}
