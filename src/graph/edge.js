import G6 from '@antv/g6';
import style from '@/stores/styles';
import settings from '@/stores/settings';

const options = {
  stateStyles: {
    hover: {
      shadowBlur: 10,
      shadowColor: style.primary,
    },
    default: {
      lineAppendWidth: 20,
      shadowBlur: 0,
      shadowColor: style.primary,
      lineWidth: 2,
      stroke: settings.dark ? style.darkContent : style.content,
      endArrow: {
        path: 'M 0,0 L 12,6 L 9,0 L 12,-6 Z',
        fill: settings.dark ? style.darkContent : style.content,
      },
    },
    selected: {
      stroke: style.primary,
      lineWidth: 3,
      endArrow: {
        path: 'M 0,0 L 12,6 L 9,0 L 12,-6 Z',
        fill: style.primary,
      },
    },
  },
  style: {
    shadowBlur: 0,
    shadowColor: style.primary,
    lineWidth: 2,
    stroke: settings.dark ? style.darkContent : style.content,
    endArrow: {
      path: 'M 0,0 L 12,6 L 9,0 L 12,-6 Z',
      fill: settings.dark ? style.darkContent : style.content,
    },
  },
};

export default function initalizeEdge() {
  G6.registerEdge(
    'synapse',
    {
      options,
      labelAutoRotate: true,
      afterUpdate(cfg, item) {
        const group = item.getContainer();
        const label = group.find(
          (element) => element.get('name') === 'text-shape'
        );
        const path = group.find(
          (element) => element.get('name') === 'path-shape'
        );
        const labelBg = group.find(
          (element) => element.get('name') === 'text-bg-shape'
        );

        // update the colors of the path and the arrow
        path.attr({
          stroke: settings.dark ? style.darkContent : style.content,
        });
        path.attr('endArrow', {
          path: 'M 0,0 L 12,6 L 9,0 L 12,-6 Z',
          fill: settings.dark ? style.darkContent : style.content,
        });

        label.attr('fill', settings.dark ? style.darkContent : style.content);
        labelBg.attr({
          fill: settings.dark ? style.dark : style.light,
          radius: 5,
          padding: [5, 5, 5, 5],
        });
      },
      drawShape(cfg, group) {
        const { startPoint, endPoint } = cfg;
        const shape = group.addShape('path', {
          attrs: {
            lineAppendWidth: 30,
            stroke: settings.dark ? style.darkContent : style.content,
            lineWidth: 2,
            endArrow: {
              path: 'M 0,0 L 12,6 L 9,0 L 12,-6 Z',
              fill: settings.dark ? style.darkContent : style.content,
            },
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

        if (name === 'spiking') {
          shape.attr('stroke', value ? style.primary : style.content);
          shape.attr('lineWidth', value ? 5 : 2);
          shape.attr('endArrow', {
            path: 'M 0,0 L 12,6 L 9,0 L 12,-6 Z',
            fill: value ? style.primary : style.content,
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
            shape.attr({
              stroke: settings.dark ? style.darkContent : style.content,
              endArrow: {
                path: 'M 0,0 L 12,6 L 9,0 L 12,-6 Z',
                fill: settings.dark ? style.darkContent : style.content,
              },
            });
          }
        } else {
          const attrs = item.getStateStyle(name);
          const original_style = {
            lineAppendWidth: 20,
            shadowBlur: 0,
            shadowColor: style.primary,
            lineWidth: 2,
            stroke: settings.dark ? style.darkContent : style.content,
            endArrow: {
              path: 'M 0,0 L 12,6 L 9,0 L 12,-6 Z',
              fill: settings.dark ? style.darkContent : style.content,
            },
          };

          value ? shape.attr(attrs) : shape.attr(original_style);
        }
      },
    },
    'quadratic' // extend the built-in edge 'cubic'
  );
}
