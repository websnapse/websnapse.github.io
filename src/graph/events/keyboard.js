import deleteItems from '../utils/delete-items';
import { redo, undo } from '../utils/actionStack';

import graph from '@/stores/graph';
import { navbar } from '@/stores/navbar';

export const handleKeyup = (evt) => {
  const { key } = evt;

  switch (key) {
    case 'h':
      navbar.mode = 'default';
      break;
    case 'v':
      navbar.mode = 'default';
      break;
    case 'e':
      navbar.mode = 'edge';
      break;
    case 'n':
      navbar.mode = 'node';
      break;
    case 'd':
      navbar.mode = 'delete';
      break;
    case 'Delete':
      deleteItems(graph.value);
      break;
    case 'Control':
      navbar.mode = 'default';
      break;
    default:
      break;
  }
};

export const handleKeydown = (evt) => {
  const { key } = evt;

  switch (key) {
    case 'h':
      navbar.mode = 'pan';
      break;
    case 'z':
      if (evt.ctrlKey) {
        undo(graph.value);
      }
      break;
    case 'Z':
      if (evt.ctrlKey && evt.shiftKey) {
        redo(graph.value);
      }
      break;
    default:
  }
};
