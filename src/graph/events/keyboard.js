import deleteItems from '../utils/delete-items';
import { redo, undo } from '../utils/action-stack';

import navbar from '@/stores/navbar';
import settings from '@/stores/settings';

export const handleKeyup = (evt, graph) => {
  const { key } = evt;

  switch (key) {
    case 'v':
      navbar.mode = 'default';
      break;
    case 'e':
      navbar.mode = 'edge';
      break;
    case 'n':
      navbar.mode = 'node';
      break;
    case 'h':
      navbar.mode = 'pan';
      break;
    case 'd':
      navbar.mode = 'delete';
      break;
    case 'q':
      graph.clear();
      break;
    case 'y':
      settings.view = settings.view === 'simple' ? 'full' : 'simple';
      console.log(settings.view);
      break;
    case 'Delete':
      deleteItems(graph);
      break;
    default:
      break;
  }
};

export const handleKeydown = (evt, graph) => {
  const { key } = evt;

  switch (key) {
    case 'z':
      if (evt.ctrlKey) {
        undo(graph);
      }
      break;
    case 'Z':
      if (evt.ctrlKey && evt.shiftKey) {
        redo(graph);
      }
      break;
    default:
  }
};
