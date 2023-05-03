import G6 from '@antv/g6';

const contextMenu = new G6.Menu({
  getContent(evt) {
    let header;
    if (evt.target && evt.target.isCanvas && evt.target.isCanvas()) {
      header = 'Canvas ContextMenu';
    } else if (evt.item) {
      const itemType = evt.item.getType();
      header = `${itemType.toUpperCase()} ContextMenu`;
    }
    return `
    <h3>${header}</h3>
    <ul>
      <li title='1'>li 1</li>
      <li title='2'>li 2</li>
      <li>li 3</li>
      <li>li 4</li>
      <li>li 5</li>
    </ul>`;
  },
  handleMenuClick: (target, item) => {
    console.log(target, item);
  },
  offsetX: 16 + 10,
  offsetY: 0,
  itemTypes: ['node', 'edge', 'canvas'],
});

const grid = new G6.Grid();

const minimap = new G6.Minimap();

export const createGraph = (container, width, height, updateEdges) => {
  const graph = new G6.Graph({
    container: container, // Specify mount container
    plugins: [grid, minimap], // Configure Grid and Minimap to the graph
    width: width,
    height: height,
    fitCenter: true,

    defaultNode: {
      type: 'neuron',
      labelCfg: {
        style: {
          fill: '#000',
          fontSize: 20,
          fontFamily: 'Cambria Math',
        },
        position: 'top',
      },

      // anchorPoints: [
      //   [0, 0.5],
      //   [0.5, 0],
      //   [1, 0.5],
      //   [0.5, 1],
      // ],
    },

    defaultEdge: {
      type: 'circle-running',
      style: {
        stroke: '#000',
        lineWidth: 2,
      },
    },

    // layout: {
    //   type: 'fruchterman',
    //   gravity: 5,
    //   speed: 5,
    //   // for rendering after each iteration
    //   tick: () => {
    //     graph.refreshPositions();
    //   },
    // },
    animate: true,

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

  graph.on('aftercreateedge', (e) => {
    // update the curveOffset for parallel edges
    const edges = graph.save().edges;
    G6.Util.processParallelEdges(edges);
    graph.getEdges().forEach((edge, i) => {
      graph.updateItem(edge, {
        curveOffset: edges[i].curveOffset,
        curvePosition: edges[i].curvePosition,
        labelCfg: {
          autoRotate: edges[i].curvePosition > 0.5,
          refY: 20,
        },
      });
    });
  });

  graph.on('click', (ev) => {
    const shape = ev.target;
    const item = ev.item;
    if (item) {
      const type = item.getType();
    }
  });

  graph.on('node:mouseenter', (evt) => {
    const { item } = evt;
    item.setState('hover', true);
    item.setState('animate', true);
  });

  graph.on('node:mouseleave', (evt) => {
    const { item } = evt;
    item.clearStates('hover');
    item.clearStates('animate');
  });

  graph.on('edge:mouseenter', (evt) => {
    const { item } = evt;
    item.setState('hover', true);
    item.setState('animate', true);
  });

  graph.on('edge:mouseleave', (evt) => {
    const { item } = evt;
    item.clearStates('hover');
    item.setState('animate', false);
  });

  graph.on('edge:click', (evt) => {
    const { item } = evt;
    item.setState('selected', true);
  });

  graph.on('node:click', (evt) => {
    const { item } = evt;
    item.setState('selected', true);
  });

  graph.on('canvas:click', (evt) => {
    graph.getNodes().forEach((node) => {
      node.setState('selected', false);
    });
    graph.getEdges().forEach((edge) => {
      edge.setState('selected', false);
    });
  });

  graph.on('node:mouseleave', function (evt) {
    const node = evt.item;
    const model = node.getModel();
    graph.updateItem(node, {
      label: model.oriLabel,
      labelCfg: {
        style: {
          fill: '#555',
        },
      },
    });
  });

  graph.on('content:dblclick', function (evt) {
    console.log('edit content');
  });

  graph.on('rules:dblclick', function (evt) {
    console.log('edit rule');
  });

  return graph;
};
