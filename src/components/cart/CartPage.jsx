import { useState, useEffect } from 'react';
import { getCart, removeFromCart, updateCart, placeOrder } from '../../api';
import { useCart } from '../../context/CartContext';
import Toast from '../ui/Toast';
import Spinner from '../ui/Spinner';
import '../../styles/cart.css';

const fmt = p => `₹${Number(p).toLocaleString('en-IN')}`;

export default function CartPage({ onBack, onOrderSuccess }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [toast,   setToast]   = useState(null);
  const { adjustCart, setCount } = useCart();

  const load = async () => {
    setLoading(true);
    try { setItems(await getCart()); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async pid => {
    try {
      await removeFromCart(pid);
      setItems(prev => prev.filter(i => i.product_id !== pid));
      adjustCart(-1);
      setToast({ msg: 'Item removed', type: 'ok' });
    } catch {
      setToast({ msg: 'Failed to remove', type: 'err' });
    }
  };

  const changeQty = async (pid, qty) => {
    if (qty <= 0) { remove(pid); return; }
    try {
      await updateCart(pid, qty);
      setItems(prev => prev.map(i =>
        i.product_id === pid ? { ...i, quantity: qty, subtotal: qty * i.price } : i
      ));
    } catch {}
  };

  const checkout = async () => {
    setPlacing(true);
    try {
      await placeOrder();
      const count = items.length;
      setCount(0);
      onOrderSuccess(count);
    } catch {
      setToast({ msg: 'Something went wrong', type: 'err' });
    }
    setPlacing(false);
  };

  const total    = items.reduce((s, i) => s + i.subtotal, 0);
  const shipping = total >= 999 ? 0 : 99;

  if (loading) return <Spinner />;

  return (
    <div className="cart-wrap">
      <h1 className="sec-title">Your Cart</h1>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      {items.length === 0 ? (
        <div className="empty-cart">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          <p style={{ color: 'var(--t2)', fontSize: 15 }}>Your cart is empty</p>
          <button className="shop-btn" onClick={onBack}>Continue Shopping</button>
        </div>
      ) : (
        <div className="cart-grid">
          {/* Items */}
          <div className="cart-list">
            {items.map(item => (
              <div key={item.product_id} className="cart-item">
                <img
                  className="cart-img"
                  src={`/${item.image_path}`}
                  alt={item.name}
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <div>
                  <div className="ci-brand">{item.brand}</div>
                  <div className="ci-name">{item.name}</div>
                  <div className="ci-foot">
                    <span className="ci-price">{fmt(item.subtotal)}</span>
                    <div className="ci-actions">
                      <div className="qty-ctrl">
                        <button className="qty-btn" onClick={() => changeQty(item.product_id, item.quantity - 1)}>−</button>
                        <div className="qty-val">{item.quantity}</div>
                        <button className="qty-btn" onClick={() => changeQty(item.product_id, item.quantity + 1)}>+</button>
                      </div>
                      <button className="rm-btn" onClick={() => remove(item.product_id)}>Remove</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <div className="sum-title">Order Summary</div>
            <div className="sum-row"><span>{items.length} item{items.length !== 1 ? 's' : ''}</span><span>{fmt(total)}</span></div>
            <div className="sum-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : fmt(shipping)}</span></div>
            {shipping > 0 && (
              <div className="sum-hint">Add {fmt(999 - total)} more for free shipping</div>
            )}
            <div className="sum-total"><span>Total</span><span>{fmt(total + shipping)}</span></div>
            <button className="checkout-btn" onClick={checkout} disabled={placing}>
              {placing ? 'Placing Order…' : 'Place Order'}
            </button>
            <button className="continue-btn" onClick={onBack}>Continue Shopping</button>
          </div>
        </div>
      )}
    </div>
  );
}
