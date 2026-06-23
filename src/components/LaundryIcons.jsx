import React from 'react';

/**
 * SVG-based laundry care icons matching international standards
 */

const iconStyle = {
  stroke: 'currentColor',
  strokeWidth: '1.5',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
};

const WashIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" style={iconStyle}>
    {/* Wash tub */}
    <path d="M12 14 L12 38 L36 38 L36 14 Z" strokeWidth="2" />
    <path d="M14 14 L14 10 Q14 6 18 6 L30 6 Q34 6 34 10 L34 14" strokeWidth="2" />
    {/* Water line */}
    <path d="M14 22 L34 22" strokeWidth="1.5" />
    {/* Water waves */}
    <path d="M16 26 Q20 23 24 26 Q28 29 32 26" strokeWidth="1.2" />
    {/* Temp label */}
    <text x="24" y="44" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none">30°C</text>
  </svg>
);

const BleachIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" style={iconStyle}>
    <polygon points="24,6 38,42 10,42" strokeWidth="2" />
    {/* Inner lines for "any bleach" */}
    <line x1="24" y1="20" x2="16" y2="34" strokeWidth="1.5" opacity="0.5" />
    <line x1="24" y1="20" x2="32" y2="34" strokeWidth="1.5" opacity="0.5" />
  </svg>
);

const BleachNonClIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" style={iconStyle}>
    <polygon points="24,6 38,42 10,42" strokeWidth="2" />
    {/* Diagonal stripes */}
    <line x1="15" y1="28" x2="22" y2="15" strokeWidth="1.5" />
    <line x1="19" y1="35" x2="26" y2="22" strokeWidth="1.5" />
    <line x1="26" y1="35" x2="33" y2="22" strokeWidth="1.5" />
  </svg>
);

const IronIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" style={iconStyle}>
    {/* Iron body */}
    <path d="M8 18 L8 36 L36 36 L42 28 L42 18 Z" strokeWidth="2" />
    {/* Handle */}
    <path d="M22 8 Q22 16 12 18" strokeWidth="2" />
    {/* Dots for temperature */}
    <circle cx="20" cy="28" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="26" cy="28" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="32" cy="28" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const DryCleanIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" style={iconStyle}>
    <circle cx="24" cy="24" r="16" strokeWidth="2" />
    <text x="24" y="28" textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor" stroke="none">P</text>
  </svg>
);

const TumbleDryIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" style={iconStyle}>
    <rect x="8" y="8" width="32" height="32" rx="4" strokeWidth="2" />
    <circle cx="24" cy="24" r="10" strokeWidth="2" />
    {/* Dots */}
    <circle cx="24" cy="19" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const DryIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" style={iconStyle}>
    <rect x="8" y="8" width="32" height="32" rx="4" strokeWidth="2" />
    {/* Hanging line */}
    <line x1="24" y1="14" x2="24" y2="32" strokeWidth="2" />
    {/* Horizontal line top */}
    <line x1="16" y1="14" x2="32" y2="14" strokeWidth="2" />
  </svg>
);

const iconMap = {
  wash: WashIcon,
  bleach: BleachIcon,
  'bleach-noncl': BleachNonClIcon,
  iron: IronIcon,
  dryclean: DryCleanIcon,
  tumbledry: TumbleDryIcon,
  dry: DryIcon,
};

export default function LaundryIcons() {
  return (
    <div className="laundry-icons-grid">
      {[
        { id: 'wash', label: '水洗', desc: '盆中數字=水溫°C\n一條橫線=溫和洗滌\n兩條橫線=非常溫和\n手洗=水溫≤40°C\n✕=不可水洗' },
        { id: 'bleach', label: '漂白', desc: '空心△=任何漂白劑\n△內斜線=只可用氧系\n實心△=不可漂白' },
        { id: 'iron', label: '熨燙', desc: '1點≈110°C低溫\n2點≈150°C中溫\n3點≈200°C高溫\n✕=不可熨燙\n蒸氣✕=不可蒸氣熨' },
        { id: 'dryclean', label: '乾洗', desc: '○=可乾洗\n○✕=不可乾洗\nF=石油類 P=全氯乙烯\n橫線=溫和程序' },
        { id: 'tumbledry', label: '烘乾', desc: '1點=低溫≤60°C\n2點=中溫≤80°C\n✕=不可烘乾' },
        { id: 'dry', label: '晾乾', desc: '┃=懸掛晾乾\n━=平放晾乾\n斜線=陰涼晾乾' },
      ].map(item => {
        const IconComponent = iconMap[item.id];
        return (
          <div key={item.id} className="laundry-icon-card">
            <div className="laundry-icon-visual">
              {IconComponent && <IconComponent />}
            </div>
            <div className="laundry-icon-label">{item.label}</div>
            <div className="laundry-icon-desc">{item.desc}</div>
          </div>
        );
      })}
    </div>
  );
}
