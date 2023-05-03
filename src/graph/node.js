import G6 from '@antv/g6';
import { latexToImg } from '../utils/mathjax';
import { black, primary } from './styles';

const drawNeuron = (cfg, group) => {
  const r = 50;
  const m = 20;
  const p = 20;
  const min_width = 100;
  const min_height = 60;

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
    name: 'neuron',
    draggable: true,
    zIndex: 10,
  });

  if (cfg.nodeType === 'output') {
    group.addShape('rect', {
      attrs: {
        x: -5,
        y: -5,
        width: 2 * p + mw + 10,
        height: 2 * p + mh + 10,
        stroke: '#0d0e0e',
        lineWidth: 2,
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
          [(2 * p + mw) / 2, -2],
          [(2 * p + mw) / 2 + 10, -15],
          [(2 * p + mw) / 2 - 10, -15],
        ],
        fill: '#fff',
        stroke: '#0d0e0e',
        lineWidth: 2,
      },
      name: 'input-indicator',
      draggable: true,
      zIndex: 10,
    });
  }

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
      y: cfg.nodeType === 'regular' ? p : (mh + render[0].height + p) / 2,
      x: p + mw / 2 - render[0].width / 2,
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
      name: 'rules',
      draggable: true,
      zIndex: 30,
    });
  }

  if (cfg.label) {
    // If the label exists
    // The complex label configurations can be defined by labeCfg
    // const style = (cfg.labelCfg && cfg.labelCfg.style) || {};
    // style.text = cfg.label;
    const label = group.addShape('text', {
      attrs: {
        x: 0, // center
        y: 0,
        textAlign: 'center',
        textBaseline: 'middle',
        text: cfg.label,
        fill: '#666',
      },
      // must be assigned in G6 3.3 and later versions. it can be any value you want
      name: 'text-shape',
      // allow the shape to response the drag events
      draggable: true,
    });
  }

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
  });
}
