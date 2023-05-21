import clickAddEdge from './behaviors/click-add-edge';
import clickAddNode from './behaviors/click-add-node';
import dragAddEdge from './behaviors/drag-add-edge';
import nodeInteractions from './behaviors/node-interactions';
import removeNode from './behaviors/remove-item';
import initalizeEdge from './edge';
import initializeNode from './node';

export default function initializeRegisters() {
  initalizeEdge();
  initializeNode();
  clickAddEdge();
  dragAddEdge();
  clickAddNode();
  removeNode();
  nodeInteractions();
}
