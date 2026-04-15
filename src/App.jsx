import { useState, useEffect } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { StylistProvider } from './context/StylistContext';

import Header       from './components/layout/Header';
import CatalogPage  from './components/catalog/CatalogPage';
import ProductModal from './components/catalog/ProductModal';
import CartPage     from './components/cart/CartPage';
import OrdersPage   from './components/orders/OrdersPage';
import StylistPage  from './components/stylist/StylistPage';
import OrderSuccess from './components/ui/OrderSuccess';
import Toast        from './components/ui/Toast';

import './styles/fab.css';

function AppInner() {
  const [page,    setPage]    = useState('catalog');
  const [search,  setSearch]  = useState('');
  const [modal,   setModal]   = useState(null);
  const [success, setSuccess] = useState(null);
  const [toast,   setToast]   = useState(null);

  const { refreshCart } = useCart();
  useEffect(() => { refreshCart(); }, []);

  const handleSearch = val => { setSearch(val); setPage('catalog'); };
  const handleOrderSuccess = count => { setSuccess({ count }); setPage('catalog'); };
  const isStylist = page === 'stylist';

  return (
    <>
      <Header page={page} setPage={setPage} onSearch={handleSearch} />

      {isStylist ? (
        <StylistPage onViewCart={() => setPage('cart')} />
      ) : (
        <main className="main">
          {page === 'catalog' && (
            <CatalogPage
              searchQuery={search}
              onProductClick={setModal}
            />
          )}
          {page === 'cart'   && <CartPage onBack={() => setPage('catalog')} onOrderSuccess={handleOrderSuccess} />}
          {page === 'orders' && <OrdersPage />}
        </main>
      )}

      {/* Fix 1: AI Stylist FAB — visible on all non-stylist pages */}
      {!isStylist && (
        <button className="stylist-fab" onClick={() => setPage('stylist')} title="Chat with Elara, your AI Stylist">
          <div className="fab-ring" />
          <span className="fab-icon">✦</span>
          <div className="fab-text">
            <span className="fab-label">AI Stylist</span>
            <span className="fab-sub">Ask Elara</span>
          </div>
          <div className="fab-dot" />
        </button>
      )}

      {modal && (
        <ProductModal
          product={modal}
          onClose={() => setModal(null)}
          onAdded={() => setToast({ msg: `${modal.name} added to cart`, type: 'ok' })}
        />
      )}
      {success && (
        <OrderSuccess
          count={success.count}
          onClose={() => { setSuccess(null); setPage('catalog'); }}
          onViewOrders={() => { setSuccess(null); setPage('orders'); }}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <StylistProvider>
        <AppInner />
      </StylistProvider>
    </CartProvider>
  );
}