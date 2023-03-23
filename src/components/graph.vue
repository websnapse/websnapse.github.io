<template>
    <div id="mountNode">
    </div>
</template>

<script setup>
import G6 from '@antv/g6';
import { onMounted } from 'vue';

const data = {
    // The array of nodes
    nodes: [
        {
            id: 'node1', // String, unique and required
            x: 100, // Number, the x coordinate
            y: 200, // Number, the y coordinate
        },
        {
            id: 'node2', // String, unique and required
            x: 300, // Number, the x coordinate
            y: 200, // Number, the y coordinate
        },
    ],
    // The array of edges
    edges: [
        {
            source: 'node1', // String, required, the id of the source node
            target: 'node2', // String, required, the id of the target node
        },
    ],
};


const g6 = (data) => {
    // For graph instantiation, at least the mounting container, width and height need to be set for the graph
    const graph = new G6.Graph({
        container: 'mountNode', // Specify mount container
        width: 800, // Width of graph
        height: 500, // Height of graph
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
        }
    });
    // Data loading and rendering of Graphs
    graph.data(data);
    graph.render();
}

onMounted(() => {
    g6(data);
})

</script>

