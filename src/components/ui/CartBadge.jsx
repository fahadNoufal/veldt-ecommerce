import { useState, useEffect, useRef } from 'react';

export default function CartBadge({ count }) {
  const [pop, setPop] = useState(false);
  const prev = useRef(count);

  useEffect(() => {
    if (count !== prev.current) {
      setPop(true);
      const t = setTimeout(() => setPop(false), 400);
      prev.current = count;
      return () => clearTimeout(t);
    }
  }, [count]);

  return (
    <span className={`badge${pop ? ' pop' : ''}`}>
      {count > 99 ? '99+' : count}
    </span>
  );
}
