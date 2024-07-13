import style from '@/stores/styles';

const MathJax = window.MathJax;

export const convertMath = (text) => {
  const svg = MathJax.tex2svg(text).innerHTML;
  return svg;
};

/**
 * Fold a string of repeated characters
 * @param {string} str input string
 * @returns {string} folded string
 */
export const foldString = (str) => {
  let result = '';
  let count = 1;

  for (let i = 0; i < str.length; i++) {
    if (str[i] === str[i + 1]) {
      count++;
    } else {
      if (count > 1) {
        result += `${str[i - 1]}^{${count}}`;
      } else {
        result += str[i];
      }
      count = 1;
    }
  }
  return result;
};

const latexToSvg = (formula) => {
  let wrapper = MathJax.tex2svg(`${formula}`, {
    em: 10,
    ex: 5,
    display: true,
  });
  let mjOut = wrapper.getElementsByTagName('svg')[0];
  mjOut.style.display = 'inline-block';
  mjOut = mjOut.outerHTML;
  mjOut = `<span style="padding: 0em 0.4em; background-color: rgba(255, 255, 255, 0.2); border-radius: 0.2em; box-shadow: inset 0 0 4px rgba(0,0,0,0.2);">${mjOut}</span>`;

  const output = mjOut;
  return output;
};

export const replaceInlineMath = (text) => {
  const regex = /\$(.*?)\$/g;
  return text.replace(regex, (match, formula) => {
    return latexToSvg(formula);
  });
};

/**
 * Generate an SVG base64 string from a latex formula
 * @param {string} formula
 * @returns
 */
export const latexToImg = (formula, color = style.content) => {
  let wrapper = MathJax.tex2svg(`${formula}`, {
    em: 10,
    ex: 5,
    display: true,
  });
  let output = { svg: '', img: '' };
  let mjOut = wrapper.getElementsByTagName('svg')[0];
  mjOut.style.color = color;
  output.svg = mjOut.outerHTML;
  const width = mjOut.getAttribute('width');
  const height = mjOut.getAttribute('height');
  const px_height = parseInt(height.slice(0, -2) * 10);
  const px_width = parseInt(width.slice(0, -2) * 10);

  const src =
    'data:image/svg+xml;base64,' +
    window.btoa(unescape(encodeURIComponent(output.svg)));

  return { dom: src, height: px_height, width: px_width };
};
