import graph from '../stores/graph';
import { navbar } from '../stores/navbar';
import { undo, redo } from '../graph/utils/action-stack';

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
    navbar.mode = 'default';
  }
  if (key === 'h') {
    navbar.mode = 'default';
    graph.value.get('canvas').setCursor('default');
  }
  if (key === 'e') {
    navbar.mode = 'edge';
  }
  if (key === 'n') {
    navbar.mode = 'node';
  }
  if (key === 'd') {
    navbar.mode = 'delete';
  }
  if (key === 'Control') {
    navbar.mode = 'default';
  }
};

export const handleKeydown = (evt) => {
  const { key } = evt;
  if (key === 'h') {
    navbar.mode = 'pan';
    graph.value.get('canvas').setCursor('grab');
  }

  if (key === 'Control') {
    navbar.mode = 'edge';
  }

  if (evt.ctrlKey && evt.key === 'z') {
    undo(graph.value);
  }

  if (evt.ctrlKey && evt.shiftKey && evt.key === 'Z') {
    redo(graph.value);
  }
};
