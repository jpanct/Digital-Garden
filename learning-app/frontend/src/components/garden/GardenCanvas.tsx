interface GardenCanvasProps {
  stage: number;
  className?: string;
}

function StageSeed() {
  return (
    <g className="animate-grow" key="seed">
      {/* Soil mound */}
      <ellipse cx="200" cy="268" rx="35" ry="10" fill="#92400e" opacity="0.6" />
      {/* Seed body */}
      <ellipse cx="200" cy="262" rx="12" ry="8" fill="#78350f" />
      {/* Seed crack */}
      <path d="M196 258 Q200 262 196 266" stroke="#92400e" strokeWidth="1.5" fill="none" />
      <path d="M200 256 Q202 262 200 268" stroke="#a16207" strokeWidth="1" fill="none" />
      {/* Small text */}
      <text x="200" y="295" textAnchor="middle" fontSize="11" fill="#6b7280" fontFamily="sans-serif">
        Your journey begins...
      </text>
    </g>
  )
}

function StageSprout() {
  return (
    <g style={{ transformOrigin: '200px 265px', animation: 'sway 3s ease-in-out infinite' }} key="sprout">
      {/* Soil mound */}
      <ellipse cx="200" cy="268" rx="35" ry="10" fill="#92400e" opacity="0.6" />
      {/* Main stem */}
      <line x1="200" y1="265" x2="200" y2="230" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
      {/* Left leaf */}
      <path
        d="M200 248 Q182 238 178 225 Q192 228 200 242"
        fill="#22c55e"
        opacity="0.9"
      />
      {/* Right leaf */}
      <path
        d="M200 252 Q218 242 222 229 Q208 232 200 246"
        fill="#16a34a"
        opacity="0.9"
      />
      {/* Tiny bud at top */}
      <ellipse cx="200" cy="228" rx="5" ry="6" fill="#4ade80" />
    </g>
  )
}

function StageSapling() {
  return (
    <g style={{ transformOrigin: '200px 265px', animation: 'sway 3s ease-in-out infinite' }} key="sapling">
      {/* Soil mound */}
      <ellipse cx="200" cy="268" rx="40" ry="12" fill="#92400e" opacity="0.6" />
      {/* Main stem with slight curve */}
      <path
        d="M200 265 Q198 240 200 190"
        stroke="#15803d"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      {/* Leaf pair 1 (bottom) */}
      <ellipse cx="185" cy="252" rx="14" ry="7" fill="#22c55e" transform="rotate(-30 185 252)" opacity="0.9" />
      <ellipse cx="215" cy="248" rx="14" ry="7" fill="#16a34a" transform="rotate(30 215 248)" opacity="0.9" />
      {/* Leaf pair 2 (middle) */}
      <ellipse cx="182" cy="230" rx="16" ry="7" fill="#4ade80" transform="rotate(-40 182 230)" opacity="0.85" />
      <ellipse cx="218" cy="226" rx="16" ry="7" fill="#22c55e" transform="rotate(40 218 226)" opacity="0.85" />
      {/* Leaf pair 3 (upper) */}
      <ellipse cx="187" cy="208" rx="13" ry="6" fill="#16a34a" transform="rotate(-25 187 208)" opacity="0.9" />
      <ellipse cx="213" cy="205" rx="13" ry="6" fill="#4ade80" transform="rotate(25 213 205)" opacity="0.9" />
      {/* Top bud */}
      <ellipse cx="200" cy="190" rx="7" ry="8" fill="#86efac" />
    </g>
  )
}

function StageBlooming() {
  return (
    <g key="blooming">
      {/* Soil mound */}
      <ellipse cx="200" cy="268" rx="45" ry="12" fill="#92400e" opacity="0.6" />
      {/* Trunk */}
      <path
        d="M200 265 Q197 230 200 150"
        stroke="#15803d"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Canopy - overlapping circles */}
      <circle cx="200" cy="160" r="55" fill="#16a34a" opacity="0.7" />
      <circle cx="175" cy="155" r="42" fill="#22c55e" opacity="0.8" />
      <circle cx="225" cy="155" r="42" fill="#22c55e" opacity="0.8" />
      <circle cx="200" cy="135" r="40" fill="#4ade80" opacity="0.7" />
      <circle cx="190" cy="175" r="35" fill="#16a34a" opacity="0.9" />
      <circle cx="210" cy="170" r="33" fill="#15803d" opacity="0.8" />
      {/* Flowers - animated */}
      <circle
        cx="168" cy="142" r="7"
        fill="#fbcfe8"
        style={{ animation: 'bloom-pulse 2s ease-in-out infinite' }}
      />
      <circle
        cx="232" cy="138" r="7"
        fill="#fde68a"
        style={{ animation: 'bloom-pulse 2.3s ease-in-out infinite' }}
      />
      <circle
        cx="200" cy="118" r="8"
        fill="#fbcfe8"
        style={{ animation: 'bloom-pulse 1.8s ease-in-out infinite' }}
      />
      <circle
        cx="155" cy="165" r="6"
        fill="#fde68a"
        style={{ animation: 'bloom-pulse 2.5s ease-in-out infinite' }}
      />
      <circle
        cx="245" cy="162" r="6"
        fill="#fbcfe8"
        style={{ animation: 'bloom-pulse 2.1s ease-in-out infinite' }}
      />
      <circle
        cx="180" cy="120" r="6"
        fill="#fde68a"
        style={{ animation: 'bloom-pulse 1.9s ease-in-out infinite' }}
      />
      <circle
        cx="220" cy="118" r="6"
        fill="#fbcfe8"
        style={{ animation: 'bloom-pulse 2.4s ease-in-out infinite' }}
      />
    </g>
  )
}

function StageFullTree() {
  return (
    <g key="fulltree">
      {/* Trunk shadow */}
      <ellipse cx="204" cy="268" rx="18" ry="6" fill="#451a03" opacity="0.3" />
      {/* Trunk */}
      <rect x="193" y="185" width="14" height="80" fill="#92400e" rx="2" />
      {/* Bark lines */}
      <line x1="197" y1="195" x2="199" y2="255" stroke="#78350f" strokeWidth="1" opacity="0.6" />
      <line x1="202" y1="200" x2="204" y2="260" stroke="#78350f" strokeWidth="1" opacity="0.6" />
      {/* Canopy radial gradient defined inline */}
      <defs>
        <radialGradient id="canopyGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#15803d" />
        </radialGradient>
      </defs>
      {/* Canopy layers */}
      <circle cx="200" cy="155" r="70" fill="url(#canopyGrad)" opacity="0.85" />
      <circle cx="165" cy="160" r="52" fill="#22c55e" opacity="0.8" />
      <circle cx="235" cy="158" r="52" fill="#22c55e" opacity="0.8" />
      <circle cx="200" cy="125" r="55" fill="#4ade80" opacity="0.75" />
      <circle cx="175" cy="140" r="45" fill="#16a34a" opacity="0.9" />
      <circle cx="225" cy="138" r="45" fill="#16a34a" opacity="0.9" />
      <circle cx="200" cy="105" r="42" fill="#86efac" opacity="0.7" />
      {/* Fruits */}
      <circle cx="163" cy="148" r="8" fill="#ef4444" style={{ animation: 'float 6s ease-in-out infinite' }} />
      <circle cx="237" cy="144" r="8" fill="#ef4444" style={{ animation: 'float 6.5s ease-in-out infinite' }} />
      <circle cx="200" cy="108" r="7" fill="#ef4444" style={{ animation: 'float 5.5s ease-in-out infinite' }} />
      <circle cx="175" cy="120" r="7" fill="#ef4444" style={{ animation: 'float 7s ease-in-out infinite' }} />
      <circle cx="225" cy="118" r="7" fill="#ef4444" style={{ animation: 'float 6.2s ease-in-out infinite' }} />
      <circle cx="150" cy="165" r="6" fill="#ef4444" style={{ animation: 'float 5.8s ease-in-out infinite' }} />
      <circle cx="248" cy="162" r="6" fill="#ef4444" style={{ animation: 'float 6.8s ease-in-out infinite' }} />
      <circle cx="185" cy="90" r="6" fill="#ef4444" style={{ animation: 'float 7.2s ease-in-out infinite' }} />
    </g>
  )
}

export default function GardenCanvas({ stage, className }: GardenCanvasProps) {
  const renderPlant = () => {
    switch (stage) {
      case 0: return <StageSeed />
      case 1: return <StageSprout />
      case 2: return <StageSapling />
      case 3: return <StageBlooming />
      case 4: return <StageFullTree />
      default: return <StageSeed />
    }
  }

  return (
    <svg
      viewBox="0 0 400 320"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`Garden at stage ${stage}`}
    >
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="100%" stopColor="#dbeafe" />
        </linearGradient>
      </defs>

      {/* Sky background */}
      <rect width="400" height="320" fill="url(#skyGrad)" />

      {/* Clouds */}
      <g opacity="0.85">
        <ellipse cx="80" cy="60" rx="35" ry="18" fill="white" />
        <ellipse cx="105" cy="52" rx="28" ry="16" fill="white" />
        <ellipse cx="60" cy="55" rx="24" ry="14" fill="white" />
      </g>
      <g opacity="0.75">
        <ellipse cx="300" cy="45" rx="40" ry="20" fill="white" />
        <ellipse cx="328" cy="38" rx="30" ry="16" fill="white" />
        <ellipse cx="278" cy="40" rx="26" ry="15" fill="white" />
      </g>
      <g opacity="0.6">
        <ellipse cx="170" cy="30" rx="28" ry="13" fill="white" />
        <ellipse cx="192" cy="24" rx="22" ry="12" fill="white" />
      </g>

      {/* Ground strip */}
      <rect x="0" y="260" width="400" height="60" fill="#78350f" />

      {/* Grass tufts */}
      <g fill="#16a34a">
        <path d="M10 260 Q15 248 20 260" />
        <path d="M30 260 Q33 250 36 260" />
        <path d="M50 260 Q56 246 62 260" />
        <path d="M80 260 Q84 252 88 260" />
        <path d="M110 260 Q115 248 120 260" />
        <path d="M140 260 Q143 252 146 260" />
        <path d="M160 260 Q166 246 172 260" />
        <path d="M240 260 Q246 246 252 260" />
        <path d="M265 260 Q268 252 271 260" />
        <path d="M290 260 Q296 248 302 260" />
        <path d="M320 260 Q323 252 326 260" />
        <path d="M350 260 Q356 246 362 260" />
        <path d="M375 260 Q379 252 383 260" />
      </g>

      {/* Soil mound base */}
      <ellipse cx="200" cy="270" rx="50" ry="14" fill="#92400e" opacity="0.4" />

      {/* Dynamic plant */}
      {renderPlant()}
    </svg>
  )
}
