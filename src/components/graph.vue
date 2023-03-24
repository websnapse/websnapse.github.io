<template>
    <div id="mountNode" class="flex justify-center items-start">
    </div>
</template>

<script setup>
import G6 from '@antv/g6';
import { onMounted } from 'vue';
import graphData from '../data.json';

const data = graphData;

const vh = window.innerHeight - 40;
const vw = window.innerWidth;

const g6 = (data) => {
    // For graph instantiation, at least the mounting container, width and height need to be set for the graph
    const graph = new G6.Graph({
        container: 'mountNode', // Specify mount container
        width: vw,
        height: vh,
        fitCenter: true,
        // Default node set
        defaultNode: {
            shape: "circle",
            size: [100],
            color: "#5B8FF9",
            style: {
                fill: "#9EC9FF",
                lineWidth: 3
            },
            labelCfg: {
                style: {
                    fill: "#fff",
                    fontSize: 20
                }
            }
        },
        // Default edge set
        defaultEdge: {
            style: {
                stroke: "#e2e2e2"
            }
        },

        modes: {
            default: ['click-select', 'drag-canvas', 'zoom-canvas', 'drag-node', 'edge-tooltip', 'tooltip'],
        },
    });
    // Data loading and rendering of Graphs
    graph.data(data);
    graph.render();
}

onMounted(() => {
    g6(data);
})

</script>

