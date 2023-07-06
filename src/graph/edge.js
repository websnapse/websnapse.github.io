import G6 from '@antv/g6';
import style from '@/stores/styles';
import { pick } from 'lodash';

const options = {
  stateStyles: {
    hover: {
      shadowBlur: 10,
      shadowColor: style.primary,
    },
    selected: {
      stroke: style.primary,
      lineWidth: 3,
      endArrow: {
        path: 'M 0,0 L 12,6 L 9,0 L 12,-6 Z',
        fill: style.primary,
      },
    },
    dark: {
      lineDash: null,
      lineDashOffset: null,
      lineAppendWidth: 20,
      shadowBlur: 0,
      shadowColor: style.primary,
      lineWidth: style.lineInactive,
      stroke: style.darkContent,
      endArrow: {
        path: 'M 0,0 L 12,6 L 9,0 L 12,-6 Z',
        fill: style.darkContent,
      },
    },
    spiking: {
      stroke: style.primary,
      endArrow: {
        path: 'M 0,0 L 13,8 L 9,0 L 13,-8 Z',
        fill: style.primary,
        strokeOpacity: 0,
      },
      lineWidth: 4,
      lineDash: style.lineDash,
    },
    default: {
      lineDash: null,
      lineDashOffset: null,
      lineAppendWidth: 20,
      shadowBlur: 0,
      shadowColor: style.primary,
      lineWidth: style.lineInactive,
      stroke: style.content,
      endArrow: {
        path: 'M 0,0 L 12,6 L 9,0 L 12,-6 Z',
        fill: style.content,
        strokeOpacity: 1,
      },
    },
  },
};

export default function initalizeEdge() {
  G6.registerEdge(
    'synapse',
    {
      options,
      drawShape(cfg, group) {
        const { startPoint, endPoint } = cfg;
        const shape = group.addShape('path', {
          attrs: {
            ...options.stateStyles.default,
            path: [
              ['M', startPoint.x, startPoint.y],
              ['L', endPoint.x, endPoint.y],
            ],
          },
          name: 'path-shape',
        });
        return shape;
      },
      setState(name, value, item) {
        const shape = item.get('keyShape');
        const model = item.getModel();
        const change = item.getStateStyle(name);
        const dark_style = item.getStateStyle('dark');
        const original_style = item.getStateStyle('default');
        const reset = item.hasState('dark')
          ? pick(dark_style, Object.keys(change))
          : pick(original_style, Object.keys(change));

        if (name === 'dark') {
          shape.attr(change);
          const group = item.getContainer();
          const label = group.find(
            (element) => element.get('name') === 'text-shape'
          );
          const labelBg = group.find(
            (element) => element.get('name') === 'text-bg-shape'
          );

          labelBg.attr({
            fill: value ? style.dark : style.light,
          });
          label.attr('fill', value ? style.darkContent : style.content);
        }

        if (value) {
          shape.attr(change);
          if (name === 'spiking') {
            let index = 0;
            shape.animate(
              () => {
                index = (index + 1) % 6;
                const res = {
                  lineDash: style.lineDash,
                  lineDashOffset: -index,
                };
                return res;
              },
              {
                repeat: true,
                duration: model.duration ?? 1000,
              }
            );
          }
        } else {
          shape.stopAnimate();
          shape.attr(reset);
        }
      },
    },
    'quadratic'
  );
}
