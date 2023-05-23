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
};

export default function initalizeEdge() {
  G6.registerEdge(
    'circle-running',
    {
      options,
      afterUpdate(cfg, item) {
        const group = item.getContainer();
        const label = group.find((e) => e.get('name') === 'weight');
        const path = item.getKeyShape();
        const point = path.getPoint(0.5);
        label.attr({
          x: point.x,
          y: point.y,
        });
      },
      draw(cfg, group) {
        const { startPoint, endPoint } = cfg;
        this.drawShape(cfg, group);
        const keyShape = group.get('children')[0];

        cfg.label = cfg.weight;
        group.addShape('text', {
          attrs: {
            text: cfg.weight,
            x: (startPoint.x + endPoint.x) / 2,
            y: (startPoint.y + endPoint.y) / 2,
            fontSize: 20,
            textAlign: 'center',
            textBaseline: 'middle',
            fill: style.black,
            stroke: style.base,
            lineWidth: 10,
          },
          name: 'weight',
        });

        return keyShape;
      },
      afterDraw(cfg, group) {
        const startPoint = cfg.startPoint;

        group.addShape('circle', {
          attrs: {
            x: startPoint.x,
            y: startPoint.y,
            fill: style.primary,
            r: 8,
            opacity: 1,
          },
          name: 'circle-shape',
          visible: false,
        });
      },
      setState(name, value, item) {
        const shape = item.get('keyShape');
        const model = item.getModel();

        const circle = item
          .get('group')
          .find((e) => e.get('name') === 'circle-shape');

        if (name === 'animate') {
          value ? circle.show() : circle.hide();
          shape.attr('stroke', value ? style.primary : style.black);
          shape.attr('lineWidth', value ? 5 : 2);
          // change endarrow stroke color
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
                  lineDashOffset: index,
                };
                // return the params for this frame
                return res;
              },
              {
                repeat: true,
                duration: model.duration ?? 1000,
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
                duration: model.duration ?? 1000, // the duration for executing once
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
