
const g = typeof window !== 'undefined' ? window : globalThis;
const ReactDOM = g.ReactDOM;
export default ReactDOM;
export const {
  createPortal,
  flushSync,
  findDOMNode,
  unmountComponentAtNode,
  createRoot,
  hydrateRoot,
  version
} = ReactDOM;
