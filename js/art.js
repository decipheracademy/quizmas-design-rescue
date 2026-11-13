// Original artwork drawn as SVG: the Glitch character and the flyer illustrations.

export function glitchSVG(mood = "grin") {
  const mouth = mood === "sulk"
    ? `<path d="M80 128 Q100 116 120 128" stroke="#0b2f6b" stroke-width="6" fill="none" stroke-linecap="round"/>`
    : `<path d="M74 118 Q100 146 128 116 Q100 130 74 118 Z" fill="#0b2f6b"/><path d="M92 126 l5 7 5-7z" fill="#fff"/>`;
  const brows = mood === "sulk"
    ? `<path d="M66 82 l22 6 M134 82 l-22 6" stroke="#0b2f6b" stroke-width="5" stroke-linecap="round"/>`
    : `<path d="M66 86 l20 -6 M134 86 l-20 -6" stroke="#0b2f6b" stroke-width="5" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 200 210" role="img" aria-label="Glitch the snow gremlin">
  <defs>
    <radialGradient id="gb" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#e3f4ff"/><stop offset="1" stop-color="#a9d8f5"/></radialGradient>
  </defs>
  <ellipse cx="100" cy="200" rx="58" ry="8" fill="rgba(0,0,0,.25)"/>
  <g class="g-body">
    <path d="M40 150 q-20 -6 -24 -26" stroke="#cfeaff" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M160 150 q22 -4 28 -24" stroke="#cfeaff" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M100 42 C150 42 172 82 170 126 C168 172 136 196 100 196 C62 196 30 172 30 126 C30 80 52 42 100 42 Z" fill="url(#gb)"/>
    <g class="g-pix">
      <rect x="22" y="104" width="12" height="12" fill="#4fc3f7"/><rect x="14" y="120" width="8" height="8" fill="#ff5fb4"/>
      <rect x="168" y="96" width="12" height="12" fill="#4fc3f7"/><rect x="180" y="114" width="8" height="8" fill="#ff5fb4"/>
      <rect x="150" y="170" width="10" height="10" fill="#4fc3f7"/>
    </g>
    <ellipse cx="78" cy="98" rx="18" ry="21" fill="#fff" stroke="#0b2f6b" stroke-width="4"/>
    <ellipse cx="122" cy="98" rx="18" ry="21" fill="#fff" stroke="#0b2f6b" stroke-width="4"/>
    <circle cx="${mood === "sulk" ? 78 : 83}" cy="${mood === "sulk" ? 104 : 100}" r="9" fill="#0b2f6b"/>
    <circle cx="${mood === "sulk" ? 122 : 127}" cy="${mood === "sulk" ? 104 : 100}" r="9" fill="#0b2f6b"/>
    <circle cx="${mood === "sulk" ? 81 : 86}" cy="96" r="3" fill="#fff"/><circle cx="${mood === "sulk" ? 125 : 130}" cy="96" r="3" fill="#fff"/>
    ${brows}
    ${mouth}
    <circle cx="58" cy="124" r="8" fill="#ffb3d4" opacity=".55"/><circle cx="142" cy="124" r="8" fill="#ffb3d4" opacity=".55"/>
    <path d="M44 70 C52 26 148 26 156 70 C130 58 70 58 44 70 Z" fill="#0b2f6b"/>
    <path d="M47 62 C70 52 130 52 153 62" stroke="#4fc3f7" stroke-width="8" fill="none"/>
    <path d="M100 30 L128 4" stroke="#0b2f6b" stroke-width="14" stroke-linecap="round"/>
    <circle cx="132" cy="2" r="13" fill="#fff"/>
  </g>
</svg>`;
}

// Flyer illustrations (fit inside a 360 × 260 box).
export const PICTURES = {
  carol: `<svg viewBox="0 0 360 260" aria-hidden="true">
    <circle cx="180" cy="140" r="118" fill="#e3f4ff"/>
    <path d="M180 24 L240 120 H210 L262 196 H98 L150 120 H120 Z" fill="#1f8a5c"/>
    <path d="M180 24 L240 120 H210 L262 196 H98 L150 120 H120 Z" fill="none" stroke="#146b46" stroke-width="4"/>
    <rect x="166" y="196" width="28" height="34" rx="4" fill="#7a4a24"/>
    <path d="M180 8 l7 15 16 2 -12 11 3 16 -14 -8 -14 8 3 -16 -12 -11 16 -2z" fill="#f6c453"/>
    <circle cx="160" cy="100" r="8" fill="#4fc3f7"/><circle cx="204" cy="140" r="8" fill="#f6c453"/><circle cx="140" cy="168" r="8" fill="#ff6b6b"/>
    <circle cx="222" cy="176" r="8" fill="#4fc3f7"/><circle cx="182" cy="160" r="7" fill="#fff"/>
    <path d="M58 70 v46 a10 8 0 1 1 -6 -8 v-30 l26 -6 v32 a10 8 0 1 1 -6 -8 v-22z" fill="#0b2f6b"/>
    <path d="M292 60 v40 a10 8 0 1 1 -6 -8 v-32z" fill="#0b2f6b"/>
  </svg>`,
  talent: `<svg viewBox="0 0 360 260" aria-hidden="true">
    <path d="M30 230 H330 L300 196 H60 Z" fill="#0b2f6b"/>
    <path d="M110 0 L70 196 H120 Z M250 0 L290 196 H240 Z" fill="#f6c453" opacity=".28"/>
    <rect x="166" y="96" width="28" height="110" rx="10" fill="#2a3d66"/>
    <rect x="150" y="196" width="60" height="12" rx="6" fill="#2a3d66"/>
    <rect x="148" y="28" width="64" height="86" rx="32" fill="#cfd8e3" stroke="#2a3d66" stroke-width="6"/>
    <path d="M152 70 h56 M152 56 h56 M152 84 h56" stroke="#8a9bb3" stroke-width="4"/>
    <path d="M60 60 l6 13 14 2 -10 10 3 14 -13 -7 -13 7 3 -14 -10 -10 14 -2z" fill="#f6c453"/>
    <path d="M300 40 l5 10 11 2 -8 8 2 11 -10 -5 -10 5 2 -11 -8 -8 11 -2z" fill="#4fc3f7"/>
    <path d="M286 120 l4 8 9 1 -7 6 2 9 -8 -4 -8 4 2 -9 -7 -6 9 -1z" fill="#ff6b6b"/>
  </svg>`,
  toys: `<svg viewBox="0 0 360 260" aria-hidden="true">
    <ellipse cx="180" cy="236" rx="150" ry="14" fill="#cfe6f5"/>
    <rect x="60" y="120" width="110" height="110" rx="8" fill="#4fc3f7"/><rect x="104" y="120" width="22" height="110" fill="#fff"/><rect x="60" y="164" width="110" height="22" fill="#fff"/>
    <rect x="180" y="90" width="120" height="140" rx="8" fill="#0b2f6b"/><rect x="229" y="90" width="22" height="140" fill="#f6c453"/>
    <rect x="130" y="40" width="90" height="80" rx="8" fill="#ff6b6b"/><rect x="164" y="40" width="20" height="80" fill="#fff"/>
    <path d="M174 40 c-20 -30 -40 -10 -20 0z M174 40 c20 -30 40 -10 20 0z" fill="#fff"/>
    <path d="M240 90 c-18 -26 -36 -8 -18 0z M240 90 c18 -26 36 -8 18 0z" fill="#f6c453"/>
  </svg>`,
};
