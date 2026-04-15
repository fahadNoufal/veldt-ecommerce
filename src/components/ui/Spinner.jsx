export default function Spinner({ text }) {
  return (
    <div className="spinner-wrap">
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 12px' }} />
        {text && <div style={{ fontSize: 12, color: 'var(--t3)' }}>{text}</div>}
      </div>
    </div>
  );
}
