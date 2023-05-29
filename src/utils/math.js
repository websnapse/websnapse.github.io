import style from '@/stores/styles';
import system from '@/stores/system';

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

/**
 * Generate an SVG base64 string from a latex formula
 * @param {string} formula
 * @returns
 */
export const latexToImg = (formula) => {
  let wrapper = MathJax.tex2svg(`${formula}`, {
    em: 10,
    ex: 5,
    display: true,
  });
  let output = { svg: '', img: '' };
  let mjOut = wrapper.getElementsByTagName('svg')[0];
  mjOut.style.color = system.dark ? style.darkContent : style.dark;
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
