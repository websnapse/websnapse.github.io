import G6 from '@antv/g6';
import system from '@/stores/system';
import addNode from './utils/add-node';
import deleteItems from './utils/delete-items';

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
              { img: '/content.svg', text: 'Edit content' },
              { img: '/rule.svg', text: 'Edit rules' },
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
    handleMenuClick: (target, item) => {
      const command = target.innerText;
      const point = target.getBoundingClientRect();
      // point.x = (point.x + point.width) / 2;
      // point.y = (point.y + point.height) / 2;
      console.log(item);

      const model = item?.getModel();
      switch (command) {
        case 'New Node':
          addNode(point, graph);
          break;
        case 'Fit View':
          graph.fitView();
          break;
        case 'Save':
          console.log(system.data);
          // const a = document.createElement('a');
          // const file = new Blob([JSON.stringify(system.data)], {
          //   type: 'text/plain',
          // });
          // a.href = URL.createObjectURL(file);
          // a.download = 'system.json';
          // a.click();
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
        case 'Edit content':
          // get item config
          const content = model.content.split('^');
          model.content =
            content[0] + '^{' + String(Number(content[1] ?? 1) + 1) + '}';
          item.update(model);
          item.refresh();
          break;
        case 'Edit rules':
          // get item config
          model.rules = ['a \\to a;0'];
          item.update(model);
          item.refresh();
          break;
        case 'Edit weight':
          // get item config
          async function update() {
            const updated = await updateEdge(item);
            model.label = updated.weight;
            item.update(model);
          }
          update();
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
