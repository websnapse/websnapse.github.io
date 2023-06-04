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

  const minimap = new G6.Minimap({
    size: [200, 150],
    className: 'minimap',
    type: 'delegate',
    padding: 100,
    delegateStyle: {
      fill: style.primary,
      stroke: settings.dark ? style.light : style.dark,
      lineWidth: 2,
    },
  });

  console.log(minimap);

  const graph = new G6.Graph({
    container: container,
    plugins: [grid, minimap],
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
        'keyboard-interactions',
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
          sensitivity: 1.5,
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
        'keyboard-interactions',
      ],

      edge: ['keyboard-interactions', 'drag-add-edge', 'zoom-canvas'],

      pan: ['keyboard-interactions', 'drag-canvas', 'zoom-canvas'],

      delete: [
        'click-select',
        'remove-item',
        'node-interactions',
        'edge-interactions',
        'keyboard-interactions',
      ],

      disabled: ['keyboard-interactions', 'drag-canvas', 'zoom-canvas'],
    },
  });

  const contextMenu = initializeContextMenu(graph);

  graph.addPlugin(contextMenu);
  interact(graph);

  return graph;
}
