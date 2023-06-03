import { clone } from '@antv/util';

export function undo(graph) {
  let undoStack = graph.getUndoStack();

  if (!undoStack || undoStack.length === 0) {
    return;
  }

  const currentData = undoStack.pop();
  if (currentData) {
    const { action } = currentData;
    graph.pushStack(action, clone(currentData.data), 'redo');
    let data = currentData.data.before;

    if (['add', 'addItems'].includes(action)) {
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
          });
        });
        break;
      case 'changedata':
        console.log('changedata', clone(currentData.data));
        graph.read(data, false);
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
      case 'addItems':
        Object.keys(data).forEach((key) => {
          const array = data[key];
          if (!array) return;
          array.forEach((model) => {
            graph.removeItem(model.id, false);
          });
        });
        break;
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

  console.log('redoStack', redoStack.length);

  if (!redoStack || redoStack.length === 0) {
    return;
  }

  const currentData = redoStack.pop();
  console.log('redo', currentData);
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
        graph.read(data, false);
        break;
      case 'delete':
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
      case 'add':
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
      case 'layout':
        graph.updateLayout(data, undefined, undefined, false);
        break;
      default:
    }
  }
}
