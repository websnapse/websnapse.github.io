import G6 from '@antv/g6';
import { neuron } from '../stores/neuron';

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
      console.log(target);
      const command = target.innerText;
      // get target position
      const point = target.getBoundingClientRect();
      point.x = point.x + point.width / 2;
      point.y = (point.y + point.height) / 2;

      const model = item?.getModel();
      // get mouse positions in the graph canvas
      switch (command) {
        case 'New Node':
          const last_node = graph.getNodes()[graph.getNodes().length - 1];
          const last_node_id = last_node.getModel().id;
          const orig_id = last_node_id.split('-')[0];
          // get the duplicate number of the last node
          const duplicate = parseInt(last_node_id.split('-')[1] ?? 1) + 1;
          graph.addItem('node', {
            x: point.x,
            y: point.y,
            id: `${orig_id}-${duplicate}`, // Generate a unique id
            nodeType: neuron.value.nodeType,
            content: neuron.value.content,
            rules: neuron.value.rules.split('\n'),
          });
          break;
        case 'Fit View':
          graph.fitView();
          break;
        case 'Save':
          const system_edges = graph.save().edges;
          const system_nodes = graph.save().nodes;
          const parsed_nodes = system_nodes.map((node) => {
            return {
              id: node.id,
              content: node.content,
              rules: node.rules,
              nodeType: node.nodeType,
              x: node.x,
              y: node.y,
            };
          });
          const parsed_edges = system_edges.map((edge) => {
            return {
              source: edge.source,
              target: edge.target,
              label: edge.label,
            };
          });

          const parsed_system = {
            nodes: parsed_nodes,
            edges: parsed_edges,
          };

          // download the json file
          const a = document.createElement('a');
          const file = new Blob([JSON.stringify(parsed_system)], {
            type: 'text/plain',
          });
          a.href = URL.createObjectURL(file);
          a.download = 'system.json';
          a.click();
          break;
        case 'Clear':
          graph.clear();
          break;
        case 'Auto layout':
          graph.layout();
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
          setTimeout(() => {
            graph.getNodes().forEach((node) => {
              if (node.hasState('selected')) {
                graph.removeItem(node);
              }
            });
            graph.removeItem(item);
          }, 100);
          break;
      }
    },
    offsetX: 16 + 10,
    offsetY: 0,
    itemTypes: ['node', 'edge', 'canvas'],
  });
  return contextMenu;
}
