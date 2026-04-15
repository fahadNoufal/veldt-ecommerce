import { useRef, useEffect } from 'react';
import { useStylist } from '../../context/StylistContext';
import '../../styles/stylist.css';


const ORDINALS = ['1st','2nd','3rd','4th','5th','6th','7th','8th'];
const fmt = p => p != null ? `₹${Number(p).toLocaleString('en-IN')}` : '';

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function formatText(text) {
  return escHtml(text)
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/\n/g,'<br>');
}

// ── Fix 3 & 4: Products BEFORE message text, with price ──────────────────────
function ProductGrid({ products, onAdd }) {
  const { ids, urls, details } = products;
  if (!ids?.length) return null;

  return (
    <div className="sty-products">
      <div className="sty-prod-label">✦ &nbsp;{ids.length} Styles Found</div>
      <div className="sty-prod-grid">
        {ids.map((id, i) => {
          const imgUrl = urls?.[i] || `/images/img_${id}.png`;
          const det    = details?.[i];
          const ord    = ORDINALS[i] || `${i + 1}th`;
          return (
            <div
              key={id}
              className="sty-pcard"
              title={`Click to add ${ord} item to cart`}
              onClick={() => onAdd(ord)}
            >
              <img
                src={imgUrl}
                alt={`Product ${id}`}
                onError={e => { e.target.style.background = '#EDD5C8'; e.target.removeAttribute('src'); }}
              />
              <div className="spc-label">
                <span className="spc-ord">{ord}</span>
                {det?.price != null && (
                  <span className="spc-price">{fmt(det.price)}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Fix 2: Cart cards WITH image ──────────────────────────────────────────────
function CartGrid({ cartItems }) {
  if (!cartItems?.length) return null;
  let total = 0;
  const rows = cartItems.map(item => {
    const imgUrl   = item.image_path
      ? `/${item.image_path}`
      : item.product_id ? `/images/img_${item.product_id}.png` : '';
    const subtotal = item.subtotal || (parseFloat(item.price || 0) * parseInt(item.quantity || 1));
    total += subtotal;
    return { ...item, imgUrl, subtotal };
  });

  return (
    <>
      <div className="sty-cart">
        <div className="sty-cart-label">
          🛒 &nbsp;Your Cart — {rows.length} item{rows.length !== 1 ? 's' : ''}
        </div>
        <div className="sty-cart-grid">
          {rows.map(item => (
            <div key={item.product_id || item.cart_id} className="sty-ccard">
              {item.imgUrl && (
                <img
                  className="sty-ccard-img"
                  src={item.imgUrl}
                  alt={item.name || ''}
                  onError={e => { e.target.style.background = '#EDD5C8'; e.target.removeAttribute('src'); }}
                />
              )}
              <div className="cc-name">{item.name || 'Item'}</div>
              {item.brand && <div className="cc-qty">{item.brand}</div>}
              <div className="cc-qty">Qty {item.quantity}</div>
              <div className="cc-price">{fmt(item.price)}</div>
            </div>
          ))}
        </div>
      </div>
      {total > 0 && (
        <div className="sty-cart-total">
          Total: <strong>{fmt(total)}</strong>
        </div>
      )}
    </>
  );
}

// ── Message row — Fix 4: products BEFORE text, Fix 5: view cart link ──────────
function MessageRow({ msg, onAdd, onViewCart }) {
  if (msg.role === 'user') {
    return (
      <div className="sty-msg user">
        <div className="sty-avatar usr">You</div>
        <div className="sty-bubble">{msg.text}</div>
      </div>
    );
  }

  // AI: products FIRST, then text bubble, then cart if applicable
  return (
    <>
      {/* Fix 4: suggestions render BEFORE the text message */}
      {msg.products?.ids?.length > 0 && (
        <ProductGrid products={msg.products} onAdd={onAdd} />
      )}

      {msg.kind === 'cart' && msg.cartItems?.length > 0 && (
        <CartGrid cartItems={msg.cartItems} />
      )}

      {msg.text && (
        <div className="sty-msg ai">
          <div className="sty-avatar ai">✦</div>
          <div className="sty-bubble">
            <span dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} />
            {/* Fix 5: view cart link after add-to-cart confirmation */}
            {msg.didAdd && (
              <span
                className="sty-view-cart-link"
                onClick={onViewCart}
              >
                View Cart →
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ── Main StylistPage ──────────────────────────────────────────────────────────
const STARTERS = [
  'I have a wedding to attend',
  'Looking for something for a night out',
  'College reunion this weekend',
  "What's your return policy?",
  'View my cart',
];

export default function StylistPage({ onViewCart }) {
  const {
    messages, connected, awaitingReply, statusText,
    sendMessage,
  } = useStylist();

  const msgsRef = useRef(null);
  const taRef   = useRef(null);

  useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
    }
  }, [messages, statusText]);

  const doSend = () => {
    const txt = taRef.current?.value?.trim();
    if (!txt) return;
    if (sendMessage(txt)) {
      taRef.current.value = '';
      taRef.current.style.height = 'auto';
    }
  };

  const quickSend = (text) => {
    sendMessage(text);
    if (taRef.current) {
      taRef.current.value = '';
      taRef.current.style.height = 'auto';
    }
  };

  const quickAddToCart = (ord) => quickSend(`Add the ${ord} item to my cart`);

  return (
    <div className="stylist-shell">
      {/* Sub-header */}
      <div className="sty-header">
        <div className="sty-logo">
          <svg viewBox="0 0 24 24"><path d="M12 2C8 2 5 6 5 9c0 2 1 4 2.5 5.5L6 20h12l-1.5-5.5C18 13 19 11 19 9c0-3-3-7-7-7z"/></svg>
        </div>
        <div className="sty-hdr-text">
          <h2>Elara</h2>
          <p>Your Personal AI Stylist</p>
        </div>
        <div className="sty-status">
          <div className={`sty-dot${connected ? '' : ' off'}`} />
          <span>{connected ? 'Online' : 'Reconnecting…'}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="sty-messages" ref={msgsRef}>
        <div className="sty-messages-inner">
          {messages.length === 0 && (
            <div className="sty-welcome">
              <div className="sty-welcome-icon">✦</div>
              <h3>Find Your Perfect Style</h3>
              <p>Tell me about your occasion, and I'll curate a selection just for you — from our handpicked collection.</p>
              <div className="sty-chips">
                {STARTERS.map(t => (
                  <button key={t} className="sty-chip" onClick={() => quickSend(t)}>{t}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <MessageRow
              key={msg.id}
              msg={msg}
              onAdd={quickAddToCart}
              onViewCart={onViewCart}
            />
          ))}

          {statusText && (
            <div className="sty-thinking">
              <div className="sty-dots"><span /><span /><span /></div>
              <span>{statusText}</span>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="sty-input-bar">
        <div className="sty-input-wrap">
          <textarea
            ref={taRef}
            className="sty-textarea"
            rows={1}
            placeholder="Tell me about the occasion…"
            disabled={awaitingReply}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); }
            }}
          />
          <button className="sty-send" onClick={doSend} disabled={awaitingReply || !connected} title="Send">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
        <p className="sty-hint">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}