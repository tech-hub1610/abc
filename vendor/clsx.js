
export function clsx(...args) {
  let str = '';
  for (let i = 0; i < args.length; i++) {
    const val = args[i];
    if (val) {
      if (typeof val === 'string') {
        str += (str ? ' ' : '') + val;
      } else if (typeof val === 'object') {
        if (Array.isArray(val)) {
          const res = clsx(...val);
          if (res) str += (str ? ' ' : '') + res;
        } else {
          for (const key in val) {
            if (val[key]) str += (str ? ' ' : '') + key;
          }
        }
      }
    }
  }
  return str;
}
export default clsx;
