const MathJax = window.MathJax;

export const convertMath = (text) => {
  const svg = MathJax.tex2svg(text).innerHTML;
  return svg;
};

export const getMathWidth = (text) => {
  const svg = MathJax.tex2svg(text).innerHTML;
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, 'image/svg+xml');
  const svg_dom = doc.querySelector('svg');
  const width = svg_dom.getAttribute('width');
  const height = svg_dom.getAttribute('height');
  const px_height = parseInt(height.slice(0, -2) * 12);
  const px_width = parseInt(width.slice(0, -2) * 12);
  return { dom: svg, height: px_height, width: px_width };
};

export const latexToImg = (formula) => {
  let wrapper = MathJax.tex2svg(`${formula}`, {
    em: 10,
    ex: 5,
    display: true,
  });
  let output = { svg: '', img: '' };
  let mjOut = wrapper.getElementsByTagName('svg')[0];
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
