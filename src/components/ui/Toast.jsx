import { useEffect } from 'react';

export default function Toast({ msg, type = 'ok', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={`toast${type === 'err' ? ' err' : ''}`}>{msg}</div>
  );
}
