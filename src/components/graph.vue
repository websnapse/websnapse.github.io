<template>
    <div id="mountNode" class="flex justify-center items-start">
    </div>
</template>

<script setup>
import G6 from '@antv/g6';
import { onMounted, ref, watch } from 'vue';
import graphData from '../data.json';

const props = defineProps(['graph_mode', 'clear_all']);

const data = graphData;

const vh = window.innerHeight - 40;
const vw = window.innerWidth;

const neurons = ref(0);


G6.registerNode(
    'dom-node',
    {
        draw: (cfg, group) => {
            return group.addShape('dom', {
                attrs: {
                    width: cfg.size[0],
                    height: cfg.size[1],
                    // DOM's html
                    html: `
        <div style="background-color: #fff; border: 2px solid #5B8FF9; border-radius: 5px; width: ${cfg.size[0] - 5
                        }px; height: ${cfg.size[1] - 5}px; display: flex;">
          <div style="height: 100%; width: 33%; background-color: #CDDDFD">
            <img alt="img" style="line-height: 100%; padding-top: 6px; padding-left: 8px;" src="https://gw.alipayobjects.com/mdn/rms_f8c6a0/afts/img/A*Q_FQT6nwEC8AAAAAAAAAAABkARQnAQ" width="20" height="20" />  
          </div>
          <span style="margin:auto; padding:auto; color: #5B8FF9">${cfg.label}</span>
        </div>
          `,
                },
                draggable: true,
            });
        },
    },
    'single-node',
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
            label: `n${node_label}`
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

const g6 = (data) => {
    // For graph instantiation, at least the mounting container, width and height need to be set for the graph
    const graph = new G6.Graph({
        container: 'mountNode', // Specify mount container
        width: vw,
        height: vh,
        fitCenter: true,
        renderer: 'svg',

        // Default node set
        defaultNode: {
            type: "rect",
            size: [150, 100],
            color: "#000",
            style: {
                fill: "#fff",
                lineWidth: 1,
                radius: 10,
            },
            labelCfg: {
                style: {
                    fill: "#000",
                    fontSize: 20
                },
                position: 'top'
            },

            anchorPoints: [
                [0, 0.5],
                [0.5, 0],
                [1, 0.5],
                [0.5, 1]
            ],

        },

        // Default edge set
        defaultEdge: {
            type: 'quadratic',
            style: {
                stroke: "#000",
                lineWidth: 1,
                // fill: "#000",
                startArrow: false,
                endArrow:
                {
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
                // 'drag-node',
                'tooltip',
                {
                    type: 'create-edge',
                    trigger: 'drag',
                }
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

            remove: ['click-select', 'remove-node', 'tooltip']
        },
    });

    graph.on('aftercreateedge', (e) => {
        const edges = graph.save().edges;
        G6.Util.processParallelEdges(edges);
        graph.getEdges().forEach((edge, i) => {
            graph.updateItem(edge, {
                curveOffset: edges[i].curveOffset,
                curvePosition: edges[i].curvePosition,
            });
        });
    });

    graph.on('click', (ev) => {
        const shape = ev.target;
        const item = ev.item;
        // console.log(graph.getNodes());
        if (item) {
            const type = item.getType();
            // console.log(type);

        }

    });
    // Data loading and rendering of Graphs
    graph.data(data);
    graph.render();

    watch(() => props.graph_mode, (val) => {
        graph.setMode(val);
    })

    watch(() => props.clear_all, () => {
        if (props.clear_all) graph.clear();
    })
}


onMounted(() => {
    g6(data);

})



</script>

