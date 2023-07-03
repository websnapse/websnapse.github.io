import G6 from '@antv/g6';
import { foldString, latexToImg } from '@/utils/math';
import style from '@/stores/styles';
import settings from '@/stores/settings';
import { memoize } from 'lodash';

const drawRegular = (cfg, group) => {
  const render_content = latexToImg(cfg.content);
  const render_rules = memoize(latexToImg)(
    `\\displaylines{${cfg.rules.join('\\\\[-0.5em]')}}`
  );
  const render = [render_content, render_rules];

  const mw =
    settings.view === 'full'
      ? Math.max(...render.map((item) => item.width), style.min_width)
      : Math.max(render_content.width, 20);
  const mh =
    settings.view === 'full'
      ? Math.max(render.reduce((acc, item) => acc + item.height, 0) + style.m)
      : 20;

  // set neuron size to mw, mh
  const node_width = 2 * style.p + mw;
  const node_height = 2 * style.p + mh;
  cfg.size = [node_width, node_height];

  const start_x = -node_width / 2;
  const start_y = -node_height / 2;

  const shape = group.addShape('rect', {
    attrs: {
      x: start_x,
      y: start_y,
      width: node_width,
      height: node_height,
      radius: settings.view === 'full' ? style.r : 15,
      stroke: settings.dark ? style.darkContent : style.content,
      lineWidth: style.lineInactive,
      shadowColor: style.primary,
      shadowBlur: 0,
      fill: settings.dark ? style.dark : style.light,
    },
    name: 'neuron',
    draggable: true,
    zIndex: 10,
  });

  const content = group.addShape('text', {
    attrs: {
      y: settings.view === 'full' ? start_y + style.p : 0,
      x: start_x + (style.p + mw / 2),
      text: cfg.content,
      textAlign: 'center',
      textBaseline: settings.view === 'full' ? 'top' : 'middle',
      fontSize: 20,
      fontFamily: 'KaTeX_Main',
      fill: settings.dark ? style.darkContent : style.content,
    },
    name: 'content',
    visible: true,
    draggable: true,
    zIndex: 20,
  });

  const rules = group.addShape('image', {
    attrs: {
      y: start_y + style.p + render[0].height + style.m,
      x: start_x + (style.p + mw / 2 - render[1].width / 2),
      width: render[1].width,
      height: render[1].height,
      img: render[1].dom,
    },
    name: 'rules',
    draggable: true,
    visible: settings.view === 'full',
    zIndex: 20,
  });

  if (settings.label) {
    const node_id = latexToImg(cfg.id);

    const id = group.addShape('image', {
      attrs: {
        x:
          settings.view === 'full'
            ? start_x - 15 - node_id.width / 2
            : start_x + (style.p + mw / 2 - (node_id.width * 0.8) / 2),
        y: start_y - 20,
        width: node_id.width * 0.8,
        height: node_id.height * 0.8,
        img: node_id.dom,
      },
      name: 'label',
    });
  }

  const delay_shape = group.addShape('text', {
    attrs: {
      x: 0,
      y: shape.attr('y') + shape.attr('height') + 10,
      text: cfg.delay ?? 0,
      textAlign: 'center',
      textBaseline: 'top',
      fontSize: 20,
      fontFamily: 'KaTeX_Main',
      fill: settings.dark ? style.darkContent : style.content,
    },
    name: 'delay',
    visible: true,
    zIndex: 20,
  });

  group.sort();

  return shape;
};

const drawInput = (cfg, group) => {
  const render = [latexToImg(foldString(`${cfg.content}`))];

  const mw =
    settings.view === 'full'
      ? Math.max(Math.max(...render.map((item) => item.width)), style.min_width)
      : Math.max(...render.map((item) => item.width), 20);
  const mh =
    settings.view === 'full'
      ? Math.max(
          render.reduce((acc, item) => acc + item.height, 0),
          style.min_height
        )
      : 20;

  // set neuron size to mw, mh
  const node_width = 2 * style.p + mw;
  const node_height = 2 * style.p + mh;
  cfg.size = [node_width, node_height];

  const start_x = -node_width / 2;
  const start_y = -node_height / 2;

  const shape = group.addShape('rect', {
    attrs: {
      x: start_x,
      y: start_y,
      width: node_width,
      height: node_height,
      stroke: settings.dark ? style.darkContent : style.content,
      lineWidth: style.lineInactive,
      shadowColor: settings.dark ? style.darkPrimary : style.primary,
      shadowBlur: 0,
      radius: settings.view === 'full' ? style.r : 15,
      fill: settings.dark ? style.dark : style.light,
    },
    name: 'neuron',
    draggable: true,
    zIndex: 10,
  });

  group.addShape('polygon', {
    attrs: {
      points: [
        [start_x - 2, start_y + node_height / 2],
        [start_x - 15, start_y + node_height / 2 + 10],
        [start_x - 15, start_y + node_height / 2 - 10],
      ],
      fill: settings.dark ? style.darkContent : style.content,
      stroke: settings.dark ? style.darkContent : style.content,
      lineWidth: style.lineInactive,
    },
    name: 'input-indicator',
    draggable: true,
    zIndex: 10,
  });

  const content = group.addShape('image', {
    attrs: {
      y: -render[0].height / 2,
      x: start_x + (style.p + mw / 2 - render[0].width / 2),
      width: render[0].width,
      height: render[0].height,
      img: render[0].dom,
    },
    name: 'content',
    draggable: true,
    zIndex: 20,
  });

  if (settings.label) {
    const node_id = latexToImg(cfg.id);

    const id = group.addShape('image', {
      attrs: {
        x:
          settings.view === 'full'
            ? start_x - 15 - node_id.width / 2
            : start_x + (style.p + mw / 2 - (node_id.width * 0.8) / 2),
        y: start_y - 20,
        width: node_id.width * 0.8,
        height: node_id.height * 0.8,
        img: node_id.dom,
      },
      name: 'label',
    });
  }

  group.sort();

  return shape;
};

const drawOutput = (cfg, group) => {
  const render = [latexToImg(foldString(`${cfg.content}`))];

  const mw =
    settings.view === 'full'
      ? Math.max(Math.max(...render.map((item) => item.width)), style.min_width)
      : Math.max(...render.map((item) => item.width), 20);
  const mh =
    settings.view === 'full'
      ? Math.max(
          render.reduce((acc, item) => acc + item.height, 0),
          style.min_height
        )
      : 20;

  // set neuron size to mw, mh
  const node_width = 2 * style.p + mw;
  const node_height = 2 * style.p + mh;
  cfg.size = [node_width, node_height];

  const start_x = -node_width / 2;
  const start_y = -node_height / 2;

  const shape = group.addShape('rect', {
    attrs: {
      x: start_x,
      y: start_y,
      width: node_width,
      height: node_height,
      stroke: settings.dark ? style.darkContent : style.content,
      lineWidth: style.lineInactive,
      shadowColor: settings.dark ? style.darkPrimary : style.primary,
      shadowBlur: 0,
      radius: settings.view === 'full' ? style.r : 15,
      fill: settings.dark ? style.dark : style.light,
    },
    name: 'neuron',
    draggable: true,
    zIndex: 10,
  });

  group.addShape('rect', {
    attrs: {
      x: start_x + 5,
      y: start_y + 5,
      width: node_width - 10,
      height: node_height - 10,
      stroke: settings.dark ? style.darkContent : style.content,
      lineWidth: style.lineInactive,
      shadowColor: settings.dark ? style.darkPrimary : style.primary,
      shadowBlur: 0,
      radius: shape.attr('radius') - 5,
      fill: settings.dark ? style.dark : style.light,
    },
    name: 'output-indicator',
    draggable: true,
    zIndex: 11,
  });

  const content = group.addShape('image', {
    attrs: {
      y: -render[0].height / 2,
      x: start_x + (style.p + mw / 2 - render[0].width / 2),
      width: render[0].width,
      height: render[0].height,
      img: render[0].dom,
    },
    name: 'content',
    draggable: true,
    zIndex: 20,
  });

  if (settings.label) {
    const node_id = latexToImg(cfg.id);

    const id = group.addShape('image', {
      attrs: {
        x:
          settings.view === 'full'
            ? start_x - 15 - node_id.width / 2
            : start_x + (style.p + mw / 2 - (node_id.width * 0.8) / 2),
        y: start_y - 20,
        width: node_id.width * 0.8,
        height: node_id.height * 0.8,
        img: node_id.dom,
      },
      name: 'label',
    });
  }

  group.sort();

  return shape;
};

const setStateRegular = (name, value, item) => {
  const shape = item.get('keyShape');
  const { type } = item.getModel();

  const content = item.getContainer().find((ele) => {
    return ele.get('name') === 'content';
  });
  if (name === 'spiking') {
    shape.attr(
      'stroke',
      value ? style.primary : settings.dark ? style.darkContent : style.content
    );
    shape.attr('shadowBlur', value ? 10 : 0);
  } else if (name === 'forgetting') {
    shape.attr(
      'stroke',
      value ? style.primary : settings.dark ? style.darkContent : style.content
    );
    shape.attr('shadowBlur', value ? 10 : 0);
  } else if (!['spiking', 'forgetting', 'simple'].includes(name)) {
    const shapes = item.getStateStyle(name);
    const original_style = item.getOriginStyle();

    if (!shapes) return;

    Object.keys(shapes)?.forEach((shapeName) => {
      const shapeItem = item
        .get('group')
        .find((e) => e.get('name') === shapeName);

      const attrs = shapes[shapeName];
      Object.keys(attrs).forEach((attr) => {
        const attr_value = shapes[shapeName][attr];
        const orig_value = original_style[shapeName][attr];
        shapeItem?.attr(attr, value ? attr_value : orig_value);
      });
    });
  }
};

const options = {
  stateStyles: {
    hover: {
      neuron: {
        shadowColor: style.primary,
        shadowBlur: 10,
      },
    },
    selected: {
      neuron: {
        shadowBlur: 10,
        lineWidth: style.lineActive,
        stroke: style.primary,
        shadowColor: style.primary,
      },
    },
    closed: {
      neuron: {
        shadowBlur: 10,
        stroke: style.error,
        shadowColor: style.error,
      },
    },
    default: {
      neuron: {
        shadowBlur: 0,
        shadowColor: style.primary,
        lineWidth: style.lineInactive,
        stroke: settings.dark ? style.darkContent : style.content,
      },
    },
  },
};

const updateOutput = (cfg, item) => {
  const group = item.getContainer();
  const shape = group.find((ele) => {
    return ele.get('name') === 'neuron';
  });
  const indicator = group.find((ele) => {
    return ele.get('name') === 'output-indicator';
  });
  const latex_content = latexToImg(foldString(`${cfg.content}`));
  const content = group.find((ele) => {
    return ele.get('name') === 'content';
  });

  content.attr({
    width: latex_content.width,
    height: latex_content.height,
    img: latex_content.dom,
    y: -latex_content.height / 2,
    x: -latex_content.width / 2,
  });

  const mw =
    settings.view === 'full'
      ? Math.max(latex_content.width, style.min_width)
      : Math.max(latex_content.width, 20);
  const mh =
    settings.view === 'full'
      ? Math.max(latex_content.height, style.min_height)
      : 20;

  const node_width = 2 * style.p + mw;
  const node_height = 2 * style.p + mh;
  cfg.size = [node_width, node_height];

  const start_x = -node_width / 2;
  const start_y = -node_height / 2;

  shape.attr({
    x: start_x,
    y: start_y,
    width: node_width,
    height: node_height,
    radius: settings.view === 'full' ? style.r : 15,
  });
  indicator.attr({
    x: start_x + 5,
    y: start_y + 5,
    width: node_width - 10,
    height: node_height - 10,
    radius: shape.attr('radius') - 5,
  });

  if (settings.label) {
    const id = group.find((ele) => {
      return ele.get('name') === 'label';
    });

    id.attr({
      x:
        settings.view === 'full'
          ? start_x - 15 - id.attr('width') / 2
          : start_x + (style.p + mw / 2 - id.attr('width') / 2),
      y: start_y - 20,
    });
  }
};

const updateInput = (cfg, item) => {
  const group = item.getContainer();
  const shape = group.find((ele) => {
    return ele.get('name') === 'neuron';
  });
  const indicator = group.find((ele) => {
    return ele.get('name') === 'input-indicator';
  });
  const latex_content = latexToImg(foldString(`${cfg.content}`));
  const content = group.find((ele) => {
    return ele.get('name') === 'content';
  });

  content.attr({
    width: latex_content.width,
    height: latex_content.height,
    img: latex_content.dom,
    y: -latex_content.height / 2,
    x: -latex_content.width / 2,
  });

  const mw =
    settings.view === 'full'
      ? Math.max(latex_content.width, style.min_width)
      : Math.max(latex_content.width, 20);
  const mh =
    settings.view === 'full'
      ? Math.max(latex_content.height, style.min_height)
      : 20;

  const node_width = 2 * style.p + mw;
  const node_height = 2 * style.p + mh;
  cfg.size = [node_width, node_height];

  const start_x = -node_width / 2;
  const start_y = -node_height / 2;

  shape.attr({
    x: start_x,
    y: start_y,
    width: node_width,
    height: node_height,
    radius: settings.view === 'full' ? style.r : 15,
  });
  indicator.attr({
    points: [
      [start_x - 2, start_y + node_height / 2],
      [start_x - 15, start_y + node_height / 2 + 10],
      [start_x - 15, start_y + node_height / 2 - 10],
    ],
  });

  if (settings.label) {
    const id = group.find((ele) => {
      return ele.get('name') === 'label';
    });

    id.attr({
      x:
        settings.view === 'full'
          ? start_x - 15 - id.attr('width') / 2
          : start_x + (style.p + mw / 2 - id.attr('width') / 2),
      y: start_y - 20,
    });
  }
};

const updateRegular = (cfg, item) => {
  const group = item.getContainer();
  const shape = group.find((ele) => {
    return ele.get('name') === 'neuron';
  });
  const content = group.find((ele) => {
    return ele.get('name') === 'content';
  });

  const delay = group.find((ele) => {
    return ele.get('name') === 'delay';
  });

  const rules = group.find((ele) => {
    return ele.get('name') === 'rules';
  });

  const render_content = latexToImg(cfg.content);
  const render_rules = memoize(latexToImg)(
    `\\displaylines{${cfg.rules.join('\\\\[-0.5em]')}}`
  );
  const render = [render_content, render_rules];

  const mw =
    settings.view === 'full'
      ? Math.max(...render.map((item) => item.width), style.min_width)
      : Math.max(render_content.width, 20);
  const mh =
    settings.view === 'full'
      ? Math.max(render.reduce((acc, item) => acc + item.height, 0) + style.m)
      : 20;

  // set neuron size to mw, mh
  const node_width = 2 * style.p + mw;
  const node_height = 2 * style.p + mh;
  cfg.size = [node_width, node_height];

  const start_x = -node_width / 2;
  const start_y = -node_height / 2;

  shape.attr({
    x: start_x,
    y: start_y,
    width: node_width,
    height: node_height,
    radius: settings.view === 'full' ? style.r : 15,
  });

  rules.attr({
    y: start_y + style.p + render[0].height + style.m,
    x: start_x + (style.p + mw / 2 - render[1].width / 2),
  });

  settings.view === 'full' ? rules.show() : rules.hide();

  delay.attr({
    text: cfg.delay,
    y: shape.attr('y') + shape.attr('height') + 10,
  });

  content.attr({
    text: cfg.content,
    y: settings.view === 'full' ? start_y + style.p : 0,
    textBaseline: settings.view === 'full' ? 'top' : 'middle',
  });

  if (settings.label) {
    const id = group.find((ele) => {
      return ele.get('name') === 'label';
    });

    id.attr({
      x:
        settings.view === 'full'
          ? start_x - 15 - id.attr('width') / 2
          : start_x + (style.p + mw / 2 - id.attr('width') / 2),
      y: start_y - 20,
    });
  }
};

export default function initializeNode() {
  G6.registerNode('regular', {
    options,
    update: (cfg, item) => {
      updateRegular(cfg, item);
    },
    drawShape: (cfg, group) => {
      return drawRegular(cfg, group);
    },
    setState: (name, value, item) => {
      return setStateRegular(name, value, item);
    },
  });
  G6.registerNode('output', {
    options,
    update: (cfg, item) => {
      updateOutput(cfg, item);
    },
    drawShape: (cfg, group) => {
      return drawOutput(cfg, group);
    },
    setState: (name, value, item) => {
      return setStateRegular(name, value, item);
    },
  });
  G6.registerNode('input', {
    options,
    update: (cfg, item) => {
      updateInput(cfg, item);
    },
    drawShape: (cfg, group) => {
      return drawInput(cfg, group);
    },
    setState: (name, value, item) => {
      return setStateRegular(name, value, item);
    },
  });
}
