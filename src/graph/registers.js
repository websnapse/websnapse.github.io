import clickAddEdge from './behaviors/click-add-edge';
import clickAddNode from './behaviors/click-add-node';
import removeNode from './behaviors/remove-node';
import initalizeEdge from './edge';
import initializeNode from './node';

export default function initializeRegisters() {
  initalizeEdge();
  initializeNode();
  clickAddEdge();
  clickAddNode();
  removeNode();
}
