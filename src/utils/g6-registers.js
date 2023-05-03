import G6 from '@antv/g6';
import { latexToImg } from './mathjax';

const black = '#0d0e0e';
const primary = '#08415c';

const drawNeuron = (cfg, group) => {
  const r = 50;
  const m = 20;
  const p = 20;

  const render = [cfg.content, ...cfg.rules].map((key) => {
    return latexToImg(key);
  });

  const mw = Math.max(...render.map((item) => item.width));
  const mh = render.reduce((acc, item) => acc + item.height, 0) + m;

  const shape = group.addShape('rect', {
    attrs: {
      x: 0,
      y: 0,
      width: 2 * p + mw,
      height: 2 * p + mh,
      stroke: '#0d0e0e',
      lineWidth: 2,
      shadowColor: primary,
      shadowBlur: 0,
      radius: r,
      fill: '#fff',
    },
    // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
    name: 'neuron',
    draggable: true,
    zIndex: 10,
  });

  const animation1 = group.addShape('rect', {
    attrs: {
      x: 0,
      y: 0,
      width: 2 * p + mw,
      height: 2 * p + mh,
      radius: r,
      fill: primary,
      opacity: 0.6,
    },
    visible: false,
    name: 'animation-1',
    draggable: true,
    zIndex: -3,
  });

  const animation2 = group.addShape('rect', {
    attrs: {
      x: 0,
      y: 0,
      width: 2 * p + mw,
      height: 2 * p + mh,
      radius: r,
      fill: primary,
      opacity: 0.6,
    },
    visible: false,
    name: 'animation-2',
    draggable: true,
    zIndex: -2,
  });

  animation1.animate(
    {
      // Magnifying and disappearing
      width: 2 * p + mw + 20,
      height: 2 * p + mh + 20,
      x: -10,
      y: -10,
      opacity: 0,
    },
    {
      duration: 1500,
      easing: 'easePolyInOut',
      delay: 0,
      repeat: true, // repeat
    }
  );

  animation2.animate(
    {
      width: 2 * p + mw + 20,
      height: 2 * p + mh + 20,
      x: -10,
      y: -10,
      opacity: 0,
    },
    {
      duration: 1500,
      easing: 'easeCubic',
      delay: 500,
      repeat: true, // repeat
    }
  );

  group.addShape('image', {
    attrs: {
      y: p,
      x: p + mw / 2 - render[0].width / 2,
      width: render[0].width,
      height: render[0].height,
      img: render[0].dom,
    },
    // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
    name: 'content',
    draggable: true,
    zIndex: 20,
  });

  // The content list
  cfg.rules.forEach((_, index) => {
    // name text
    group.addShape('image', {
      attrs: {
        width: render[1 + index].width,
        height: render[1 + index].height,
        y:
          p +
          m +
          render
            .slice(0, 1 + index)
            .reduce((acc, item) => acc + item.height, 0),
        x: p + mw / 2 - render[1 + index].width / 2,
        img: render[1 + index].dom,
      },
      // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
      name: `rule-${index}`,

      draggable: true,
      zIndex: 20,
    });
  });

  group.addShape('rect', {
    attrs: {
      y: p + render[0].height + m,
      x: p,
      width: mw,
      height: render
        .slice(0, 1 + cfg.rules.length)
        .reduce((acc, item) => acc + item.height, 0),
      radius: 10,
      fill: '#00000000',
    },
    // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
    name: 'rules',
    draggable: true,
    zIndex: 30,
  });

  group.sort(); // Sort according to the zIndex

  return shape;
};

export const initializeRegisters = async (neuron) => {
  G6.registerNode(
    'neuron',
    {
      options: {
        stateStyles: {
          hover: {
            neuron: {
              shadowBlur: 10,
            },
          },
          selected: {
            neuron: {
              shadowBlur: 10,
              lineWidth: 5,
              stroke: '#08415c',
            },
          },
          default: {
            neuron: {
              shadowBlur: 0,
              lineWidth: 2,
              stroke: '#0d0e0e',
            },
          },
        },
      },
      drawShape: function drawShape(cfg, group) {
        return drawNeuron(cfg, group);
      },
      setState(name, value, item) {
        if (name === 'animate') {
          const anim1 = item
            .getContainer()
            .find((ele) => ele.get('name') === 'animation-1');
          const anim2 = item
            .getContainer()
            .find((ele) => ele.get('name') === 'animation-2');

          const shape = item.get('keyShape');

          shape.attr('stroke', value ? primary : black);
          shape.attr('lineWidth', value ? 5 : 2);
          shape.attr('shadowBlur', value ? 10 : 0);

          value ? anim1.show() : anim1.hide();
          value ? anim2.show() : anim2.hide();
        } else {
          const shapes = item.getStateStyle(name);
          const original_style = item.getStateStyle('default');

          Object.keys(shapes).forEach((shape_name) => {
            const shape = item
              .get('group')
              .find((e) => e.get('name') === shape_name);

            const attrs = shapes[shape_name];
            Object.keys(attrs).forEach((attr) => {
              const attr_value = shapes[shape_name][attr];
              const orig_value = original_style[shape_name][attr];
              shape.attr(attr, value ? attr_value : orig_value);
            });
          });
        }
      },
    },
    'single-node'
  );

  const lineDash = [4, 2, 1, 2];

  G6.registerEdge(
    'circle-running',
    {
      options: {
        stateStyles: {
          hover: {
            shadowBlur: 10,
          },
          default: {
            shadowBlur: 0,
            shadowColor: primary,
            lineWidth: 2,
            stroke: black,
            endArrow: {
              path: 'M 0,0 L 20,4 L 20,-4 Z',
              d: 5,
              stroke: '#00000000',
              fill: black,
            },
          },
          selected: {
            stroke: primary,
            lineWidth: 3,
            endArrow: {
              path: 'M 0,0 L 23,4 L 23,-4 Z',
              d: 5,
              stroke: '#00000000',
              fill: primary,
            },
          },
        },
        labelCfg: {
          autoRotate: true,
          style: {
            fill: black,
            fontSize: 20,
            shadowColor: '#fff',
            shadowBlur: 20,
            textBaseline: 'ideographic',
          },
        },
        style: {
          shadowBlur: 0,
          shadowColor: primary,
          lineWidth: 2,
          stroke: black,
          endArrow: {
            path: 'M 0,0 L 20,4 L 20,-4 Z',
            d: 5,
            stroke: '#00000000',
            fill: '#000',
          },
        },
      },

      // draw(cfg, group) {
      //   const startPoint = cfg.startPoint;
      //   const endPoint = cfg.endPoint;
      //   const stroke =
      //     (cfg.style && cfg.style.stroke) || this.options.style.stroke;

      //   const shape = group.addShape('path', {
      //     attrs: {
      //       stroke: stroke,
      //       lineWidth: 2,
      //       shadowColor: '#08415c',
      //       endArrow: {
      //         path: 'M 0,0 L 20,4 L 20,-4 Z',
      //         d: 5,
      //         stroke: '#00000000',
      //         fill: '#000',
      //       },
      //       path: [
      //         ['M', startPoint.x, startPoint.y],
      //         ['L', endPoint.x, endPoint.y],
      //       ],
      //     },
      //     name: 'path-shape',
      //   });

      //   group.addShape('circle', {
      //     attrs: {
      //       x: startPoint.x,
      //       y: startPoint.y,
      //       fill: black,
      //       r: 3,
      //       opacity: 0,
      //     },
      //     name: 'circle-shape',
      //   });

      //   group.addShape('text', {
      //     attrs: {
      //       text: cfg.label,
      //       fill: '#595959',
      //       textAlign: 'center',
      //       textBaseline: 'middle',
      //     },
      //     name: 'weight',
      //   });
      //   return shape;
      // },

      afterDraw(cfg, group) {
        const startPoint = cfg.startPoint;

        group.addShape('circle', {
          attrs: {
            x: startPoint.x,
            y: startPoint.y,
            fill: primary,
            r: 8,
            opacity: 0,
          },
          name: 'circle-shape',
        });
      },
      setState(name, value, item) {
        const shape = item.get('keyShape');

        const circle = item
          .get('group')
          .find((e) => e.get('name') === 'circle-shape');

        if (name === 'animate') {
          circle.attr('opacity', value ? 1 : 0);
          shape.attr('stroke', value ? primary : black);
          shape.attr('lineWidth', value ? 5 : 2);
          // change endarrow stroke color
          shape.attr('endArrow', {
            path: 'M 0,0 L 20,4 L 20,-4 Z',
            d: 5,
            stroke: '#00000000',
            fill: value ? primary : black,
          });

          if (value) {
            let index = 0;
            shape.animate(
              () => {
                index++;
                if (index > 9) {
                  index = 0;
                }
                const res = {
                  lineDash,
                  lineDashOffset: -index,
                };
                // return the params for this frame
                return res;
              },
              {
                repeat: true,
                duration: 3000,
              }
            );
            circle.animate(
              (ratio) => {
                // the operations in each frame. Ratio ranges from 0 to 1 indicating the prograss of the animation. Returns the modified configurations
                // get the position on the edge according to the ratio
                const tmpPoint = shape.getPoint(ratio);
                // returns the modified configurations here, x and y here
                return {
                  x: tmpPoint.x,
                  y: tmpPoint.y,
                };
              },
              {
                duration: 3000, // the duration for executing once
              }
            );
          } else {
            shape.stopAnimate();
            circle.stopAnimate();
            shape.attr('lineDash', null);
          }
        } else {
          const attrs = item.getStateStyle(name);
          const original_style = item.getStateStyle('default');

          Object.keys(attrs).forEach((attr) => {
            const attr_value = attrs[attr];
            const orig_value = original_style[attr];
            shape.attr(attr, value ? attr_value : orig_value);
          });
        }
      },
    },
    'quadratic' // extend the built-in edge 'cubic'
  );

  G6.registerBehavior('click-add-node', {
    // Bind the events and response functions for this custom Behavior
    getEvents() {
      return {
        'canvas:click': 'onClick', // The event to be listned is canvas:click. The response function is onClick
      };
    },
    // The click event
    onClick(ev) {
      neuron.value.count += 1;
      const node_label = neuron.value.count;

      const graph = this.graph;
      // Add a new node on the canvas
      const node = graph.addItem('node', {
        x: ev.x,
        y: ev.y,
        id: G6.Util.uniqueId(), // Generate a unique id
        label: neuron.value.label,
        nodeType: 'regular',
        content: neuron.value.content,
        rules: neuron.value.rules.split('\n'),
      });
    },
  });

  // Register the custom Behavior of adding a edge by clicking
  G6.registerBehavior('click-add-edge', {
    // Bind the events and response functions for this custom Behavior

    getEvents() {
      return {
        'node:click': 'onClick', // The event to be listned is node:click. The response function is onClick
        mousemove: 'onMousemove', // The event to be listned is mousemove. The response function is onMousemove
        'edge:click': 'onEdgeClick', // The event to be listned is edge:click. The response function is onEdgeClick
      };
    },
    // The response function for 'node:click' defined in getEvents
    onClick(ev) {
      const node = ev.item;
      const graph = this.graph;
      // The position of the node where the mouse is currently clicking on
      const point = { x: ev.x, y: ev.y };
      const model = node.getModel();
      const edges = graph.save().edges;

      // If this is the first node clicked, add a edge from it
      // Otherwise, if this is the second node clicked, then we should add a edge bewteen the previous node and this node
      if (this.addingEdge && this.edge) {
        // check if source and target already exist in edges

        const exist = edges.filter(
          (e) =>
            e.source === this.edge.getSource().getID() && e.target === model.id
        );

        if (this.edge.getSource() !== node) {
          graph.updateItem(this.edge, {
            target: model.id,
          });
        } else {
          this.graph.removeItem(this.edge);
        }

        if (exist.length > 0) {
          this.graph.removeItem(this.edge);
        }

        this.edge = null;
        this.addingEdge = false;
      } else {
        // Add a new edge to the graph with the currently clicked node's position as the end point
        this.edge = graph.addItem('edge', {
          source: model.id,
          target: point,
          label: 1,
        });
        this.addingEdge = true;
      }
    },

    onMousemove(ev) {
      const point = { x: ev.x, y: ev.y };
      if (this.addingEdge && this.edge) {
        this.graph.updateItem(this.edge, {
          target: point,
        });
      }
    },

    onEdgeClick(ev) {
      const currentEdge = ev.item;
      if (this.addingEdge && this.edge == currentEdge) {
        this.graph.removeItem(this.edge);
        this.edge = null;
        this.addingEdge = false;
      }
    },
  });

  G6.registerBehavior('remove-node', {
    getEvents() {
      return {
        'node:click': 'onClick',
      };
    },
    onClick(ev) {
      const graph = this.graph;
      const node = ev.item;
      const model = node.getModel();
      setTimeout(() => {
        graph.remove(node);
      }, 100);

      // graph.refresh();
    },
  });
};
