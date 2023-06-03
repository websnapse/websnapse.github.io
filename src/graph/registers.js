import clickAddNode from './behaviors/click-add-node';
import dragAddEdge from './behaviors/drag-add-edge';
import edgeInteractions from './behaviors/edge-interactions';
import keyboardInteractions from './behaviors/keyboard-interactions';
import nodeInteractions from './behaviors/node-interactions';
import removeNode from './behaviors/remove-item';
import initalizeEdge from './edge';
import initializeNode from './node';

export default function initializeRegisters() {
  initalizeEdge();
  initializeNode();
  dragAddEdge();
  clickAddNode();
  removeNode();
  nodeInteractions();
  edgeInteractions();
  keyboardInteractions();
}
