export default function Stars({ n }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= n ? 'var(--accent)' : 'var(--border)' }}>★</span>
      ))}
    </span>
  );
}
