import { useState } from 'react';
import Stars from '../ui/Stars';

const fmt = p => `₹${Number(p).toLocaleString('en-IN')}`;

export default function ProductCard({ product, onClick }) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <div className="pcard" onClick={() => onClick(product)}>
      <div className="pcard-img-wrap">
        {!imgErr ? (
          <img
            className="pcard-img"
            src={`/${product.image_path}`}
            alt={product.name}
            onError={() => setImgErr(true)}
            loading="lazy"
          />
        ) : (
          <div
            className="pcard-placeholder"
            style={{ background: `hsl(${parseInt(product.id) * 37 % 360},18%,88%)` }}
          >
            <span style={{ fontSize: 11, color: 'var(--t3)', letterSpacing: '.05em' }}>
              {product.category}
            </span>
          </div>
        )}
        <button className="pcard-heart" onClick={e => e.stopPropagation()} title="Save">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
      </div>
      <div className="pcard-brand">{product.brand}</div>
      <div className="pcard-name">{product.name}</div>
      <div className="pcard-foot">
        <span className="pcard-price">{fmt(product.price)}</span>
        <Stars n={product.rating} />
      </div>
    </div>
  );
}
