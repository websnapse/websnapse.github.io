import G6 from '@antv/g6';
import style from '@/stores/styles';

const options = {
  stateStyles: {
    hover: {
      shadowBlur: 10,
    },
    default: {
      shadowBlur: 0,
      shadowColor: style.primary,
      lineWidth: 2,
      stroke: style.black,
      endArrow: {
        path: 'M 0,0 L 20,4 L 20,-4 Z',
        d: 5,
        stroke: style.black,
        strokeOpacity: 0,
        fill: style.black,
      },
    },
    selected: {
      stroke: style.primary,
      lineWidth: 3,
      endArrow: {
        path: 'M 0,0 L 23,4 L 23,-4 Z',
        d: 5,
        stroke: style.primary,
        strokeOpacity: 0,
        fill: style.primary,
      },
    },
  },
  style: {
    shadowBlur: 0,
    shadowColor: style.primary,
    lineWidth: 2,
    stroke: style.black,
    endArrow: {
      path: 'M 0,0 L 20,4 L 20,-4 Z',
      d: 5,
      fill: style.black,
    },
  },
  labelCfg: {
    style: {
      fill: style.dark,
      fontSize: 20,
      stroke: style.base,
      lineWidth: 20,
      autorotate: true,
    },
  },
};

export default function initalizeEdge() {
  G6.registerEdge(
    'synapse',
    {
      options,
      setState(name, value, item) {
        const shape = item.get('keyShape');
        const model = item.getModel();

        if (name === 'spiking') {
          shape.attr('stroke', value ? style.primary : style.black);
          shape.attr('lineWidth', value ? 5 : 2);
          shape.attr('endArrow', {
            path: 'M 0,0 L 20,4 L 20,-4 Z',
            d: 5,
            fill: value ? style.primary : style.black,
            strokeOpacity: 0,
          });
          if (value) {
            let index = 0;
            shape.animate(
              () => {
                index++;
                if (index > 5) {
                  index = 0;
                }
                const res = {
                  lineDash: style.lineDash,
                  lineDashOffset: -index,
                };
                // return the params for this frame
                return res;
              },
              {
                repeat: true,
                duration: model.duration ?? 1000,
              }
            );
          } else {
            shape.stopAnimate();
            shape.attr('lineDash', null);
            shape.attr('lineDashOffset', null);
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
}
