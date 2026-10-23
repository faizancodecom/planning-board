import React from 'react';
import { DrawingElement } from '@/types/board';

interface PenPathRendererProps {
  element: DrawingElement;
  isSelected?: boolean;
}

export const PenPathRenderer: React.FC<PenPathRendererProps> = ({ element, isSelected }) => {
  const { points, stroke, strokeWidth, opacity, type } = element;

  if (!points || points.length < 2) return null;

  // Generate SVG path string with quadratic curves for smooth natural marker feeling
  const generateSmoothPath = (pts: { x: number; y: number }[]) => {
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const xc = (pts[i].x + pts[i + 1].x) / 2;
      const yc = (pts[i].y + pts[i + 1].y) / 2;
      d += ` Q ${pts[i].x} ${pts[i].y}, ${xc} ${yc}`;
    }
    if (pts.length > 1) {
      d += ` L ${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
    }
    return d;
  };

  const pathData = generateSmoothPath(points);

  // Configure styling based on drawing tool type
  const strokeLinecap = type === 'marker' ? 'square' : 'round';
  const strokeLinejoin = type === 'marker' ? 'miter' : 'round';
  const actualOpacity = type === 'highlighter' ? 0.35 : opacity || 1;
  const blendMode = type === 'highlighter' ? 'screen' : 'normal';

  return (
    <g className="cursor-pointer group">
      {/* Invisible thicker stroke for easier click/hover selection */}
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth={Math.max(strokeWidth + 16, 24)}
      />

      {/* Selected outline glow */}
      {isSelected && (
        <path
          d={pathData}
          fill="none"
          stroke="#ffffff"
          strokeWidth={strokeWidth + 6}
          strokeOpacity={0.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Actual Drawn Path */}
      <path
        d={pathData}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={actualOpacity}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
        style={{ mixBlendMode: blendMode }}
      />
    </g>
  );
};
