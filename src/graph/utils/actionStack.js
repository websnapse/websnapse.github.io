import { clone } from '@antv/util';

export function undo(graph) {
  let undoStack = graph.getUndoStack();
  // print every element of the undoStack which is a linked list
  let element = undoStack.pop();
  while (element) {
    console.log(element);
    element = undoStack.pop();
  }
  undoStack = graph.getUndoStack();

  if (!undoStack || undoStack.length === 0) {
    return;
  }

  const currentData = undoStack.pop();
  if (currentData) {
    const { action } = currentData;
    graph.pushStack(action, clone(currentData.data), 'redo');
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
            const item = graph.findById(model.id);
            if (model.visible) {
              graph.showItem(item, false);
            } else {
              graph.hideItem(item, false);
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
            const item = graph.findById(model.id);
            delete model.id;
            graph.updateItem(item, model, false);
            if (item.getType() === 'combo') graph.updateCombo(item);
          });
        });
        break;
      case 'changedata':
        graph.changeData(data, false);
        break;
      case 'delete': {
        Object.keys(data).forEach((key) => {
          const array = data[key];
          if (!array) return;
          array.forEach((model) => {
            const itemType = model.itemType;
            delete model.itemType;
            graph.addItem(itemType, model, false);
          });
        });
        break;
      }
      case 'add':
        Object.keys(data).forEach((key) => {
          const array = data[key];
          if (!array) return;
          array.forEach((model) => {
            graph.removeItem(model.id, false);
          });
        });
        break;
      case 'updateComboTree':
        Object.keys(data).forEach((key) => {
          const array = data[key];
          if (!array) return;
          array.forEach((model) => {
            graph.updateComboTree(model.id, model.parentId, false);
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
            graph.updateComboTree(model.id, model.parentId, false);
          });
        });
        graph.removeItem(createdCombo.id, false);
        break;
      case 'uncombo':
        const targetCombo = data.combos[data.combos.length - 1];
        const childrenIds = data.nodes
          .concat(data.combos)
          .map((child) => child.id)
          .filter((id) => id !== targetCombo.id);
        graph.createCombo(targetCombo, childrenIds, false);
        break;
      case 'layout':
        graph.updateLayout(data, undefined, undefined, false);
        break;
      default:
    }
    graph.refresh();
  }
}

export function redo(graph) {
  const redoStack = graph.getRedoStack();

  if (!redoStack || redoStack.length === 0) {
    return;
  }

  const currentData = redoStack.pop();
  if (currentData) {
    const { action } = currentData;
    let data = currentData.data.after;
    graph.pushStack(action, clone(currentData.data));
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
            const item = graph.findById(model.id);
            if (model.visible) {
              graph.showItem(item, false);
            } else {
              graph.hideItem(item, false);
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
            const item = graph.findById(model.id);
            delete model.id;
            graph.updateItem(item, model, false);
            if (item.getType() === 'combo') graph.updateCombo(item);
          });
        });
        break;
      case 'changedata':
        graph.changeData(data, false);
        break;
      case 'delete':
        if (data.edges) {
          data.edges.forEach((model) => {
            graph.removeItem(model.id, false);
          });
        }
        if (data.nodes) {
          data.nodes.forEach((model) => {
            graph.removeItem(model.id, false);
          });
        }
        if (data.combos) {
          data.combos.forEach((model) => {
            graph.removeItem(model.id, false);
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
            graph.addItem(itemType, model, false);
          });
        });
        break;
      }
      case 'updateComboTree':
        Object.keys(data).forEach((key) => {
          const array = data[key];
          if (!array) return;
          array.forEach((model) => {
            graph.updateComboTree(model.id, model.parentId, false);
          });
        });
        break;
      case 'createCombo':
        const createdCombo = data.combos[data.combos.length - 1];
        graph.createCombo(
          createdCombo,
          createdCombo.children.map((child) => child.id),
          false
        );
        break;
      case 'uncombo':
        const beforeCombos = currentData.data.before.combos;
        const targertCombo = beforeCombos[beforeCombos.length - 1];
        graph.uncombo(targertCombo.id, false);
        break;
      case 'layout':
        graph.updateLayout(data, undefined, undefined, false);
        break;
      default:
    }
  }
}
