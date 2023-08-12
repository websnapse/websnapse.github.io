import G6 from '@antv/g6';
import { foldString, latexToImg } from '@/utils/math';
import style from '@/stores/styles';
import settings from '@/stores/settings';
import { memoize, pick } from 'lodash';

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
    spiking: {
      neuron: {
        stroke: style.primary,
        shadowBlur: 10,
        shadowColor: style.primary,
      },
    },
    forgetting: {
      neuron: {
        stroke: style.primary,
        shadowBlur: 10,
        shadowColor: style.primary,
      },
    },
    dark: {
      neuron: {
        radius: style.r,
        stroke: style.darkContent,
        fill: style.dark,
        lineWidth: style.lineInactive,
        shadowBlur: 0,
      },
      content: {
        fill: style.darkContent,
      },
      delay: {
        fill: style.darkContent,
      },
    },
    simple: {
      neuron: {
        radius: 15,
      },
      content: {
        textBaseline: 'middle',
      },
    },
    default: {
      neuron: {
        radius: style.r,
        stroke: style.content,
        lineWidth: style.lineInactive,
        shadowColor: style.primary,
        fill: style.light,
        shadowBlur: 0,
      },
      content: {
        fill: style.content,
        textAlign: 'center',
        textBaseline: 'top',
        fontSize: 20,
        fontFamily: 'KaTeX_Main',
      },
      delay: {
        fill: style.content,
        textAlign: 'center',
        textBaseline: 'top',
        fontSize: 20,
        fontFamily: 'KaTeX_Main',
      },
    },
  },
};

function displayRules(rules) {
  return `\\displaylines{${rules.join('\\\\[-0.5em]')}}`;
}

const drawRegular = (cfg, group) => {
  const content_length = `${cfg.content}`.length;
  const node_id_light = latexToImg(cfg.id);
  const node_id_dark = latexToImg(cfg.id, style.darkContent);
  const render_rules_light = latexToImg(displayRules(cfg.rules));
  const render_rules_dark = latexToImg(
    displayRules(cfg.rules),
    style.darkContent
  );
  cfg.light_rules = render_rules_light.dom;
  cfg.dark_rules = render_rules_dark.dom;
  cfg.light_label = node_id_light.dom;
  cfg.dark_label = node_id_dark.dom;
  cfg.delay = 0;

  const mw =
    settings.view === 'full'
      ? Math.max(render_rules_dark.width, content_length * 10, style.min_width)
      : Math.max(content_length * 10, 20);
  const mh =
    settings.view === 'full'
      ? Math.max(content_length * 20 + style.m + render_rules_light.height)
      : 20;

  const node_width = 2 * style.p + mw;
  const node_height = 2 * style.p + mh;
  cfg.size = [node_width, node_height];

  const start_x = -node_width / 2;
  const start_y = -node_height / 2;

  const shape = group.addShape('rect', {
    name: 'neuron',
    attrs: {
      x: start_x,
      y: start_y,
      width: node_width,
      height: node_height,
      ...options.stateStyles.default.neuron,
    },
    draggable: true,
    zIndex: 10,
  });

  group.addShape('text', {
    name: 'content',
    attrs: {
      y: start_y + style.p,
      x: start_x + (style.p + mw / 2),
      text: cfg.content,
      ...options.stateStyles.default.content,
    },
    draggable: true,
    zIndex: 20,
  });

  group.addShape('image', {
    name: 'rules',
    attrs: {
      y: start_y + style.p + 20 + style.m,
      x: start_x + (style.p + mw / 2 - render_rules_light.width / 2),
      width: render_rules_light.width,
      height: render_rules_light.height,
      img: settings.dark ? cfg.dark_rules : cfg.light_rules,
    },
    draggable: true,
    visible: settings.view === 'full',
    zIndex: 20,
  });

  if (settings.label) {
    group.addShape('image', {
      name: 'label',
      attrs: {
        x: start_x - 15 - (node_id_light.width * 0.8) / 2,
        y: start_y - 20,
        width: node_id_light.width * 0.8,
        height: node_id_light.height * 0.8,
        img: settings.dark ? cfg.dark_label : cfg.light_label,
      },
    });
  }

  group.addShape('text', {
    name: 'delay',
    attrs: {
      x: 0,
      y: shape.attr('y') + shape.attr('height') + 10,
      text: cfg.delay,
      ...options.stateStyles.default.delay,
    },
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
  const node_id_light = latexToImg(cfg.id);
  const node_id_dark = latexToImg(cfg.id, style.darkContent);
  cfg.light_label = node_id_light.dom;
  cfg.dark_label = node_id_dark.dom;

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
    const id = group.addShape('image', {
      attrs: {
        x:
          settings.view === 'full'
            ? start_x - 15 - (node_id_light.width * 0.8) / 2
            : start_x + (style.p + mw / 2 - (node_id_light.width * 0.8) / 2),
        y: start_y - 20,
        width: node_id_light.width * 0.8,
        height: node_id_light.height * 0.8,
        img: settings.dark ? cfg.dark_label : cfg.light_label,
      },
      name: 'label',
    });
  }

  group.sort();

  return shape;
};

const setStateRegular = (name, value, item) => {
  const neuron = item.get('keyShape');
  const group = item.getContainer();
  const change = item.getStateStyle(name);
  const default_style = item.getStateStyle('default');
  const dark_style = item.getStateStyle('dark');
  let reset = {};
  Object.keys(change).forEach((element) => {
    reset[element] = item.hasState('dark')
      ? pick(dark_style[element], Object.keys(change[element]))
      : pick(default_style[element], Object.keys(change[element]));
  });
  if (value) {
    Object.keys(change).forEach((child) => {
      const shape = group.find((element) => element.get('name') === child);
      shape.attr(change[child]);
    });
  } else {
    Object.keys(reset).forEach((child) => {
      const shape = group.find((element) => element.get('name') === child);
      shape.attr(reset[child]);
    });
  }

  if (name === 'simple') {
    const content = group.find((ele) => {
      return ele.get('name') === 'content';
    });
    const delay = group.find((ele) => {
      return ele.get('name') === 'delay';
    });
    const rules = group.find((ele) => {
      return ele.get('name') === 'rules';
    });
    const label = group.find((ele) => {
      return ele.get('name') === 'label';
    });

    neuron.attr({
      height: value
        ? Math.max(style.min_height, 20)
        : 2 * style.p + 20 + style.m + rules.attr('height'),
      width: value
        ? 2 * style.p + Math.max(String(content.attr('text')).length * 10, 20)
        : Math.max(
            rules.attr('width'),
            String(content.attr('text')).length * 10,
            style.min_width
          ),
    });

    neuron.attr({
      y: -neuron.attr('height') / 2,
      x: -neuron.attr('width') / 2,
    });

    content.attr({
      y: value ? 0 : -neuron.attr('height') / 2 + style.p,
    });
    delay.attr({
      y: neuron.attr('y') + neuron.attr('height') + 10,
    });

    value ? rules.hide() : rules.show();

    label.attr({
      x: value
        ? neuron.attr('x') + (neuron.attr('width') - label.attr('width')) / 2
        : neuron.attr('x') - 15 - label.attr('width'),
      y: neuron.attr('y') - 20,
    });
  }
};

const updateOutput = (cfg, item) => {
  const group = item.getContainer();
  const shape = group.find((ele) => {
    return ele.get('name') === 'neuron';
  });
  const indicator = group.find((ele) => {
    return ele.get('name') === 'output-indicator';
  });
  const latex_content = latexToImg(
    foldString(`${cfg.content}`),
    settings.dark ? style.darkContent : style.content
  );
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

  const content_width = String(cfg.content).length * 10;

  const mw =
    settings.view === 'full'
      ? Math.max(content_width, rules.attr('width'), style.min_width)
      : Math.max(content_width, 20);
  const mh =
    settings.view === 'full' ? 20 + rules.attr('height') + style.m : 20;

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
  });

  rules.attr({
    y: start_y + style.p + 20 + style.m,
    x: start_x + (style.p + mw / 2 - rules.attr('width') / 2),
  });

  delay.attr({
    text: cfg.delay,
    y: shape.attr('y') + shape.attr('height') + 10,
  });

  content.attr({
    text: cfg.content,
  });
};

const setStateEnvironment = (name, value, item) => {
  const shape = item.get('keyShape');
  if (name === 'spiking') {
    shape.attr({
      stroke: value
        ? style.primary
        : settings.dark
        ? style.darkContent
        : style.content,
      shadowBlur: value ? 10 : 0,
      shadowColor: style.primary,
    });
  } else if (name === 'forgetting') {
    shape.attr({
      stroke: value
        ? style.error
        : settings.dark
        ? style.darkContent
        : style.content,
      shadowBlur: value ? 10 : 0,
      shadowColor: style.error,
    });
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
    // setState: (name, value, item) => {
    //   return setStateEnvironment(name, value, item);
    // },
  });
  G6.registerNode('input', {
    options,
    update: (cfg, item) => {
      updateInput(cfg, item);
    },
    drawShape: (cfg, group) => {
      return drawInput(cfg, group);
    },
    // setState: (name, value, item) => {
    //   return setStateEnvironment(name, value, item);
    // },
  });
}
