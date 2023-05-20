import graph from '../stores/graph';
import { navbar } from '../stores/navbar';
import { undo, redo } from '../graph/utils/actionStack';

export const handleKeyup = (evt) => {
  const { key } = evt;

  if (key === 'Delete') {
    graph.value.getNodes().forEach((node) => {
      if (node.hasState('selected')) {
        graph.value.removeItem(node);
      }
    });
    graph.value.getEdges().forEach((edge) => {
      if (edge.hasState('selected')) {
        graph.value.removeItem(edge);
      }
    });
  }

  if (key === 'v') {
    navbar.value.mode = 'default';
  }
  if (key === 'h') {
    navbar.value.mode = 'default';
    graph.value.get('canvas').setCursor('default');
  }
  if (key === 'e') {
    navbar.value.mode = 'edge';
  }
  if (key === 'n') {
    navbar.value.mode = 'node';
  }
  if (key === 'd') {
    navbar.value.mode = 'delete';
  }
  if (key === 'Control') {
    navbar.value.mode = 'default';
  }
};

export const handleKeydown = (evt) => {
  const { key } = evt;
  if (key === 'h') {
    navbar.value.mode = 'pan';
    graph.value.get('canvas').setCursor('grab');
  }

  if (key === 'Control') {
    navbar.value.mode = 'edge';
  }

  if (evt.ctrlKey && evt.key === 'z') {
    undo(graph.value);
  }

  if (evt.ctrlKey && evt.shiftKey && evt.key === 'Z') {
    redo(graph.value);
  }
};
