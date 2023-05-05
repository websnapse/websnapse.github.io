import G6 from '@antv/g6';
import { primary, black, lineDash } from './styles';

export default function initalizeEdge() {
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
            stroke: 'white',
            lineWidth: 5,
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
      afterDraw(cfg, group) {
        const startPoint = cfg.startPoint;

        group.addShape('circle', {
          attrs: {
            x: startPoint.x,
            y: startPoint.y,
            fill: primary,
            r: 8,
            opacity: 1,
          },
          name: 'circle-shape',
          visible: false,
        });
      },
      setState(name, value, item) {
        const shape = item.get('keyShape');

        const circle = item
          .get('group')
          .find((e) => e.get('name') === 'circle-shape');

        if (name === 'animate') {
          value ? circle.show() : circle.hide();
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
}
