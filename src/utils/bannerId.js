export default function (b)  {
  if (!b.dt[0] || !b.c) return '';
  return b.id || (b.type.slice(0,1)+b.dt[0].replace(/-/g,'')+b.c[0].id.charAt(0)+b.c[0].id.slice(-4)).toUpperCase()
}