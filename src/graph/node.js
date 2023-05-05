import G6 from '@antv/g6';
import { latexToImg } from '../utils/mathjax';
import {
  black,
  primary,
  r,
  m,
  p,
  min_width,
  min_height,
  lineInactive,
  lineActive,
} from './styles';

const drawNeuron = (cfg, group) => {
  let render;

  if (cfg.nodeType === 'regular') {
    render = [cfg.content, ...cfg.rules].map((key) => {
      return latexToImg(key);
    });
  } else {
    render = [cfg.content].map((key) => {
      return latexToImg(key);
    });
  }

  const mw = Math.max(Math.max(...render.map((item) => item.width)), min_width);
  const mh = Math.max(
    render.reduce((acc, item) => acc + item.height, 0) + m,
    min_height
  );

  // set neuron size to mw, mh
  cfg.size = [2 * p + mw, 2 * p + mh];

  const start_x = -(2 * p + mw) / 2;
  const start_y = -(2 * p + mh) / 2;

  const shape = group.addShape('rect', {
    attrs: {
      x: start_x,
      y: start_y,
      width: 2 * p + mw,
      height: 2 * p + mh,
      stroke: '#0d0e0e',
      lineWidth: lineInactive,
      shadowColor: primary,
      shadowBlur: 0,
      radius: r,
      fill: '#fff',
    },
    name: 'neuron',
    draggable: true,
    zIndex: 10,
  });

  if (cfg.nodeType === 'output') {
    group.addShape('rect', {
      attrs: {
        x: start_x - 5,
        y: start_y - 5,
        width: 2 * p + mw + 10,
        height: 2 * p + mh + 10,
        stroke: '#0d0e0e',
        lineWidth: lineInactive,
        shadowColor: primary,
        shadowBlur: 0,
        radius: r + 5,
        fill: '#fff',
      },
      name: 'output-indicator',
      draggable: true,
      zIndex: -3,
    });
  }

  if (cfg.nodeType === 'input') {
    group.addShape('polygon', {
      attrs: {
        points: [
          [start_x + (2 * p + mw) / 2, start_y - 2],
          [start_x + (2 * p + mw) / 2 + 10, start_y - 15],
          [start_x + (2 * p + mw) / 2 - 10, start_y - 15],
        ],
        fill: '#fff',
        stroke: '#0d0e0e',
        lineWidth: lineInactive,
      },
      name: 'input-indicator',
      draggable: true,
      zIndex: 10,
    });
  }

  const animation1 = group.addShape('rect', {
    attrs: {
      x: start_x,
      y: start_y,
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
      x: start_x,
      y: start_y,
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

  // animation1.animate(
  //   {
  //     x: start_x - 10,
  //     y: start_y - 10,
  //     width: 2 * p + mw + 20,
  //     height: 2 * p + mh + 20,
  //     opacity: 0,
  //   },
  //   {
  //     duration: 1500,
  //     easing: 'easePolyInOut',
  //     delay: 0,
  //     repeat: true, // repeat
  //   }
  // );

  // animation2.animate(
  //   {
  //     x: start_x - 10,
  //     y: start_y - 10,
  //     width: 2 * p + mw + 20,
  //     height: 2 * p + mh + 20,
  //     opacity: 0,
  //   },
  //   {
  //     duration: 1500,
  //     easing: 'easeCubic',
  //     delay: 500,
  //     repeat: true, // repeat
  //   }
  // );

  const content = group.addShape('image', {
    attrs: {
      y:
        cfg.nodeType === 'regular'
          ? start_y + p
          : start_y + (mh + render[0].height + p) / 2,
      x: start_x + (p + mw / 2 - render[0].width / 2),
      width: render[0].width,
      height: render[0].height,
      img: render[0].dom,
    },
    name: 'content',
    draggable: true,
    zIndex: 20,
  });

  // The rule list
  if (cfg.nodeType === 'regular') {
    cfg.rules.forEach((_, index) => {
      const rule = group.addShape('image', {
        attrs: {
          width: render[1 + index].width,
          height: render[1 + index].height,
          y:
            -(2 * p + mh) / 2 +
            p +
            m +
            render
              .slice(0, 1 + index)
              .reduce((acc, item) => acc + item.height, 0),
          x: -(2 * p + mw) / 2 + p + mw / 2 - render[1 + index].width / 2,
          img: render[1 + index].dom,
        },
        name: `rule-${index}`,
        visible: true,
        draggable: true,
        zIndex: 20,
      });
    });

    const ruleBoundary = group.addShape('rect', {
      attrs: {
        y: start_y + p + render[0].height + m,
        x: start_x + p,
        width: mw,
        height: render
          .slice(0, 1 + cfg.rules.length)
          .reduce((acc, item) => acc + item.height, 0),
        radius: 10,
        fill: '#00000000',
      },
      visible: true,
      name: 'rules',
      draggable: true,
      zIndex: 30,
    });
  }

  const node_id = latexToImg(cfg.id);

  const id = group.addShape('image', {
    attrs: {
      x: start_x - 15,
      y: start_y - 15,
      width: node_id.width * 0.8,
      height: node_id.height * 0.8,
      img: node_id.dom,
    },
    name: 'label',
  });

  group.sort(); // Sort according to the zIndex

  return shape;
};

export default function initializeNode() {
  G6.registerNode('neuron', {
    options: {
      labelCfg: {
        style: {
          fill: '#000',
          fontSize: 20,
          fontFamily: 'Cambria Math',
        },
      },
      stateStyles: {
        hover: {
          neuron: {
            shadowBlur: 10,
          },
        },
        selected: {
          neuron: {
            shadowBlur: 10,
            lineWidth: lineActive,
            stroke: '#08415c',
          },
        },
        default: {
          neuron: {
            shadowBlur: 0,
            lineWidth: lineInactive,
            stroke: '#0d0e0e',
          },
        },
      },
    },
    drawShape: function drawShape(cfg, group) {
      return drawNeuron(cfg, group);
    },
    setState(name, value, item) {
      const shape = item.get('keyShape');
      const rules = item.getContainer().findAll((ele) => {
        return ele.get('name')?.includes('rule');
      });
      const animations = item.getContainer().findAll((ele) => {
        return ele.get('name')?.includes('animation');
      });
      const content = item.getContainer().find((ele) => {
        return ele.get('name') === 'content';
      });
      // get original style of item
      const original_style = item._cfg.originStyle;

      if (name === 'simple') {
        // get content width
        const content_width = content.getBBox().width;
        const content_height = content.getBBox().height;
        // get original style of contnet
        const original_style = item.getStateStyle('default');

        // recenter the content
        content.attr('x', value ? -content_width / 2 : -60);
        content.attr('y', value ? -content_height / 2 : -60);
        shape.attr(
          'width',
          value ? Math.max(p + content_width + p, min_height) : 2 * 20 + 100
        );
        shape.attr('height', value ? min_height : 2 * 20 + 100);
        shape.attr('radius', value ? r / 2 : r);

        // recenter the shape
        shape.attr('x', -shape.attr('width') / 2);
        shape.attr('y', -shape.attr('height') / 2);

        // recenter the label
        const label = item.getContainer().find((ele) => {
          return ele.get('name') === 'label';
        });

        label.attr('x', -shape.attr('width') / 2 - 15);
        label.attr('y', -shape.attr('height') / 2 - 15);

        rules.forEach((rule) => {
          value ? rule.hide() : rule.show();
        });

        animations.forEach((anim, index) => {
          anim.attr('x', -shape.attr('width') / 2);
          anim.attr('y', -shape.attr('height') / 2);
          anim.attr('radius', value ? r / 2 : r);
          // resize animations
          anim.attr('width', value ? shape.attr('width') : shape.attr('width'));
          anim.attr(
            'height',
            value ? shape.attr('height') : shape.attr('height')
          );
          anim.animate(
            {
              x: -shape.attr('width') / 2 - 10,
              y: -shape.attr('height') / 2 - 10,
              width: value ? shape.attr('width') + 20 : shape.attr('width'),
              height: value ? shape.attr('height') + 20 : shape.attr('height'),
              opacity: 0,
            },
            {
              duration: 1500,
              easing: 'easePolyInOut',
              delay: index * 500,
              repeat: true,
            }
          );
          anim.stopAnimate();
          anim.hide();
        });
      }
      if (name === 'animate') {
        shape.attr('stroke', value ? primary : black);
        shape.attr('lineWidth', value ? 5 : 2);
        shape.attr('shadowBlur', value ? 10 : 0);

        animations.forEach((anim, index) => {
          value
            ? anim.animate(
                {
                  x: -shape.attr('width') / 2 - 10,
                  y: -shape.attr('height') / 2 - 10,
                  width: shape.attr('width') + 20,
                  height: shape.attr('height') + 20,
                  opacity: 0,
                },
                {
                  duration: 1500,
                  easing: 'easePolyInOut',
                  delay: index * 500,
                  repeat: true,
                }
              )
            : anim.stopAnimate();
          value ? anim.show() : anim.hide();
        });
      } else if (!['animate', 'simple'].includes(name)) {
        const shapes = item.getStateStyle(name);

        Object.keys(shapes)?.forEach((shapeName) => {
          const shapeItem = item
            .get('group')
            .find((e) => e.get('name') === shapeName);

          const attrs = shapes[shapeName];
          Object.keys(attrs).forEach((attr) => {
            const attr_value = shapes[shapeName][attr];
            shapeItem.attr(attr, value ? attr_value : null);
          });
        });
      }
    },
  });
}
