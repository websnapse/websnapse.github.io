import G6 from "@antv/g6";
import addNode from "./utils/add-node";
import deleteItems from "./utils/delete-items";
import { updateNeuron, updateSynapse } from "@/utils/dialog";
import duplicateItems from "./utils/duplicate-items";
import settings from "@/stores/settings";
import style from "@/stores/styles";
import rulebook from "@/stores/rulebook";

export default function initializeContextMenu(graph) {
  const contextMenu = new G6.Menu({
    getContent(evt) {
      let content;
      if (evt.target && evt.target.isCanvas && evt.target.isCanvas()) {
        content = [
          { img: "/node.svg", text: "New Node" },
          { img: "/fit.svg", text: "Fit View" },
          { img: "/layout.svg", text: "Auto layout" },
          { img: "/signal.svg", text: "Radial layout" },
          { img: "/save.svg", text: "Save" },
          { img: "/delete.svg", text: "Clear" },
        ];
      } else if (evt.item) {
        const itemType = evt.item.getType();
        switch (itemType) {
          case "node":
            content = [
              { img: "/rule.svg", text: "Edit node" },
              { img: "/focus.svg", text: "Focus node" },
              { img: "/duplicate.svg", text: "Duplicate" },
              { img: "/delete.svg", text: "Delete" },
            ];
            break;
          case "edge":
            content = [
              { img: "/weight.svg", text: "Edit weight" },
              { img: "/delete.svg", text: "Delete" },
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
      .join("")}
  </ul>`;
    },
    async handleMenuClick(target, item) {
      const command = target.innerText;
      const point = target.getBoundingClientRect();
      const model = item?.getModel();
      switch (command) {
        case "New Node":
          await addNode(point, graph);
          break;
        case "Fit View":
          graph.fitView([120, 50, 180, 50], null, true);
          break;
        case "Save":
          graph.downloadFullImage("system", "image/png", {
            backgroundColor: settings.dark ? style.dark : "#fff",
            padding: 20,
          });
          break;
        case "Clear":
          graph.clear();
          rulebook.global_rules = {};
          rulebook.all_rules = {};
          rulebook.global_edges = [];
          break;
        case "Auto layout":
          await graph.updateLayout(
            {
              type: "dagre",
              rankdir: "LR",
              linkDistance: 300,
              nodeStrength: 10,
              edgeStrength: 10,
              nodeSpacing: 50,
              minMovement: 0.01,
              maxIteration: 100,
              damping: 0.01,
              preventOverlap: true,
            },
            "center"
          );
          break;

        case "Radial layout":
          graph.updateLayout(
            {
              type: "circular",
              radius: null,
              clockwise: false,
              ordering: "degree",
              angleRatio: 1,
            },
            "center"
          );
          break;
        case "Focus node":
          graph.focusItem(item, true, {
            easing: "easeCubic",
            duration: 500,
          });
          break;
        case "Edit node":
          const updated_node = await updateNeuron(item);

          if (!updated_node.success) return;

          if (updated_node.type === "regular") {
            model.id = updated_node.id;
            model.content = updated_node.content;
            model.rules = updated_node.rules;
          } else {
            model.id = updated_node.id;
            model.content = updated_node.content;
          }

          graph.updateItem(item, model, true);
          break;
        case "Edit weight":
          const updated_synapse = await updateSynapse(item);
          model.label = updated_synapse.label;
          item.update(model);
          break;
        case "Delete":
          item.setState("selected", true);
          deleteItems(graph);
          break;
        case "Duplicate":
          item.setState("selected", true);
          duplicateItems(graph);
          break;
      }
    },
    offsetX: 0,
    offsetY: 0,
    itemTypes: ["node", "edge", "canvas"],
  });
  return contextMenu;
}
