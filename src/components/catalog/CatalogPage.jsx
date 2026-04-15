import { useState, useEffect, useCallback } from 'react';
import { getProducts, searchProducts } from '../../api';
import ProductCard from './ProductCard';
import Spinner from '../ui/Spinner';
import '../../styles/catalog.css';

export default function CatalogPage({ searchQuery, onProductClick }) {
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [searching,  setSearching]  = useState(false);
  const [sort,       setSort]       = useState('default');
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);

  const browse = useCallback(async (srt, pg) => {
    setLoading(true);
    try {
      const data = await getProducts(srt, pg, 20);
      setProducts(data.items);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  const runSearch = useCallback(async q => {
    setSearching(true);
    setLoading(true);
    try {
      const data = await searchProducts(q, 40);
      setProducts(data.items);
      setTotal(data.total);
      setTotalPages(1);
    } catch (e) { console.error(e); }
    setLoading(false);
    setSearching(false);
  }, []);

  useEffect(() => {
    if (searchQuery?.trim()) runSearch(searchQuery);
    else browse(sort, page);
  }, [searchQuery, sort, page]);

  const handleSort = val => { setSort(val); setPage(1); };
  const isSearch = !!(searchQuery?.trim());

  const pageNums = () => {
    const arr = [], delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) arr.push(i);
    return arr;
  };

  return (
    <>
      <div className="filters">
        {!isSearch && (
          <select className="fsel" value={sort} onChange={e => handleSort(e.target.value)}>
            <option value="default">Sort: Default</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="rating">Top Rated</option>
          </select>
        )}
        {isSearch && (
          <span className="search-label">🔍 Results for "{searchQuery}"</span>
        )}
        <span className="count">{total.toLocaleString()} item{total !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <Spinner text={searching ? 'Running similarity search…' : undefined} />
      ) : products.length === 0 ? (
        <div className="empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <p>No results{isSearch ? ` for "${searchQuery}"` : ''}</p>
        </div>
      ) : (
        <div className="grid">
          {products.map(p => (
            <ProductCard key={p.id} product={p} onClick={onProductClick} />
          ))}
        </div>
      )}

      {totalPages > 1 && !loading && !isSearch && (
        <div className="pagi">
          <button className="pg-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>←</button>
          {page > 3 && <>
            <button className="pg-btn" onClick={() => setPage(1)}>1</button>
            <span style={{ color: 'var(--t3)', padding: '0 4px' }}>…</span>
          </>}
          {pageNums().map(n => (
            <button key={n} className={`pg-btn${n === page ? ' cur' : ''}`} onClick={() => setPage(n)}>{n}</button>
          ))}
          {page < totalPages - 2 && <>
            <span style={{ color: 'var(--t3)', padding: '0 4px' }}>…</span>
            <button className="pg-btn" onClick={() => setPage(totalPages)}>{totalPages}</button>
          </>}
          <button className="pg-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>→</button>
        </div>
      )}
    </>
  );
}