import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import CartBadge from '../ui/CartBadge';
import '../../styles/header.css';

export default function Header({ page, setPage, onSearch }) {
  const { cartCount, cartAnimating } = useCart();
  const [draft, setDraft] = useState('');

  const commit = () => {
    const q = draft.trim();
    if (q) onSearch(q);
  };

  const clear = () => {
    setDraft('');
    onSearch('');
  };

  return (
    <header className="hdr">
      <div className="hdr-inner">

        {/* Brand */}
        <button className="brand" onClick={() => { clear(); setPage('catalog'); }}>
          <div className="brand-name">Veldt</div>
          <div className="brand-sub">est. 2019</div>
        </button>

        {/* Nav */}
        <nav className="nav">
          {[['catalog', 'Catalog'], ['cart', 'Cart'], ['orders', 'Orders']].map(([id, label]) => (
            <button
              key={id}
              className={`nav-btn${page === id ? ' active' : ''}`}
              onClick={() => { if (id === 'catalog') clear(); setPage(id); }}
            >
              {label}
            </button>
          ))}
          <button
            className={`nav-btn stylist-nav-btn${page === 'stylist' ? ' active' : ''}`}
            onClick={() => setPage('stylist')}
          >
            <span style={{ fontSize: 10, marginRight: 4 }}>✦</span>Stylist
          </button>
        </nav>

        {/* Search */}
        <div className="search-area">
          <div className="search-box">
            <svg className="search-ico" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-inp"
              type="text"
              placeholder="Describe what you're looking for…"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') clear(); }}
            />
            {draft && (
              <button className="search-clear" onClick={clear}>×</button>
            )}
          </div>
          <button className="search-btn" onClick={commit}>Search</button>
        </div>

        {/* Cart icon */}
        <div className="hdr-actions">
          <button className={`cart-icon-btn${cartAnimating ? ' cart-icon-btn--bounce' : ''}`} title="Cart" onClick={() => setPage('cart')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {cartCount > 0 && <CartBadge count={cartCount} />}
          </button>
        </div>

      </div>
    </header>
  );
}
