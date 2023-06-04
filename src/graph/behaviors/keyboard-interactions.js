import G6 from '@antv/g6';
import duplicateItems from '../utils/duplicate-items';
import { redo, undo } from '../utils/action-stack';
import navbar from '@/stores/navbar';
import deleteItems from '../utils/delete-items';
import settings from '@/stores/settings';
import { importSystem, saveSystem } from '../utils/parse-system';
import { useToast } from 'vue-toast-notification';

const $toast = useToast();

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
          this.graph.changeData(
            {
              nodes: [],
              edges: [],
            },
            true
          );
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
        case 'o':
          if (evt.ctrlKey) {
            evt.preventDefault();
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.id = 'fileInput';
            fileInput.style.display = 'none';
            fileInput.onchange = () => {
              const file = fileInput.files[0];
              const reader = new FileReader();
              reader.onload = (e) => {
                const data = JSON.parse(e.target.result);
                this.graph.destroyLayout();
                this.graph.clear();
                this.graph.changeData(importSystem(data), true);
                this.graph.fitCenter();
                $toast.success('System imported successfully', {
                  position: 'bottom-left',
                });
              };
              reader.readAsText(file);
            };
            document.body.appendChild(fileInput);
            document.getElementById('fileInput').click();
            document.body.removeChild(fileInput);
          }
          break;
        case 's':
          if (evt.ctrlKey) {
            evt.preventDefault();
            saveSystem(this.graph);
          }
          break;
        default:
      }
    },
  });
}
