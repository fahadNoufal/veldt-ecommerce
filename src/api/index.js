// ─── Base helpers ──────────────────────────────────────────────────────────────
async function get(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function post(path) {
  const r = await fetch(path, { method: 'POST' });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function del(path) {
  const r = await fetch(path, { method: 'DELETE' });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function put(path, body) {
  const r = await fetch(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// ─── Products ─────────────────────────────────────────────────────────────────
export const getProducts = (sort = 'default', page = 1, limit = 20) =>
  get(`/api/products?${new URLSearchParams({ sort, page, limit })}`);

export const searchProducts = (q, topK = 20) =>
  get(`/api/products/search?q=${encodeURIComponent(q)}&top_k=${topK}`);

export const getProduct = (id) => get(`/api/products/${id}`);

// ─── Cart ─────────────────────────────────────────────────────────────────────
export const getCart       = ()          => get('/api/cart');
export const addToCart     = (pid)       => post(`/api/cart/${pid}`);
export const removeFromCart= (pid)       => del(`/api/cart/${pid}`);
export const updateCart    = (pid, qty)  => put(`/api/cart/${pid}`, { quantity: qty });

// ─── Orders ───────────────────────────────────────────────────────────────────
export const placeOrder = () => post('/api/orders');
export const getOrders  = () => get('/api/orders');

// ─── Expose search globally (as requested) ────────────────────────────────────
if (typeof window !== 'undefined') {
  window.search_product = searchProducts;
}
