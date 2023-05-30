import { clone } from '@antv/util';
import graph from '@/stores/graph';

export function undo() {
  const g = graph.value;
  let undoStack = g.getUndoStack();

  if (!undoStack || undoStack.length === 0) {
    return;
  }

  const currentData = undoStack.pop();
  if (currentData) {
    const { action } = currentData;
    g.pushStack(action, clone(currentData.data), 'redo');
    let data = currentData.data.before;

    if (action === 'add') {
      data = currentData.data.after;
    }

    switch (action) {
      case 'visible': {
        Object.keys(data).forEach((key) => {
          const array = data[key];
          if (!array) return;
          array.forEach((model) => {
            const item = g.findById(model.id);
            if (model.visible) {
              g.showItem(item, false);
            } else {
              g.hideItem(item, false);
            }
          });
        });
        break;
      }
      case 'render':
      case 'update':
        Object.keys(data).forEach((key) => {
          const array = data[key];
          if (!array) return;
          array.forEach((model) => {
            const item = g.findById(model.id);
            delete model.id;
            g.updateItem(item, model, false);
            if (item.getType() === 'combo') g.updateCombo(item);
          });
        });
        break;
      case 'changedata':
        g.changeData(data, false);
        break;
      case 'delete': {
        Object.keys(data).forEach((key) => {
          const array = data[key];
          if (!array) return;
          array.forEach((model) => {
            const itemType = model.itemType;
            delete model.itemType;
            g.addItem(itemType, model, false);
          });
        });
        break;
      }
      case 'add':
        Object.keys(data).forEach((key) => {
          const array = data[key];
          if (!array) return;
          array.forEach((model) => {
            g.removeItem(model.id, false);
          });
        });
        break;
      case 'updateComboTree':
        Object.keys(data).forEach((key) => {
          const array = data[key];
          if (!array) return;
          array.forEach((model) => {
            g.updateComboTree(model.id, model.parentId, false);
          });
        });
        break;
      case 'createCombo':
        const afterCombos = currentData.data.after.combos;
        const createdCombo = afterCombos[afterCombos.length - 1];
        Object.keys(data).forEach((key) => {
          const array = data[key];
          if (!array) return;
          array.forEach((model) => {
            g.updateComboTree(model.id, model.parentId, false);
          });
        });
        g.removeItem(createdCombo.id, false);
        break;
      case 'uncombo':
        const targetCombo = data.combos[data.combos.length - 1];
        const childrenIds = data.nodes
          .concat(data.combos)
          .map((child) => child.id)
          .filter((id) => id !== targetCombo.id);
        g.createCombo(targetCombo, childrenIds, false);
        break;
      case 'layout':
        g.updateLayout(data, undefined, undefined, false);
        break;
      default:
    }
    g.refresh();
  }
}

export function redo() {
  const g = graph.value;
  const redoStack = g.getRedoStack();

  if (!redoStack || redoStack.length === 0) {
    return;
  }

  const currentData = redoStack.pop();
  if (currentData) {
    const { action } = currentData;
    let data = currentData.data.after;
    g.pushStack(action, clone(currentData.data));
    if (action === 'delete') {
      data = currentData.data.before;
    }

    if (!data) return;

    switch (action) {
      case 'visible': {
        Object.keys(data).forEach((key) => {
          const array = data[key];
          if (!array) return;
          array.forEach((model) => {
            const item = g.findById(model.id);
            if (model.visible) {
              g.showItem(item, false);
            } else {
              g.hideItem(item, false);
            }
          });
        });
        break;
      }
      case 'render':
      case 'update':
        Object.keys(data).forEach((key) => {
          const array = data[key];
          if (!array) return;
          array.forEach((model) => {
            const item = g.findById(model.id);
            delete model.id;
            g.updateItem(item, model, false);
            if (item.getType() === 'combo') g.updateCombo(item);
          });
        });
        break;
      case 'changedata':
        g.changeData(data, false);
        break;
      case 'delete':
        if (data.edges) {
          data.edges.forEach((model) => {
            g.removeItem(model.id, false);
          });
        }
        if (data.nodes) {
          data.nodes.forEach((model) => {
            g.removeItem(model.id, false);
          });
        }
        if (data.combos) {
          data.combos.forEach((model) => {
            g.removeItem(model.id, false);
          });
        }
        break;
      case 'add': {
        Object.keys(data).forEach((key) => {
          const array = data[key];
          if (!array) return;
          array.forEach((model) => {
            const itemType = model.itemType;
            delete model.itemType;
            g.addItem(itemType, model, false);
          });
        });
        break;
      }
      case 'updateComboTree':
        Object.keys(data).forEach((key) => {
          const array = data[key];
          if (!array) return;
          array.forEach((model) => {
            g.updateComboTree(model.id, model.parentId, false);
          });
        });
        break;
      case 'createCombo':
        const createdCombo = data.combos[data.combos.length - 1];
        g.createCombo(
          createdCombo,
          createdCombo.children.map((child) => child.id),
          false
        );
        break;
      case 'uncombo':
        const beforeCombos = currentData.data.before.combos;
        const targertCombo = beforeCombos[beforeCombos.length - 1];
        g.uncombo(targertCombo.id, false);
        break;
      case 'layout':
        g.updateLayout(data, undefined, undefined, false);
        break;
      default:
    }
  }
}
