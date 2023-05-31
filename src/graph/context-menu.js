import G6 from '@antv/g6';
import system from '@/stores/system';
import addNode from './utils/add-node';
import deleteItems from './utils/delete-items';
import graph_ref from '@/stores/graph';
import { exportSytem } from './utils/parse-system';
import { updateNeuron, updateSynapse } from '@/utils/dialog';

export default function initializeContextMenu(graph) {
  const contextMenu = new G6.Menu({
    getContent(evt) {
      let content;
      if (evt.target && evt.target.isCanvas && evt.target.isCanvas()) {
        content = [
          { img: '/node.svg', text: 'New Node' },
          { img: '/fit.svg', text: 'Fit View' },
          { img: '/layout.svg', text: 'Auto layout' },
          { img: '/save.svg', text: 'Save' },
          { img: '/delete.svg', text: 'Clear' },
        ];
      } else if (evt.item) {
        const itemType = evt.item.getType();
        switch (itemType) {
          case 'node':
            content = [
              { img: '/rule.svg', text: 'Edit node' },
              { img: '/focus.svg', text: 'Focus node' },
              { img: '/delete.svg', text: 'Delete' },
            ];
            break;
          case 'edge':
            content = [
              { img: '/weight.svg', text: 'Edit weight' },
              { img: '/delete.svg', text: 'Delete' },
            ];
            break;
          default:
            break;
        }
      }
      return `
  <ul>
    ${content
      .map(
        (item) =>
          `<li>
            <div class='context-menu-item'>
            <img src=${item.img} class="context-menu-icon pointer-events-none" />
            ${item.text}
            </div>
          </li>`
      )
      .join('')}
  </ul>`;
    },
    async handleMenuClick(target, item) {
      const command = target.innerText;
      const point = target.getBoundingClientRect();
      const model = item?.getModel();
      switch (command) {
        case 'New Node':
          await addNode(point, graph);
          break;
        case 'Fit View':
          graph.fitView();
          break;
        case 'Save':
          const a = document.createElement('a');
          const file = new Blob(
            [JSON.stringify(exportSytem(graph_ref.value))],
            {
              type: 'text/plain',
            }
          );
          a.href = URL.createObjectURL(file);
          a.download = 'system.json';
          a.click();
          break;
        case 'Clear':
          graph.clear();
          break;
        case 'Auto layout':
          graph.layout();
          graph.fitView();
          break;
        case 'Focus node':
          graph.focusItem(item);
          break;
        case 'Edit node':
          const updated_node = await updateNeuron(item);

          if (!updated_node.success) return;

          if (updated_node.type === 'regular') {
            model.id = updated_node.id;
            model.content = updated_node.content;
            model.rules = updated_node.rules;
          } else {
            model.id = updated_node.id;
            model.content = updated_node.content;
          }

          graph.updateItem(item, model, true);
          break;
        case 'Edit weight':
          const updated_synapse = await updateSynapse(item);
          model.label = updated_synapse.label;
          item.update(model);
          break;
        case 'Delete':
          deleteItems(graph);
          break;
      }
    },
    offsetX: 0,
    offsetY: 0,
    itemTypes: ['node', 'edge', 'canvas'],
  });
  return contextMenu;
}
