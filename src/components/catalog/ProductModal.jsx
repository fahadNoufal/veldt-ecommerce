import { useState, useEffect } from 'react';
import Stars from '../ui/Stars';
import { addToCart } from '../../api';
import { useCart } from '../../context/CartContext';
import { useFlyToCart } from '../../hooks/useFlyToCart';
import '../../styles/modal.css';

const fmt = p => `₹${Number(p).toLocaleString('en-IN')}`;

export default function ProductModal({ product, onClose, onAdded }) {
  const [qty,     setQty]    = useState(1);
  const [added,   setAdded]  = useState(false);
  const [loading, setLoad]   = useState(false);
  const [imgErr,  setImgErr] = useState(false);
  const { adjustCart } = useCart();
  const flyToCart = useFlyToCart();

  // Escape key + body scroll lock
  useEffect(() => {
    const esc = e => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', esc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleAdd = async () => {
    setLoad(true);
    try {
      await addToCart(product.id);
      adjustCart(1);
      flyToCart(`/${product.image_path}`);
      setAdded(true);
      onAdded?.();
      setTimeout(() => setAdded(false), 2000);
    } catch {}
    setLoad(false);
  };

  const inStock  = product.quantity > 0;
  const lowStock = product.quantity > 0 && product.quantity <= 5;

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {/* Image */}
        <div className="modal-img-side">
          {!imgErr ? (
            <img
              className="modal-img"
              src={`/${product.image_path}`}
              alt={product.name}
              onError={() => setImgErr(true)}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%', minHeight: 400,
              background: `hsl(${parseInt(product.id) * 37 % 360},18%,88%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 12, color: 'var(--t3)' }}>{product.category}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="modal-body">
          <div className="modal-top">
            <div>
              <div className="modal-brand">{product.brand}</div>
              <div className="modal-name">{product.name}</div>
            </div>
            <button className="modal-close" onClick={onClose} title="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="modal-price">{fmt(product.price)}</div>

          <div className="modal-meta">
            <Stars n={product.rating} />
            {product.category && <span className="cat-tag">{product.category}</span>}
            {inStock
              ? <span className={`stock-tag${lowStock ? ' stock-low' : ''}`}>
                  {lowStock ? `Only ${product.quantity} left` : 'In Stock'}
                </span>
              : <span className="stock-tag stock-out">Out of Stock</span>
            }
          </div>

          <div className="modal-divider" />

          <div className="qty-row">
            <span className="qty-label">Qty</span>
            <div className="qty-ctrl">
              <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <div className="qty-val">{qty}</div>
              <button className="qty-btn" onClick={() => setQty(q => Math.min(product.quantity, q + 1))}>+</button>
            </div>
          </div>

          <button
            className={`add-btn${added ? ' added' : ''}`}
            onClick={handleAdd}
            disabled={!inStock || loading}
          >
            {added ? '✓ Added to Cart' : loading ? 'Adding…' : 'Add to Cart'}
          </button>

          <div className="modal-footer">
            <span>🚚 Free delivery over ₹999</span>
            <span>↩ Easy returns</span>
          </div>
        </div>
      </div>
    </div>
  );
}
