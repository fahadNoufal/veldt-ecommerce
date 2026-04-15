const PARTICLES = [
  { size: 5, top: '20%', left: '12%', anim: 'sparkFloat',  dur: '2.8s', delay: '0s',   color: 'rgba(197,170,140,.6)' },
  { size: 3, top: '60%', left: '22%', anim: 'sparkFloat2', dur: '3.5s', delay: '.4s',  color: 'rgba(250,247,242,.4)' },
  { size: 4, top: '30%', left: '55%', anim: 'sparkFloat3', dur: '2.2s', delay: '.8s',  color: 'rgba(197,170,140,.5)' },
  { size: 6, top: '65%', left: '68%', anim: 'sparkFloat',  dur: '3.1s', delay: '1.1s', color: 'rgba(250,247,242,.3)' },
  { size: 3, top: '15%', left: '78%', anim: 'sparkFloat2', dur: '2.6s', delay: '.2s',  color: 'rgba(197,170,140,.45)' },
  { size: 5, top: '70%', left: '88%', anim: 'sparkFloat3', dur: '3.8s', delay: '.6s',  color: 'rgba(250,247,242,.35)' },
];

export default function StylistBanner({ onOpen }) {
  return (
    <div className="stylist-banner" onClick={onOpen} title="Open AI Stylist">
      {PARTICLES.map((p, i) => (
        <div key={i} className="banner-particle" style={{
          width: p.size, height: p.size,
          top: p.top, left: p.left,
          background: p.color,
          animation: `${p.anim} ${p.dur} ${p.delay} ease-in-out infinite`,
        }} />
      ))}
      <div className="sb-left">
        <div className="sb-title">
          <span className="sb-spark">✦</span>
          Meet Elara — Your AI Stylist
        </div>
        <div className="sb-sub">Describe an occasion · get curated picks instantly</div>
      </div>
      <div className="sb-cta">Try it →</div>
    </div>
  );
}
