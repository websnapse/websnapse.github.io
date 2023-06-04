import G6 from '@antv/g6';
import duplicateItems from '../utils/duplicate-items';
import { redo, undo } from '../utils/action-stack';
import navbar from '@/stores/navbar';
import deleteItems from '../utils/delete-items';

export default function keyboardInteractions() {
  G6.registerBehavior('keyboard-interactions', {
    getEvents() {
      return {
        keyup: 'onKeyUp',
        keydown: 'onKeyDown',
      };
    },
    onKeyUp(evt) {
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
          if (evt.ctrlKey) break;
          navbar.mode = 'delete';
          break;
        case 'q':
          this.graph.clear();
          break;
        case 'y':
          settings.view = settings.view === 'simple' ? 'full' : 'simple';
          break;
        case 'Delete':
          deleteItems(this.graph);
          break;
        default:
          break;
      }
    },
    onKeyDown(evt) {
      const { key } = evt;

      switch (key) {
        case 'z':
          if (evt.ctrlKey) {
            undo(this.graph);
          }
          break;
        case 'Z':
          if (evt.ctrlKey && evt.shiftKey) {
            redo(this.graph);
          }
          break;
        case 'd':
          if (evt.ctrlKey) {
            evt.preventDefault();
            duplicateItems(this.graph);
          }
        default:
      }
    },
  });
}
