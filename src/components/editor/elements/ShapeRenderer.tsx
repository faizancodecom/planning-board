import React from 'react';
import { ShapeElement } from '@/types/board';

interface ShapeRendererProps {
  element: ShapeElement;
  isSelected?: boolean;
}

export const ShapeRenderer: React.FC<ShapeRendererProps> = ({ element, isSelected }) => {
  const {
    shapeType,
    x,
    y,
    width,
    height,
    fill,
    stroke,
    strokeWidth,
    strokeDash,
    text,
    label,
    fontSize,
  } = element;

  const strokeDasharray =
    strokeDash === 'dashed' ? '8 6' : strokeDash === 'dotted' ? '3 4' : undefined;

  const defaultFill = fill && fill !== 'transparent' ? fill : '#18181b';
  const defaultStroke = stroke || '#ffffff';
  const defaultStrokeWidth = strokeWidth || 2;
  const displayText = text ?? (shapeType === 'flowchart' ? 'Process Node' : undefined);
  const displayLabel = label;

  const renderTextLabel = (
    centerX: number,
    centerY: number,
    customText?: string,
    maxWidth?: number
  ) => {
    const textToShow = customText || displayText;
    if (!textToShow || height < 16 || width < 20) return null;

    const calcFontSize = fontSize || Math.min(15, Math.max(10, Math.min(width / 7, height / 2.8)));

    return (
      <text
        x={centerX}
        y={centerY}
        fill={stroke === 'transparent' ? '#ffffff' : stroke || '#ffffff'}
        fontSize={calcFontSize}
        fontFamily="sans-serif"
        fontWeight="600"
        textAnchor="middle"
        dominantBaseline="middle"
        className="pointer-events-none select-none drop-shadow-sm"
        style={{ maxWidth: maxWidth ? `${maxWidth}px` : undefined }}
      >
        {textToShow}
      </text>
    );
  };

  const renderConnectorLabel = (midX: number, midY: number, textLabel?: string) => {
    const txt = textLabel || displayLabel;
    if (!txt) return null;
    const labelWidth = Math.max(32, txt.length * 8 + 12);
    const labelHeight = 20;

    return (
      <g className="pointer-events-none select-none">
        <rect
          x={midX - labelWidth / 2}
          y={midY - labelHeight / 2}
          width={labelWidth}
          height={labelHeight}
          rx={6}
          fill="#09090b"
          stroke={defaultStroke}
          strokeWidth={1.5}
        />
        <text
          x={midX}
          y={midY + 1}
          fill={defaultStroke}
          fontSize={11}
          fontFamily="sans-serif"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {txt}
        </text>
      </g>
    );
  };

  const renderShape = () => {
    switch (shapeType) {
      /* ================= STANDARD SHAPES ================= */
      case 'rectangle':
        return (
          <g>
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              rx={8}
              fill={fill || 'transparent'}
              stroke={defaultStroke}
              strokeWidth={defaultStrokeWidth}
              strokeDasharray={strokeDasharray}
            />
            {displayText && renderTextLabel(x + width / 2, y + height / 2)}
          </g>
        );

      case 'circle':
        return (
          <g>
            <ellipse
              cx={x + width / 2}
              cy={y + height / 2}
              rx={width / 2}
              ry={height / 2}
              fill={fill || 'transparent'}
              stroke={defaultStroke}
              strokeWidth={defaultStrokeWidth}
              strokeDasharray={strokeDasharray}
            />
            {displayText && renderTextLabel(x + width / 2, y + height / 2)}
          </g>
        );

      case 'diamond': {
        const cx = x + width / 2;
        const cy = y + height / 2;
        const pts = `${cx},${y} ${x + width},${cy} ${cx},${y + height} ${x},${cy}`;
        return (
          <g>
            <polygon
              points={pts}
              fill={fill || 'transparent'}
              stroke={defaultStroke}
              strokeWidth={defaultStrokeWidth}
              strokeDasharray={strokeDasharray}
            />
            {displayText && renderTextLabel(cx, cy, displayText, width * 0.7)}
          </g>
        );
      }

      case 'star': {
        const cx = x + width / 2;
        const cy = y + height / 2;
        const outerR = Math.min(width, height) / 2;
        const innerR = outerR * 0.45;
        let pts = '';
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          const px = cx + r * Math.cos(angle);
          const py = cy + r * Math.sin(angle);
          pts += `${px},${py} `;
        }
        return (
          <g>
            <polygon
              points={pts.trim()}
              fill={fill || 'transparent'}
              stroke={defaultStroke}
              strokeWidth={defaultStrokeWidth}
              strokeDasharray={strokeDasharray}
            />
            {displayText && renderTextLabel(cx, cy)}
          </g>
        );
      }

      /* ================= FLOWCHART NODES ================= */
      case 'flowchart':
      case 'flowchart-process': {
        const nodeText = displayText || 'Process Step';
        return (
          <g>
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              rx={10}
              fill={defaultFill}
              stroke={defaultStroke}
              strokeWidth={defaultStrokeWidth}
              strokeDasharray={strokeDasharray}
            />
            {renderTextLabel(x + width / 2, y + height / 2, nodeText)}
          </g>
        );
      }

      case 'flowchart-terminator': {
        // Oval capsule shape (Start / End)
        const radius = Math.min(width / 2, height / 2);
        const nodeText = displayText || 'Start / End';
        return (
          <g>
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              rx={radius}
              ry={radius}
              fill={defaultFill}
              stroke={defaultStroke}
              strokeWidth={defaultStrokeWidth}
              strokeDasharray={strokeDasharray}
            />
            {renderTextLabel(x + width / 2, y + height / 2, nodeText)}
          </g>
        );
      }

      case 'flowchart-decision': {
        // Diamond Decision condition
        const cx = x + width / 2;
        const cy = y + height / 2;
        const pts = `${cx},${y} ${x + width},${cy} ${cx},${y + height} ${x},${cy}`;
        const nodeText = displayText || 'Condition?';
        return (
          <g>
            <polygon
              points={pts}
              fill={defaultFill}
              stroke={defaultStroke}
              strokeWidth={defaultStrokeWidth}
              strokeDasharray={strokeDasharray}
            />
            {renderTextLabel(cx, cy, nodeText, width * 0.65)}
          </g>
        );
      }

      case 'flowchart-data': {
        // Parallelogram for Input / Output Data
        const skew = Math.min(24, width * 0.2);
        const pts = `${x + skew},${y} ${x + width},${y} ${x + width - skew},${y + height} ${x},${y + height}`;
        const nodeText = displayText || 'Input / Output';
        return (
          <g>
            <polygon
              points={pts}
              fill={defaultFill}
              stroke={defaultStroke}
              strokeWidth={defaultStrokeWidth}
              strokeDasharray={strokeDasharray}
            />
            {renderTextLabel(x + width / 2, y + height / 2, nodeText)}
          </g>
        );
      }

      case 'flowchart-database': {
        // Cylinder for database storage
        const topH = Math.min(20, height * 0.25);
        const nodeText = displayText || 'Database';
        return (
          <g>
            {/* Cylinder body */}
            <path
              d={`
                M ${x},${y + topH}
                L ${x},${y + height - topH}
                A ${width / 2} ${topH} 0 0 0 ${x + width},${y + height - topH}
                L ${x + width},${y + topH}
                Z
              `}
              fill={defaultFill}
              stroke={defaultStroke}
              strokeWidth={defaultStrokeWidth}
              strokeDasharray={strokeDasharray}
            />
            {/* Top ellipse */}
            <ellipse
              cx={x + width / 2}
              cy={y + topH}
              rx={width / 2}
              ry={topH}
              fill={defaultFill}
              stroke={defaultStroke}
              strokeWidth={defaultStrokeWidth}
            />
            {/* Bottom arc shadow */}
            <path
              d={`M ${x},${y + height - topH} A ${width / 2} ${topH} 0 0 0 ${x + width},${y + height - topH}`}
              fill="none"
              stroke={defaultStroke}
              strokeWidth={defaultStrokeWidth}
            />
            {renderTextLabel(x + width / 2, y + height / 2 + topH / 2, nodeText)}
          </g>
        );
      }

      case 'flowchart-document': {
        // Document with wave at bottom
        const waveD = `
          M ${x},${y}
          L ${x + width},${y}
          L ${x + width},${y + height - 14}
          Q ${x + (width * 3) / 4},${y + height} ${x + width / 2},${y + height - 10}
          Q ${x + width / 4},${y + height - 20} ${x},${y + height - 8}
          Z
        `;
        const nodeText = displayText || 'Document';
        return (
          <g>
            <path
              d={waveD}
              fill={defaultFill}
              stroke={defaultStroke}
              strokeWidth={defaultStrokeWidth}
              strokeDasharray={strokeDasharray}
            />
            {renderTextLabel(x + width / 2, y + (height - 10) / 2, nodeText)}
          </g>
        );
      }

      case 'flowchart-subprocess': {
        // Box with predefined double vertical stripes
        const margin = Math.min(16, width * 0.15);
        const nodeText = displayText || 'Subprocess';
        return (
          <g>
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              rx={6}
              fill={defaultFill}
              stroke={defaultStroke}
              strokeWidth={defaultStrokeWidth}
              strokeDasharray={strokeDasharray}
            />
            <line
              x1={x + margin}
              y1={y}
              x2={x + margin}
              y2={y + height}
              stroke={defaultStroke}
              strokeWidth={defaultStrokeWidth}
            />
            <line
              x1={x + width - margin}
              y1={y}
              x2={x + width - margin}
              y2={y + height}
              stroke={defaultStroke}
              strokeWidth={defaultStrokeWidth}
            />
            {renderTextLabel(x + width / 2, y + height / 2, nodeText)}
          </g>
        );
      }

      case 'flowchart-preparation': {
        // Hexagon for preparation / setup / loop
        const inset = Math.min(20, width * 0.2);
        const pts = `${x + inset},${y} ${x + width - inset},${y} ${x + width},${y + height / 2} ${x + width - inset},${y + height} ${x + inset},${y + height} ${x},${y + height / 2}`;
        const nodeText = displayText || 'Preparation';
        return (
          <g>
            <polygon
              points={pts}
              fill={defaultFill}
              stroke={defaultStroke}
              strokeWidth={defaultStrokeWidth}
              strokeDasharray={strokeDasharray}
            />
            {renderTextLabel(x + width / 2, y + height / 2, nodeText)}
          </g>
        );
      }

      case 'flowchart-connector': {
        // Small circle node for jumps/connectors
        const nodeText = displayText || '1';
        return (
          <g>
            <ellipse
              cx={x + width / 2}
              cy={y + height / 2}
              rx={width / 2}
              ry={height / 2}
              fill={defaultFill}
              stroke={defaultStroke}
              strokeWidth={defaultStrokeWidth}
              strokeDasharray={strokeDasharray}
            />
            {renderTextLabel(x + width / 2, y + height / 2, nodeText)}
          </g>
        );
      }

      case 'flowchart-cloud': {
        // Cloud shape for cloud services / network
        const nodeText = displayText || 'Cloud Service';
        const cx = x + width / 2;
        const cy = y + height / 2;
        const w = width;
        const h = height;
        return (
          <g>
            <path
              d={`
                M ${x + w * 0.25},${y + h * 0.75}
                A ${w * 0.2} ${h * 0.25} 0 0 1 ${x + w * 0.15},${y + h * 0.45}
                A ${w * 0.25} ${h * 0.3} 0 0 1 ${x + w * 0.45},${y + h * 0.25}
                A ${w * 0.3} ${h * 0.35} 0 0 1 ${x + w * 0.8},${y + h * 0.35}
                A ${w * 0.22} ${h * 0.25} 0 0 1 ${x + w * 0.88},${y + h * 0.7}
                A ${w * 0.2} ${h * 0.2} 0 0 1 ${x + w * 0.75},${y + h * 0.85}
                L ${x + w * 0.25},${y + h * 0.85}
                Z
              `}
              fill={defaultFill}
              stroke={defaultStroke}
              strokeWidth={defaultStrokeWidth}
              strokeDasharray={strokeDasharray}
            />
            {renderTextLabel(cx, cy + 2, nodeText)}
          </g>
        );
      }

      case 'flowchart-delay': {
        // Semi-oval D shape for Delay / Buffer
        const nodeText = displayText || 'Delay';
        return (
          <g>
            <path
              d={`
                M ${x},${y}
                L ${x + width / 2},${y}
                A ${width / 2} ${height / 2} 0 0 1 ${x + width / 2},${y + height}
                L ${x},${y + height}
                Z
              `}
              fill={defaultFill}
              stroke={defaultStroke}
              strokeWidth={defaultStrokeWidth}
              strokeDasharray={strokeDasharray}
            />
            {renderTextLabel(x + width * 0.4, y + height / 2, nodeText)}
          </g>
        );
      }

      /* ================= CONNECTORS & ARROWS ================= */
      case 'arrow':
      case 'connector-straight': {
        const startX = element.flipX ? x + width : x;
        const startY = element.flipY ? y + height : y;
        const endX = element.flipX ? x : x + width;
        const endY = element.flipY ? y : y + height;

        const headSize = Math.min(20, Math.max(10, Math.hypot(endX - startX, endY - startY) / 5));
        const dx = endX - startX;
        const dy = endY - startY;
        const angle = Math.atan2(dy, dx);
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const isAnimated = element.animated !== false;

        return (
          <g>
            <line
              x1={startX}
              y1={startY}
              x2={endX - Math.cos(angle) * (headSize / 2)}
              y2={endY - Math.sin(angle) * (headSize / 2)}
              stroke={defaultStroke}
              strokeWidth={defaultStrokeWidth || 3}
              strokeDasharray={isAnimated ? '8 6' : strokeDasharray}
              className={isAnimated ? 'animate-flow-line' : ''}
              strokeLinecap="round"
            />
            <polygon
              points={`
                ${endX},${endY} 
                ${endX - headSize * Math.cos(angle - Math.PI / 6)},${endY - headSize * Math.sin(angle - Math.PI / 6)} 
                ${endX - headSize * Math.cos(angle + Math.PI / 6)},${endY - headSize * Math.sin(angle + Math.PI / 6)}
              `}
              fill={defaultStroke}
            />
            {renderConnectorLabel(midX, midY)}
          </g>
        );
      }

      case 'connector-elbow': {
        // Orthogonal Right-Angle Stepped Connector
        const startX = element.flipX ? x + width : x;
        const startY = element.flipY ? y + height : y;
        const endX = element.flipX ? x : x + width;
        const endY = element.flipY ? y : y + height;

        const midX = (startX + endX) / 2;
        const headSize = 14;
        const isHorizontalEnd = Math.abs(endX - midX) > 0;
        const angle = isHorizontalEnd ? (endX > midX ? 0 : Math.PI) : endY > startY ? Math.PI / 2 : -Math.PI / 2;

        const pathD = `M ${startX},${startY} L ${midX},${startY} L ${midX},${endY} L ${endX - Math.cos(angle) * (headSize / 2)},${endY}`;
        const isAnimated = element.animated !== false;

        return (
          <g>
            <path
              d={pathD}
              fill="none"
              stroke={defaultStroke}
              strokeWidth={defaultStrokeWidth || 3}
              strokeDasharray={isAnimated ? '8 6' : strokeDasharray}
              className={isAnimated ? 'animate-flow-line' : ''}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polygon
              points={`
                ${endX},${endY} 
                ${endX - headSize * Math.cos(angle - Math.PI / 6)},${endY - headSize * Math.sin(angle - Math.PI / 6)} 
                ${endX - headSize * Math.cos(angle + Math.PI / 6)},${endY - headSize * Math.sin(angle + Math.PI / 6)}
              `}
              fill={defaultStroke}
            />
            {renderConnectorLabel(midX, (startY + endY) / 2)}
          </g>
        );
      }

      case 'connector-curved': {
        // Smooth Bezier Curved Connector
        const startX = element.flipX ? x + width : x;
        const startY = element.flipY ? y + height : y;
        const endX = element.flipX ? x : x + width;
        const endY = element.flipY ? y : y + height;

        const dx = endX - startX;
        const cp1x = startX + dx * 0.5;
        const cp1y = startY;
        const cp2x = startX + dx * 0.5;
        const cp2y = endY;

        const headSize = 14;
        const angle = Math.atan2(endY - cp2y, endX - cp2x) || (endX > startX ? 0 : Math.PI);
        const pathD = `M ${startX},${startY} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${endX - Math.cos(angle) * (headSize / 2)},${endY}`;
        const isAnimated = element.animated !== false;

        return (
          <g>
            <path
              d={pathD}
              fill="none"
              stroke={defaultStroke}
              strokeWidth={defaultStrokeWidth || 3}
              strokeDasharray={isAnimated ? '8 6' : strokeDasharray}
              className={isAnimated ? 'animate-flow-line' : ''}
              strokeLinecap="round"
            />
            <polygon
              points={`
                ${endX},${endY} 
                ${endX - headSize * Math.cos(angle - Math.PI / 6)},${endY - headSize * Math.sin(angle - Math.PI / 6)} 
                ${endX - headSize * Math.cos(angle + Math.PI / 6)},${endY - headSize * Math.sin(angle + Math.PI / 6)}
              `}
              fill={defaultStroke}
            />
            {renderConnectorLabel((startX + endX) / 2, (startY + endY) / 2)}
          </g>
        );
      }

      case 'connector-bidirectional': {
        // Double-ended Arrow
        const startX = element.flipX ? x + width : x;
        const startY = element.flipY ? y + height : y;
        const endX = element.flipX ? x : x + width;
        const endY = element.flipY ? y : y + height;

        const headSize = 14;
        const dx = endX - startX;
        const dy = endY - startY;
        const angle = Math.atan2(dy, dx);
        const isAnimated = element.animated !== false;

        return (
          <g>
            <line
              x1={startX + Math.cos(angle) * (headSize / 2)}
              y1={startY + Math.sin(angle) * (headSize / 2)}
              x2={endX - Math.cos(angle) * (headSize / 2)}
              y2={endY - Math.sin(angle) * (headSize / 2)}
              stroke={defaultStroke}
              strokeWidth={defaultStrokeWidth || 3}
              strokeDasharray={isAnimated ? '8 6' : strokeDasharray}
              className={isAnimated ? 'animate-flow-line' : ''}
              strokeLinecap="round"
            />
            {/* Start Arrowhead */}
            <polygon
              points={`
                ${startX},${startY} 
                ${startX + headSize * Math.cos(angle - Math.PI / 6)},${startY + headSize * Math.sin(angle - Math.PI / 6)} 
                ${startX + headSize * Math.cos(angle + Math.PI / 6)},${startY + headSize * Math.sin(angle + Math.PI / 6)}
              `}
              fill={defaultStroke}
            />
            {/* End Arrowhead */}
            <polygon
              points={`
                ${endX},${endY} 
                ${endX - headSize * Math.cos(angle - Math.PI / 6)},${endY - headSize * Math.sin(angle - Math.PI / 6)} 
                ${endX - headSize * Math.cos(angle + Math.PI / 6)},${endY - headSize * Math.sin(angle + Math.PI / 6)}
              `}
              fill={defaultStroke}
            />
            {renderConnectorLabel((startX + endX) / 2, (startY + endY) / 2)}
          </g>
        );
      }

      case 'connector-dashed': {
        // Dashed Dependency Connector
        const startX = element.flipX ? x + width : x;
        const startY = element.flipY ? y + height : y;
        const endX = element.flipX ? x : x + width;
        const endY = element.flipY ? y : y + height;

        const headSize = 14;
        const dx = endX - startX;
        const dy = endY - startY;
        const angle = Math.atan2(dy, dx);
        const isAnimated = element.animated !== false;

        return (
          <g>
            <line
              x1={startX}
              y1={startY}
              x2={endX - Math.cos(angle) * (headSize / 2)}
              y2={endY - Math.sin(angle) * (headSize / 2)}
              stroke={defaultStroke}
              strokeWidth={defaultStrokeWidth || 2.5}
              strokeDasharray="6 6"
              className={isAnimated ? 'animate-flow-line-fast' : ''}
              strokeLinecap="round"
            />
            <polygon
              points={`
                ${endX},${endY} 
                ${endX - headSize * Math.cos(angle - Math.PI / 6)},${endY - headSize * Math.sin(angle - Math.PI / 6)} 
                ${endX - headSize * Math.cos(angle + Math.PI / 6)},${endY - headSize * Math.sin(angle + Math.PI / 6)}
              `}
              fill={defaultStroke}
            />
            {renderConnectorLabel((startX + endX) / 2, (startY + endY) / 2)}
          </g>
        );
      }

      case 'line': {
        const startX = element.flipX ? x + width : x;
        const startY = element.flipY ? y + height : y;
        const endX = element.flipX ? x : x + width;
        const endY = element.flipY ? y : y + height;

        return (
          <g>
            <line
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke={defaultStroke}
              strokeWidth={defaultStrokeWidth}
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
            />
            {renderConnectorLabel((startX + endX) / 2, (startY + endY) / 2)}
          </g>
        );
      }

      default:
        return null;
    }
  };

  return (
    <g className="cursor-pointer">
      {/* Background shape */}
      {renderShape()}

      {/* Selected Bounding Box Outline */}
      {isSelected && (
        <rect
          x={x - 4}
          y={y - 4}
          width={width + 8}
          height={height + 8}
          fill="none"
          stroke="#38bdf8"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          className="pointer-events-none"
        />
      )}
    </g>
  );
};
