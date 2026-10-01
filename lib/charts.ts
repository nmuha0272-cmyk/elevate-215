export function scale(values: number[], size: number, pad: number) {
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const span = max - min || 1;
  return {
    max,
    points: values.map((v, i) => {
      const x = pad + (i / Math.max(1, values.length - 1)) * (size - pad * 2);
      const y = size - pad - ((v - min) / span) * (size - pad * 2);
      return { x, y };
    }),
  };
}

export function linePath(points: { x: number; y: number }[]) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

export function areaPath(points: { x: number; y: number }[], floor: number) {
  if (!points.length) return '';
  const first = points[0];
  const last = points[points.length - 1];
  return `${linePath(points)} L${last.x.toFixed(1)},${floor} L${first.x.toFixed(1)},${floor} Z`;
}

export function arcPath(cx: number, cy: number, outer: number, inner: number, from: number, to: number) {
  const a = (r: number, frac: number) => {
    const angle = frac * Math.PI * 2 - Math.PI / 2;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  };
  const large = to - from > 0.5 ? 1 : 0;
  const [x1, y1] = a(outer, from);
  const [x2, y2] = a(outer, to);
  const [x3, y3] = a(inner, to);
  const [x4, y4] = a(inner, from);
  return `M${x1.toFixed(2)},${y1.toFixed(2)} A${outer},${outer} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)} L${x3.toFixed(2)},${y3.toFixed(2)} A${inner},${inner} 0 ${large} 0 ${x4.toFixed(2)},${y4.toFixed(2)} Z`;
}
