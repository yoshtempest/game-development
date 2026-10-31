export function centersCloseEnough(a: DOMRect, b: DOMRect, factor: number) {
  const ax = a.left + a.width / 2;
  const ay = a.top + a.height / 2;
  const bx = b.left + b.width / 2;
  const by = b.top + b.height / 2;
  const reach = Math.max(b.width, b.height) * factor;
  return Math.hypot(ax - bx, ay - by) <= reach;
}