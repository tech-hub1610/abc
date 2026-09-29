
const g = typeof window !== 'undefined' ? window : globalThis;
export const createRoot = g.ReactDOM.createRoot;
export const hydrateRoot = g.ReactDOM.hydrateRoot;
export default { createRoot, hydrateRoot };
