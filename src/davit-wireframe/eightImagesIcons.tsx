/**
 * 8 Images' own icon set.
 *
 * These are the product's real vectors, pulled out of the Figma file
 * (9cBLrnEHUYTC56jt0NiPeT) — not redrawn. The six map icons in particular are
 * part of how the tool reads: they are what a material's layers are labelled
 * with, and inventing lookalikes would have quietly changed the subject.
 *
 * Every glyph is a 24x24 viewBox, 1.5px stroke, currentColor. The product draws
 * them at #505050; the case study inherits colour from the surrounding row so a
 * selected layer can darken without a second icon.
 */

type IconProps = { className?: string; size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true as const,
  focusable: "false" as const
});

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const
};

/* --- the six material maps, in the order the product lists them ---------- */

export function IconDiffuseMap({ className, size = 24 }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M7.00005 7H3.33789V3.33782" {...stroke} />
      <path d="M17 17H20.6622V20.6622" {...stroke} />
      <path d="M20.6622 17C18.9332 19.989 15.7014 22 12 22" {...stroke} />
      <path d="M7.00005 17V20.6622H3.33789" {...stroke} />
      <path d="M7 20.6622C4.01099 18.9332 2 15.7014 2 12" {...stroke} />
      <path d="M3.33789 7C5.06695 4.01099 8.29865 2 12 2" {...stroke} />
      <path d="M17 7.00005V3.33789H20.6622" {...stroke} />
      <path d="M17 3.33789C19.989 5.06695 22 8.29865 22 12" {...stroke} />
    </svg>
  );
}

export function IconNormalMap({ className, size = 24 }: IconProps) {
  /* A filled 3x3 checker rather than a stroked glyph — the only solid icon in
     the set, which is why the normal map reads as the "texture" one. */
  const cells = [
    [18, 18], [10, 18], [2, 18],
    [18, 10], [10, 10], [2, 10],
    [18, 2], [10, 2], [2, 2],
    [6, 6], [6, 14], [14, 6], [14, 14]
  ];
  return (
    <svg {...base(size)} className={className}>
      {cells.map(([x, y]) => (
        <path key={`${x}-${y}`} d={`M${x + 4} ${y}H${x}V${y + 4}H${x + 4}V${y}Z`} fill="currentColor" />
      ))}
    </svg>
  );
}

export function IconRoughness({ className, size = 24 }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M21 12H13.5M12 21V13.5V21Z" {...stroke} />
      <path
        d="M12 13.5C12.8284 13.5 13.5 12.8284 13.5 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5Z"
        {...stroke}
      />
      <path d="M21 3H12L3 12V21" {...stroke} />
    </svg>
  );
}

export function IconEmission({ className, size = 24 }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M2 18C2 18 4.5 16.5 7 16.5C10.6488 16.5 13.3512 19.5 17 19.5C19.5 19.5 22 18 22 18" {...stroke} />
      <path d="M2 12C2 12 4.5 10.5 7 10.5C10.6488 10.5 13.3512 13.5 17 13.5C19.5 13.5 22 12 22 12" {...stroke} />
      <path d="M2 6C2 6 4.5 4.5 7 4.5C10.6488 4.5 13.3512 7.5 17 7.5C19.5 7.5 22 6 22 6" {...stroke} />
    </svg>
  );
}

export function IconMetalness({ className, size = 24 }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path
        d="M12 21.5C14.2092 21.5 16.2092 20.6046 17.6569 19.1569C19.1046 17.7092 20 15.7092 20 13.5C20 11.2908 19.1046 9.29085 17.6569 7.84315C16.2092 6.39545 14.2092 5.5 12 5.5C9.79085 5.5 7.79085 6.39545 6.34315 7.84315C4.89543 9.29085 4 11.2908 4 13.5C4 15.7092 4.89543 17.7092 6.34315 19.1569C7.79085 20.6046 9.79085 21.5 12 21.5Z"
        {...stroke}
        strokeLinejoin={undefined}
      />
      <path d="M19.7782 5.72185C17.7876 3.73122 15.0376 2.5 12 2.5C8.96245 2.5 6.21245 3.73122 4.22183 5.72185" {...stroke} strokeLinejoin={undefined} />
    </svg>
  );
}

export function IconTransparency({ className, size = 24 }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path
        d="M20.5 8H9C8.44772 8 8 8.44772 8 9V20.5C8 21.0523 8.44772 21.5 9 21.5H20.5C21.0523 21.5 21.5 21.0523 21.5 20.5V9C21.5 8.44772 21.0523 8 20.5 8Z"
        {...stroke}
      />
      <path d="M8 16H3.5C2.94771 16 2.5 15.5523 2.5 15V3.5C2.5 2.94771 2.94771 2.5 3.5 2.5H15C15.5523 2.5 16 2.94771 16 3.5V8" {...stroke} />
      <path d="M14.5 8L8 15" {...stroke} />
      <path d="M19 8L8 20" {...stroke} />
      <path d="M21.5 10.5L11.5 21.5" {...stroke} />
      <path d="M21.5 16L16.5 21.5" {...stroke} />
    </svg>
  );
}

/* --- editor chrome -------------------------------------------------------- */

export function IconUndo({ className, size = 24 }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path
        d="M5.63605 18.364C7.2647 19.9927 9.5147 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02945 16.9706 3 12 3C9.5147 3 7.2647 4.00736 5.63605 5.63605C4.80704 6.46505 3 8.5 3 8.5"
        {...stroke}
      />
      <path d="M3 4.5V8.5H7" {...stroke} />
    </svg>
  );
}

export function IconRedo({ className, size = 24 }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path
        d="M18.364 18.364C16.7353 19.9927 14.4853 21 12 21C7.02945 21 3 16.9706 3 12C3 7.02945 7.02945 3 12 3C14.4853 3 16.7353 4.00736 18.364 5.63605C19.193 6.46505 21 8.5 21 8.5"
        {...stroke}
      />
      <path d="M21 4V8.5H16.5" {...stroke} />
    </svg>
  );
}

export function IconPlus({ className, size = 24 }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M12.0303 5L12.012 19" {...stroke} />
      <path d="M5 12H19" {...stroke} />
    </svg>
  );
}

export function IconMinus({ className, size = 24 }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M5.25 12H19.25" {...stroke} />
    </svg>
  );
}

export function IconChevronDown({ className, size = 24 }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M18.5 9L12.5 15L6.5 9" {...stroke} strokeWidth={2} />
    </svg>
  );
}

/** The six maps, in the product's own order, for anything that iterates them. */
export const MATERIAL_MAPS = [
  { id: "diffuse", label: "Diffuse map", Icon: IconDiffuseMap },
  { id: "normal", label: "Normal map", Icon: IconNormalMap },
  { id: "roughness", label: "Roughness", Icon: IconRoughness },
  { id: "emission", label: "Emission", Icon: IconEmission },
  { id: "metalness", label: "Metalness", Icon: IconMetalness },
  { id: "transparency", label: "Transparency", Icon: IconTransparency }
] as const;

export type MaterialMapId = (typeof MATERIAL_MAPS)[number]["id"];
