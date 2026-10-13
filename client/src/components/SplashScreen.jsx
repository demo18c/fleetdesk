// ============================================================
// client/src/components/SplashScreen.jsx — 5-second launch screen
// Full-viewport overlay shown on first load while the device list fetches
// underneath. Design values (gradient, icon, type, pills, bar) come from
// the FleetDesk splash mockup. App.jsx controls how long it stays and
// toggles `fading` to animate it out.
// ============================================================

const ACCENT = '#4f46e5';

// The app icon: a device-list card with a status pin, on the brand gradient.
// Also used as the favicon (client/public/favicon.svg).
const FleetDeskIcon = ({ size = 136 }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" role="img" aria-label="FleetDesk icon">
    <defs>
      <linearGradient id="s-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={ACCENT} />
        <stop offset="1" stopColor="#1e1b4b" />
      </linearGradient>
      <linearGradient id="s-sheen" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.18" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="114" fill="url(#s-bg)" />
    <rect width="512" height="256" rx="114" fill="url(#s-sheen)" />
    <rect x="96" y="128" width="216" height="284" rx="30" fill="#ffffff" fillOpacity="0.10" stroke="#c7d2fe" strokeOpacity="0.7" strokeWidth="16" />
    <rect x="232" y="168" width="176" height="272" rx="32" fill="#ffffff" />
    <rect x="252" y="196" width="136" height="216" rx="14" fill="#eef2ff" />
    <rect x="268" y="220" width="104" height="40" rx="20" fill="#fef3c7" />
    <circle cx="290" cy="240" r="9" fill="#f59e0b" />
    <rect x="308" y="234" width="50" height="12" rx="6" fill="#f59e0b" fillOpacity="0.55" />
    <rect x="268" y="274" width="104" height="40" rx="20" fill="#d1fae5" />
    <circle cx="290" cy="294" r="9" fill="#10b981" />
    <rect x="308" y="288" width="50" height="12" rx="6" fill="#10b981" fillOpacity="0.55" />
    <rect x="268" y="328" width="104" height="40" rx="20" fill="#e2e8f0" />
    <circle cx="290" cy="348" r="9" fill="#94a3b8" />
    <rect x="308" y="342" width="50" height="12" rx="6" fill="#94a3b8" fillOpacity="0.7" />
    <circle cx="404" cy="146" r="50" fill="#818cf8" fillOpacity="0.28" />
    <circle cx="404" cy="146" r="32" fill="#818cf8" stroke="#ffffff" strokeWidth="8" />
  </svg>
);

// Props:
//   fading   – true during the last 400ms so the overlay fades out
//   duration – ms the splash is shown; drives the progress-bar animation length
export default function SplashScreen({ fading = false, duration = 5000 }) {
  return (
    <div className={`splash${fading ? ' splash-fading' : ''}`} role="status" aria-live="polite">
      <div className="splash-glow" aria-hidden="true" />
      <div className="splash-content">
        <div className="splash-icon">
          <FleetDeskIcon />
        </div>
        <h1 className="splash-title">FleetDesk</h1>
        <p className="splash-subtitle">Device fleet inventory</p>
        <div className="splash-pills">
          <span className="splash-pill pending">Pending</span>
          <span className="splash-pill enrolled">Enrolled</span>
          <span className="splash-pill retired">Retired</span>
        </div>
        <div className="splash-loading">
          <div className="splash-bar" role="progressbar" aria-label="Loading devices">
            <div className="splash-bar-fill" style={{ animationDuration: `${duration}ms` }} />
          </div>
          <p className="splash-caption">Loading your fleet…</p>
        </div>
      </div>
    </div>
  );
}
