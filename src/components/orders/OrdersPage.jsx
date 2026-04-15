import { useState, useEffect } from 'react';
import { getOrders } from '../../api';
import Spinner from '../ui/Spinner';
import '../../styles/orders.css';

const fmt = p => `₹${Number(p).toLocaleString('en-IN')}`;

export default function OrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="orders-wrap">
      <h1 className="sec-title" style={{ marginBottom: 20 }}>Order History</h1>

      {orders.length === 0 ? (
        <div className="empty" style={{ padding: '80px 0' }}>
          <p>No orders yet</p>
        </div>
      ) : (
        orders.map(o => (
          <div key={o.id} className="order-item">
            <img
              className="order-img"
              src={`/${o.product_image}`}
              alt={o.product_name}
              onError={e => { e.target.style.display = 'none'; }}
            />
            <div>
              <div className="order-brand">{o.product_brand}</div>
              <div className="order-name">{o.product_name}</div>
              <div className="order-date">
                {new Date(o.ordered_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })} · Qty: {o.quantity}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="order-price">{fmt(o.total_price)}</div>
              <div style={{ marginTop: 8 }}>
                <span className="order-status">{o.status}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
