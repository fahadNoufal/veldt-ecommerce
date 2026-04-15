import { useEffect, useRef } from 'react';
import '../../styles/success.css';

function Confetti() {
  const colors = ['#9B8B75','#F5C842','#E07B54','#6BBFA3','#D4A5C9','#7FAFD6','#F28B72'];
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    dur: 2 + Math.random() * 1.5,
    color: colors[i % colors.length],
    size: 6 + Math.random() * 6,
    rotate: Math.random() * 360,
  }));

  return (
    <div className="confetti-stage">
      {pieces.map(p => (
        <div key={p.id} className="cc" style={{
          left: `${p.left}%`,
          backgroundColor: p.color,
          width: p.size, height: p.size,
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.dur}s`,
          transform: `rotate(${p.rotate}deg)`,
        }} />
      ))}
    </div>
  );
}

export default function OrderSuccess({ count, onClose, onViewOrders }) {
  const orderId = useRef(`VLT${Date.now().toString(36).toUpperCase()}`);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <>
      <Confetti />
      <div className="success-overlay">
        <div className="success-card">
          <div className="check-wrap">
            <svg viewBox="0 0 88 88" fill="none">
              <circle cx="44" cy="44" r="40" stroke="#27AE60" strokeWidth="3" fill="#EBF6EE" />
              <path
                d="M26 44 L38 56 L62 32"
                stroke="#27AE60" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                style={{ strokeDasharray: 60, strokeDashoffset: 0, animation: 'drawcheck .5s .3s ease both' }}
              />
            </svg>
          </div>

          <div className="success-title">Order Placed!</div>
          <div className="success-sub">
            {count} item{count !== 1 ? 's' : ''} on the way 🎉<br />
            Estimated delivery: <strong>2–3 business days</strong>
          </div>
          <div className="success-order">Order #{orderId.current}</div>

          <div className="success-btns">
            <button className="success-btn secondary" onClick={onViewOrders}>View Orders</button>
            <button className="success-btn primary" onClick={onClose}>Continue Shopping</button>
          </div>
        </div>
      </div>
    </>
  );
}
