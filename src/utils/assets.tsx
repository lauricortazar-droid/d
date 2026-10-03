import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'gold' | 'monochrome' | 'white' | 'color';
  size?: number;
}

export const FGDLLMainLogo: React.FC<LogoProps> = ({ className = 'w-16 h-16', variant = 'gold' }) => {
  const primaryColor = variant === 'monochrome' ? '#1e293b' : variant === 'white' ? '#ffffff' : '#d4af37';
  const secondaryColor = variant === 'monochrome' ? '#475569' : variant === 'white' ? '#cbd5e1' : '#f59e0b';
  const navyColor = variant === 'monochrome' ? '#0f172a' : variant === 'white' ? '#1e293b' : '#0b192c';

  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer Ornamental Ring */}
      <circle cx="100" cy="100" r="94" stroke={primaryColor} strokeWidth="3" strokeDasharray="6 3" opacity="0.8" />
      <circle cx="100" cy="100" r="88" stroke={secondaryColor} strokeWidth="1.5" />
      
      {/* Background Crest */}
      <path
        d="M100 20 C145 20 180 32 180 75 C180 135 130 170 100 185 C70 170 20 135 20 75 C20 32 55 20 100 20 Z"
        fill={navyColor}
        stroke={primaryColor}
        strokeWidth="3.5"
      />
      
      {/* Radiant Sun / Light Beam behind Cross & Sword */}
      <circle cx="100" cy="85" r="42" fill="url(#sunGlow)" opacity="0.4" />
      <defs>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sun rays */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <line
          key={deg}
          x1="100"
          y1="85"
          x2={100 + 48 * Math.cos((deg * Math.PI) / 180)}
          y2={85 + 48 * Math.sin((deg * Math.PI) / 180)}
          stroke={primaryColor}
          strokeWidth="1"
          opacity="0.4"
        />
      ))}

      {/* Warrior Shield & Sword of Light */}
      {/* Golden Chivalric Sword */}
      <path d="M100 40 L103 48 L103 145 L100 152 L97 145 L97 48 Z" fill={primaryColor} />
      {/* Cross Guard */}
      <rect x="74" y="65" width="52" height="6" rx="2" fill={secondaryColor} />
      <circle cx="74" cy="68" r="3.5" fill={primaryColor} />
      <circle cx="126" cy="68" r="3.5" fill={primaryColor} />
      {/* Pommel */}
      <circle cx="100" cy="40" r="5" fill={secondaryColor} stroke={primaryColor} strokeWidth="1.5" />
      <circle cx="100" cy="40" r="2" fill="#fff" />

      {/* Twin Laurel Branches */}
      <path
        d="M48 135 C42 105 52 70 70 54 M152 135 C158 105 148 70 130 54"
        stroke={primaryColor}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Laurel Leaves */}
      {[
        { cx: 50, cy: 120, r: 4 },
        { cx: 46, cy: 100, r: 4 },
        { cx: 48, cy: 82, r: 3.5 },
        { cx: 58, cy: 66, r: 3 },
        { cx: 150, cy: 120, r: 4 },
        { cx: 154, cy: 100, r: 4 },
        { cx: 152, cy: 82, r: 3.5 },
        { cx: 142, cy: 66, r: 3 },
      ].map((leaf, idx) => (
        <circle key={idx} cx={leaf.cx} cy={leaf.cy} r={leaf.r} fill={secondaryColor} />
      ))}

      {/* Golden Banner at bottom */}
      <path
        d="M45 150 Q100 162 155 150 L150 165 Q100 178 50 165 Z"
        fill={primaryColor}
      />
      <text
        x="100"
        y="161"
        textAnchor="middle"
        fill={navyColor}
        fontSize="8"
        fontWeight="bold"
        fontFamily="Cinzel, serif"
        letterSpacing="2"
      >
        FGDLL
      </text>

      {/* Motto Arched Stars */}
      <circle cx="82" cy="138" r="2" fill={secondaryColor} />
      <circle cx="100" cy="140" r="2.5" fill={primaryColor} />
      <circle cx="118" cy="138" r="2" fill={secondaryColor} />
    </svg>
  );
};

export const ZoneBadge: React.FC<{ zone: string; className?: string; size?: number }> = ({ zone, className = 'w-12 h-12' }) => {
  switch (zone) {
    case 'Águila':
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none">
          <circle cx="60" cy="60" r="56" fill="#0f2744" stroke="#d4af37" strokeWidth="2.5" />
          <path d="M60 20 L72 38 L94 40 L78 55 L82 78 L60 67 L38 78 L42 55 L26 40 L48 38 Z" fill="#f59e0b" opacity="0.3" />
          {/* Majestic Eagle Profile */}
          <path
            d="M38 68 C44 50 56 36 74 34 C84 33 90 38 90 46 C86 52 74 54 68 58 C62 62 58 72 50 82 C44 76 40 72 38 68 Z"
            fill="#d4af37"
          />
          <path d="M84 46 C92 48 94 52 90 56 C86 54 82 52 78 50 Z" fill="#eab308" />
          <circle cx="76" cy="42" r="2" fill="#0f2744" />
          <text x="60" y="102" textAnchor="middle" fill="#d4af37" fontSize="11" fontWeight="700" fontFamily="Cinzel, serif">
            ÁGUILA
          </text>
        </svg>
      );
    case 'Tiburón':
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none">
          <circle cx="60" cy="60" r="56" fill="#0b2a3a" stroke="#38bdf8" strokeWidth="2.5" />
          {/* Shark Fin and Dynamic Waves */}
          <path
            d="M30 75 Q60 50 85 70 C75 58 64 36 50 36 C46 48 40 64 30 75 Z"
            fill="#38bdf8"
          />
          <path d="M25 84 Q60 76 95 84" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" />
          <text x="60" y="104" textAnchor="middle" fill="#7dd3fc" fontSize="10.5" fontWeight="700" fontFamily="Cinzel, serif">
            TIBURÓN
          </text>
        </svg>
      );
    case 'Delfín':
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none">
          <circle cx="60" cy="60" r="56" fill="#0d3b4c" stroke="#22d3ee" strokeWidth="2.5" />
          {/* Graceful Dolphin Arch */}
          <path
            d="M34 76 C42 50 62 38 82 46 C88 49 92 56 86 60 C78 54 68 56 56 68 C48 76 42 78 34 76 Z"
            fill="#22d3ee"
          />
          <path d="M60 48 L68 40 L68 49 Z" fill="#67e8f9" />
          <circle cx="78" cy="50" r="1.8" fill="#0d3b4c" />
          <text x="60" y="104" textAnchor="middle" fill="#a5f3fc" fontSize="11" fontWeight="700" fontFamily="Cinzel, serif">
            DELFÍN
          </text>
        </svg>
      );
    case 'Colibrí':
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none">
          <circle cx="60" cy="60" r="56" fill="#1b2a47" stroke="#34d399" strokeWidth="2.5" />
          {/* Swift Hummingbird */}
          <path
            d="M44 65 C48 54 58 48 70 48 L88 44 C84 48 76 52 74 58 C70 66 62 72 52 76 L44 65 Z"
            fill="#34d399"
          />
          {/* Fluttering Wings */}
          <path d="M58 50 C62 34 76 26 84 32 C78 40 70 46 62 48 Z" fill="#a7f3d0" />
          <circle cx="78" cy="48" r="1.8" fill="#064e3b" />
          <text x="60" y="104" textAnchor="middle" fill="#6ee7b7" fontSize="10.5" fontWeight="700" fontFamily="Cinzel, serif">
            COLIBRÍ
          </text>
        </svg>
      );
    case 'Jaguar':
    default:
      return (
        <svg viewBox="0 0 120 120" className={className} fill="none">
          <circle cx="60" cy="60" r="56" fill="#2b1a09" stroke="#f59e0b" strokeWidth="2.5" />
          {/* Powerful Jaguar Silhouette with Rosettes */}
          <path
            d="M40 70 C42 54 54 42 70 40 C78 39 84 44 86 52 C84 62 72 68 64 74 C54 80 46 76 40 70 Z"
            fill="#d97706"
          />
          {/* Ears */}
          <path d="M68 40 L72 32 L78 39 Z" fill="#b45309" />
          <path d="M52 44 L56 36 L62 43 Z" fill="#b45309" />
          {/* Spots */}
          <circle cx="56" cy="56" r="2.5" fill="#451a03" />
          <circle cx="68" cy="52" r="3" fill="#451a03" />
          <circle cx="60" cy="66" r="2.5" fill="#451a03" />
          <text x="60" y="104" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="700" fontFamily="Cinzel, serif">
            JAGUAR
          </text>
        </svg>
      );
  }
};

export const LegionLogo: React.FC<LogoProps> = ({ className = 'w-12 h-12' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none">
    <polygon points="50,6 88,28 88,72 50,94 12,72 12,28" stroke="#d4af37" strokeWidth="3" fill="#0b192c" />
    <path d="M50 18 L50 82 M26 42 L74 42" stroke="#d4af37" strokeWidth="3.5" strokeLinecap="round" />
    <text x="50" y="78" textAnchor="middle" fill="#d4af37" fontSize="9" fontWeight="900" fontFamily="Cinzel, serif">
      LA LEGIÓN
    </text>
  </svg>
);

export const AmazonasLogo: React.FC<LogoProps> = ({ className = 'w-12 h-12' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none">
    <circle cx="50" cy="50" r="44" stroke="#ec4899" strokeWidth="2.5" fill="#2d0a1e" />
    <path d="M35 70 Q50 30 65 70" stroke="#f472b6" strokeWidth="3" strokeLinecap="round" fill="none" />
    <circle cx="50" cy="32" r="7" fill="#fb7185" />
    <text x="50" y="86" textAnchor="middle" fill="#f472b6" fontSize="8" fontWeight="800" fontFamily="Cinzel, serif">
      AMAZONAS
    </text>
  </svg>
);

export const GladiadoresLogo: React.FC<LogoProps> = ({ className = 'w-12 h-12' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none">
    <circle cx="50" cy="50" r="44" stroke="#d97706" strokeWidth="2.5" fill="#1c1917" />
    {/* Helmet / Shield Motif */}
    <path d="M32 40 C32 28 68 28 68 40 L68 56 C68 68 32 68 32 56 Z" stroke="#f59e0b" strokeWidth="2.5" fill="#292524" />
    <line x1="50" y1="36" x2="50" y2="60" stroke="#f59e0b" strokeWidth="3" />
    <line x1="38" y1="46" x2="62" y2="46" stroke="#f59e0b" strokeWidth="2.5" />
    <text x="50" y="88" textAnchor="middle" fill="#fbbf24" fontSize="7.5" fontWeight="800" fontFamily="Cinzel, serif">
      GLADIADORES
    </text>
  </svg>
);

export const OfficialSealStamp: React.FC<{
  centerName?: string;
  zone?: string;
  className?: string;
  color?: string;
}> = ({ centerName = 'FRATERNIDAD GUERREROS DE LA LUZ', zone = 'ZONA ÁGUILA', className = 'w-32 h-32', color = '#b45309' }) => {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none">
      <circle cx="100" cy="100" r="92" stroke={color} strokeWidth="3" strokeDasharray="5 3" opacity="0.85" />
      <circle cx="100" cy="100" r="82" stroke={color} strokeWidth="2" opacity="0.9" />
      <circle cx="100" cy="100" r="54" stroke={color} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
      
      {/* Curved Text - Official Stamp aesthetic */}
      <path id="sealCirclePathTop" d="M 30,100 A 70,70 0 0,1 170,100" fill="none" />
      <path id="sealCirclePathBottom" d="M 170,100 A 70,70 0 0,1 30,100" fill="none" />
      
      <text fill={color} fontSize="9" fontWeight="700" letterSpacing="2" fontFamily="Cinzel, serif">
        <textPath href="#sealCirclePathTop" startOffset="50%" textAnchor="middle">
          FRATERNIDAD GUERREROS DE LA LUZ
        </textPath>
      </text>

      <text fill={color} fontSize="8.5" fontWeight="700" letterSpacing="1.5" fontFamily="Cinzel, serif">
        <textPath href="#sealCirclePathBottom" startOffset="50%" textAnchor="middle">
          {zone.toUpperCase()} · OFICIAL
        </textPath>
      </text>

      {/* Center Crest */}
      <path d="M100 70 L112 84 L100 125 L88 84 Z" fill={color} opacity="0.75" />
      <line x1="84" y1="92" x2="116" y2="92" stroke={color} strokeWidth="2" />
      <circle cx="100" cy="70" r="3" fill={color} />
      <text x="100" y="142" textAnchor="middle" fill={color} fontSize="7" fontWeight="bold" letterSpacing="1">
        REGISTRADO
      </text>
    </svg>
  );
};
