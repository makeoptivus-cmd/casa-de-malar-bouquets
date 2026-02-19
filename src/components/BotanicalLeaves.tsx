import { motion } from "framer-motion";
import React from "react";

/**
 * Leaf variant types — each section uses a different combination
 * to avoid repetition while keeping a cohesive botanical pattern.
 *
 * "eucalyptus"  — rounded oval leaves, sage green
 * "olive"       — pointed paired leaves, warm olive + berries
 * "fern"        — delicate small frond
 * "monstera"    — single large tropical leaf
 * "willow"      — long drooping branch
 */

type LeafVariant = "eucalyptus" | "olive" | "fern" | "monstera" | "willow";

type Placement = {
  variant: LeafVariant;
  position: string; // Tailwind classes for positioning
  size: string; // Tailwind width classes
  rotation: number;
  opacity: number;
  delay?: number;
  flipX?: boolean;
  hideOnMobile?: boolean;
};

type Props = {
  /** Predefined pattern name to avoid manually specifying placements */
  pattern: 1 | 2 | 3 | 4 | 5 | 6;
};

// Each pattern is a set of 2-3 leaves positioned cross-wise
const PATTERNS: Record<number, Placement[]> = {
  1: [
    { variant: "eucalyptus", position: "absolute -top-16 -left-12 md:-left-6", size: "w-[200px] md:w-[280px]", rotation: -20, opacity: 0.1, delay: 0 },
    { variant: "olive", position: "absolute -bottom-12 -right-10 md:-right-4", size: "w-[180px] md:w-[260px]", rotation: 0, opacity: 0.09, delay: 0.3 },
    { variant: "fern", position: "absolute top-[55%] -left-6", size: "w-[100px] md:w-[140px]", rotation: 15, opacity: 0.06, delay: 0.6, hideOnMobile: true },
  ],
  2: [
    { variant: "monstera", position: "absolute -top-10 -right-10 md:-right-4", size: "w-[200px] md:w-[280px]", rotation: 15, opacity: 0.08, delay: 0 },
    { variant: "willow", position: "absolute -bottom-16 -left-8 md:-left-2", size: "w-[160px] md:w-[220px]", rotation: -10, opacity: 0.09, delay: 0.4 },
  ],
  3: [
    { variant: "olive", position: "absolute -top-12 -left-8 md:-left-4", size: "w-[170px] md:w-[240px]", rotation: -15, opacity: 0.09, delay: 0, flipX: true },
    { variant: "eucalyptus", position: "absolute -bottom-10 -right-8 md:-right-3", size: "w-[190px] md:w-[260px]", rotation: 25, opacity: 0.08, delay: 0.3 },
    { variant: "fern", position: "absolute top-[40%] -right-4", size: "w-[90px] md:w-[120px]", rotation: -20, opacity: 0.06, delay: 0.5, hideOnMobile: true },
  ],
  4: [
    { variant: "willow", position: "absolute -top-14 -right-6 md:-right-2", size: "w-[180px] md:w-[240px]", rotation: 10, opacity: 0.08, delay: 0 },
    { variant: "monstera", position: "absolute -bottom-8 -left-10 md:-left-4", size: "w-[160px] md:w-[220px]", rotation: -25, opacity: 0.09, delay: 0.35, flipX: true },
  ],
  5: [
    { variant: "fern", position: "absolute -top-10 -left-6 md:-left-2", size: "w-[140px] md:w-[200px]", rotation: -10, opacity: 0.08, delay: 0 },
    { variant: "olive", position: "absolute -bottom-14 -right-8 md:-right-3", size: "w-[180px] md:w-[250px]", rotation: 20, opacity: 0.09, delay: 0.4 },
  ],
  6: [
    { variant: "eucalyptus", position: "absolute -top-10 -right-8 md:-right-4", size: "w-[170px] md:w-[240px]", rotation: 20, opacity: 0.09, delay: 0, flipX: true },
    { variant: "willow", position: "absolute -bottom-10 -left-6 md:-left-2", size: "w-[140px] md:w-[190px]", rotation: -15, opacity: 0.07, delay: 0.3 },
    { variant: "monstera", position: "absolute top-[60%] -right-4", size: "w-[110px] md:w-[150px]", rotation: 30, opacity: 0.05, delay: 0.6, hideOnMobile: true },
  ],
};

/* ── Leaf SVG definitions ── */

const Eucalyptus: React.FC = () => (
  <g>
    <path d="M160 510 C155 420, 140 340, 150 260 C160 180, 145 100, 150 20" stroke="#7C9A6B" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <ellipse cx="120" cy="80" rx="28" ry="16" fill="#7C9A6B" transform="rotate(-35 120 80)" />
    <ellipse cx="180" cy="130" rx="30" ry="15" fill="#8BAF78" transform="rotate(25 180 130)" />
    <ellipse cx="115" cy="185" rx="32" ry="14" fill="#7C9A6B" transform="rotate(-40 115 185)" />
    <ellipse cx="185" cy="240" rx="28" ry="13" fill="#96B886" transform="rotate(30 185 240)" />
    <ellipse cx="120" cy="295" rx="30" ry="15" fill="#8BAF78" transform="rotate(-30 120 295)" />
    <ellipse cx="178" cy="345" rx="26" ry="13" fill="#7C9A6B" transform="rotate(35 178 345)" />
    <ellipse cx="130" cy="400" rx="24" ry="12" fill="#96B886" transform="rotate(-25 130 400)" />
    <ellipse cx="170" cy="450" rx="22" ry="11" fill="#8BAF78" transform="rotate(20 170 450)" />
    <line x1="100" y1="80" x2="140" y2="80" stroke="#6B8A5A" strokeWidth="0.5" transform="rotate(-35 120 80)" />
    <line x1="98" y1="185" x2="132" y2="185" stroke="#6B8A5A" strokeWidth="0.5" transform="rotate(-40 115 185)" />
  </g>
);

const Olive: React.FC = () => (
  <g>
    <path d="M140 470 C145 380, 160 300, 150 220 C140 140, 155 70, 150 10" stroke="#9B8B6C" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    <path d="M150 60 Q120 40 100 50 Q125 65 150 60Z" fill="#8B9A6B" />
    <path d="M150 60 Q175 35 200 42 Q178 60 150 60Z" fill="#A3B07A" />
    <path d="M148 130 Q110 115 88 128 Q115 140 148 130Z" fill="#8B9A6B" />
    <path d="M152 130 Q185 110 210 118 Q188 135 152 130Z" fill="#9BA87A" />
    <path d="M150 200 Q115 185 90 198 Q118 210 150 200Z" fill="#A3B07A" />
    <path d="M150 200 Q182 180 208 190 Q185 205 150 200Z" fill="#8B9A6B" />
    <path d="M148 275 Q112 260 88 275 Q116 285 148 275Z" fill="#9BA87A" />
    <path d="M152 275 Q185 258 212 268 Q188 282 152 275Z" fill="#A3B07A" />
    <path d="M150 345 Q118 332 96 345 Q122 355 150 345Z" fill="#8B9A6B" />
    <path d="M150 345 Q178 328 204 338 Q180 352 150 345Z" fill="#9BA87A" />
    <circle cx="95" cy="122" r="4" fill="#C4A86C" opacity="0.6" />
    <circle cx="205" cy="185" r="3.5" fill="#C4A86C" opacity="0.5" />
    <circle cx="92" cy="270" r="3" fill="#C4A86C" opacity="0.4" />
  </g>
);

const Fern: React.FC = () => (
  <g>
    <path d="M80 270 C78 200, 82 130, 80 20" stroke="#8BAF78" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    <path d="M80 50 Q55 35 42 42 Q58 52 80 50Z" fill="#8BAF78" />
    <path d="M80 50 Q100 32 115 38 Q102 50 80 50Z" fill="#96B886" />
    <path d="M80 95 Q50 82 38 90 Q54 100 80 95Z" fill="#96B886" />
    <path d="M80 95 Q105 78 120 85 Q106 97 80 95Z" fill="#8BAF78" />
    <path d="M80 140 Q52 128 40 136 Q56 146 80 140Z" fill="#8BAF78" />
    <path d="M80 140 Q106 125 118 132 Q105 143 80 140Z" fill="#96B886" />
    <path d="M80 185 Q56 175 46 182 Q60 190 80 185Z" fill="#96B886" />
    <path d="M80 185 Q102 172 112 180 Q100 190 80 185Z" fill="#8BAF78" />
    <path d="M80 225 Q62 218 54 224 Q64 230 80 225Z" fill="#8BAF78" />
    <path d="M80 225 Q96 215 106 220 Q98 228 80 225Z" fill="#96B886" />
  </g>
);

const Monstera: React.FC = () => (
  <g>
    {/* Stem */}
    <path d="M150 380 C148 320, 155 260, 150 200 C145 150, 150 100, 148 50" stroke="#6B8A5A" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Main leaf shape — large with splits */}
    <path d="M148 50 Q80 20 50 70 Q40 110 60 150 Q75 170 90 160 Q95 140 85 120 Q90 90 120 70 Q140 60 148 50Z" fill="#7C9A6B" />
    <path d="M148 50 Q215 15 250 65 Q262 108 240 145 Q225 168 210 155 Q205 135 215 115 Q212 85 185 68 Q160 55 148 50Z" fill="#8BAF78" />
    {/* Leaf veins */}
    <line x1="148" y1="55" x2="90" y2="100" stroke="#6B8A5A" strokeWidth="0.8" opacity="0.5" />
    <line x1="148" y1="55" x2="210" y2="95" stroke="#6B8A5A" strokeWidth="0.8" opacity="0.5" />
    <line x1="148" y1="55" x2="70" y2="140" stroke="#6B8A5A" strokeWidth="0.6" opacity="0.4" />
    <line x1="148" y1="55" x2="230" y2="135" stroke="#6B8A5A" strokeWidth="0.6" opacity="0.4" />
    {/* Second smaller leaf */}
    <path d="M150 200 Q110 175 90 200 Q85 225 100 245 Q112 235 108 215 Q115 195 150 200Z" fill="#96B886" />
    <path d="M150 200 Q185 178 210 198 Q216 222 200 240 Q190 232 194 212 Q188 193 150 200Z" fill="#7C9A6B" />
  </g>
);

const Willow: React.FC = () => (
  <g>
    {/* Main drooping branch */}
    <path d="M100 10 C105 80, 95 160, 110 240 C120 300, 105 360, 115 420" stroke="#9B8B6C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Drooping leaf sprays */}
    <path d="M100 50 C85 65, 70 90, 60 120" stroke="#8BAF78" strokeWidth="0.8" fill="none" />
    <ellipse cx="58" cy="122" rx="8" ry="4" fill="#8BAF78" transform="rotate(-60 58 122)" />
    <path d="M100 50 C115 62, 130 85, 140 110" stroke="#96B886" strokeWidth="0.8" fill="none" />
    <ellipse cx="142" cy="112" rx="8" ry="4" fill="#96B886" transform="rotate(55 142 112)" />
    <path d="M105 120 C88 138, 72 165, 55 195" stroke="#7C9A6B" strokeWidth="0.8" fill="none" />
    <ellipse cx="53" cy="197" rx="9" ry="4" fill="#7C9A6B" transform="rotate(-65 53 197)" />
    <path d="M105 120 C120 135, 140 160, 155 190" stroke="#8BAF78" strokeWidth="0.8" fill="none" />
    <ellipse cx="157" cy="192" rx="8" ry="4" fill="#8BAF78" transform="rotate(60 157 192)" />
    <path d="M108 200 C90 220, 75 250, 60 280" stroke="#96B886" strokeWidth="0.8" fill="none" />
    <ellipse cx="58" cy="282" rx="9" ry="4" fill="#96B886" transform="rotate(-58 58 282)" />
    <path d="M108 200 C125 218, 145 245, 158 275" stroke="#7C9A6B" strokeWidth="0.8" fill="none" />
    <ellipse cx="160" cy="277" rx="8" ry="4" fill="#7C9A6B" transform="rotate(62 160 277)" />
    <path d="M112 300 C98 318, 85 340, 75 365" stroke="#8BAF78" strokeWidth="0.7" fill="none" />
    <ellipse cx="73" cy="367" rx="7" ry="3.5" fill="#8BAF78" transform="rotate(-55 73 367)" />
    <path d="M112 300 C126 316, 140 340, 148 365" stroke="#96B886" strokeWidth="0.7" fill="none" />
    <ellipse cx="150" cy="367" rx="7" ry="3.5" fill="#96B886" transform="rotate(58 150 367)" />
  </g>
);

const VIEWBOXES: Record<LeafVariant, string> = {
  eucalyptus: "0 0 300 520",
  olive: "0 0 300 480",
  fern: "0 0 160 280",
  monstera: "0 0 300 400",
  willow: "0 0 220 430",
};

const LEAF_COMPONENTS: Record<LeafVariant, React.FC> = {
  eucalyptus: Eucalyptus,
  olive: Olive,
  fern: Fern,
  monstera: Monstera,
  willow: Willow,
};

const BotanicalLeaves: React.FC<Props> = ({ pattern }) => {
  const placements = PATTERNS[pattern] || PATTERNS[1];

  return (
    <>
      {placements.map((p, i) => {
        const LeafComponent = LEAF_COMPONENTS[p.variant];
        return (
          <motion.svg
            key={`leaf-${pattern}-${i}`}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: p.opacity }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: "easeOut", delay: p.delay ?? 0 }}
            className={`${p.position} ${p.size} h-auto pointer-events-none select-none ${p.hideOnMobile ? "hidden md:block" : ""}`}
            viewBox={VIEWBOXES[p.variant]}
            fill="none"
            style={{
              transform: `rotate(${p.rotation}deg)${p.flipX ? " scaleX(-1)" : ""}`,
            }}
          >
            <LeafComponent />
          </motion.svg>
        );
      })}
    </>
  );
};

export default BotanicalLeaves;
