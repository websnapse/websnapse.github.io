const MathJax = window.MathJax;

export const convertMath = (text) => {
  const svg = MathJax.tex2svg(text).innerHTML;
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, 'image/svg+xml');
  const width = doc.querySelector('svg').getAttribute('width');
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
