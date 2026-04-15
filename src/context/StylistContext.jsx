import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useCart } from './CartContext';
import { getCart, getProduct } from '../api';

const StylistContext = createContext(null);

export function StylistProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [awaitingReply, setAwaiting] = useState(false);
  const [statusText, setStatusText] = useState('');

  const ws = useRef(null);
  const reconnTimer = useRef(null);
  const pendingProds = useRef(null);

  const { adjustCart, setCount, triggerAnimation } = useCart();

  // ── Connect ────────────────────────────────────────────────────────────────
  const connect = useCallback(() => {
    const url = `ws://${location.host}/ws`;
    const sock = new WebSocket(url);
    ws.current = sock;

    sock.onopen = () => { setConnected(true); clearTimeout(reconnTimer.current); };
    sock.onclose = () => { setConnected(false); reconnTimer.current = setTimeout(connect, 3000); };
    sock.onerror = () => setConnected(false);
    sock.onmessage = (e) => {
      let ev; try { ev = JSON.parse(e.data); } catch { return; }
      handleEvent(ev);
    };
  }, []); // eslint-disable-line

  useEffect(() => {
    connect();
    return () => { clearTimeout(reconnTimer.current); ws.current?.close(); };
  }, [connect]);

  // ── Event handler ──────────────────────────────────────────────────────────
  const handleEvent = useCallback(async (ev) => {
    switch (ev.type) {

      case 'status':
        setStatusText(ev.content || '');
        break;

      case 'products': {
        // Fetch full product details (including price) from the REST API
        const ids = ev.ids || [];
        const urls = ev.image_urls || [];

        const details = await Promise.all(
          ids.map(id =>
            getProduct(id).catch(() => ({ id, name: '', price: null, brand: '' }))
          )
        );

        pendingProds.current = { ids, urls, details };
        break;
      }

      case 'cart': {
        setStatusText('');
        const cartItems = ev.cart_items || [];
        // Immediately increment so the badge updates at once, then correct with real count
        adjustCart(cartItems.length > 0 ? cartItems.length : 1);
        triggerAnimation();
        getCart().then(items => setCount(items.length)).catch(() => { });
        setMessages(prev => [...prev, {
          id: Date.now(), role: 'ai', kind: 'cart', cartItems, text: '',
        }]);
        break;
      }

      case 'message': {
        setStatusText('');
        setAwaiting(false);

        const text = ev.content || '';
        const products = pendingProds.current;
        pendingProds.current = null;

        const didAdd = /\b(added|adding).{0,40}(cart|bag)\b/i.test(text);
        const didOrder = /\b(order (placed|confirmed)|delivery in|on the way)\b/i.test(text);
        if (didAdd) {
          // Instantly bump the count, then correct asynchronously
          adjustCart(1);
          triggerAnimation();
          getCart().then(items => setCount(items.length)).catch(() => { });
        }
        if (didOrder) setCount(0);

        setMessages(prev => [...prev, {
          id: Date.now(), role: 'ai', kind: 'message',
          text,
          products: products || null,
          didAdd,      // flag to show "View Cart" link
        }]);
        break;
      }

      case 'error': {
        setStatusText('');
        setAwaiting(false);
        setMessages(prev => [...prev, {
          id: Date.now(), role: 'ai', kind: 'message',
          text: `⚠️ ${ev.content || 'Something went wrong.'}`,
          products: null, didAdd: false,
        }]);
        break;
      }
    }
  }, [adjustCart, setCount, triggerAnimation]);

  const sendMessage = useCallback((text) => {
    const msg = text.trim();
    if (!msg || awaitingReply || ws.current?.readyState !== WebSocket.OPEN) return false;
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', kind: 'message', text: msg }]);
    setAwaiting(true);
    setStatusText('');
    ws.current.send(JSON.stringify({ message: msg }));
    return true;
  }, [awaitingReply]);

  const clearHistory = useCallback(() => setMessages([]), []);

  return (
    <StylistContext.Provider value={{
      messages, connected, awaitingReply, statusText,
      sendMessage, clearHistory,
    }}>
      {children}
    </StylistContext.Provider>
  );
}

export const useStylist = () => useContext(StylistContext);