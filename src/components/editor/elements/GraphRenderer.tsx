import React from 'react';
import { GraphElement, ChartColorTheme } from '@/types/board';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { BarChart3, TrendingUp, Settings2, Trash2 } from 'lucide-react';

interface GraphRendererProps {
  element: GraphElement;
  isSelected?: boolean;
  onOpenDataEditor?: () => void;
  onDelete?: () => void;
}

export const CHART_PALETTES: Record<ChartColorTheme, string[]> = {
  vibrant: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'],
  emerald: ['#10b981', '#34d399', '#6ee7b7', '#059669', '#047857', '#a7f3d0'],
  sunset: ['#f97316', '#fb923c', '#f59e0b', '#ea580c', '#ef4444', '#f43f5e'],
  ocean: ['#0ea5e9', '#38bdf8', '#60a5fa', '#0284c7', '#2563eb', '#3b82f6'],
  purple: ['#8b5cf6', '#a78bfa', '#c084fc', '#7c3aed', '#d946ef', '#ec4899'],
  monochrome: ['#ffffff', '#e4e4e7', '#a1a1aa', '#71717a', '#3f3f46', '#27272a'],
  custom: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
};

export const GraphRenderer: React.FC<GraphRendererProps> = ({
  element,
  isSelected,
  onOpenDataEditor,
  onDelete,
}) => {
  const {
    x,
    y,
    width,
    height,
    chartType,
    title,
    data,
    colorTheme = 'vibrant',
    customColor,
    metricPrefix,
    metricSuffix,
    metricChange,
    description,
  } = element;

  const palette = CHART_PALETTES[colorTheme] || CHART_PALETTES.vibrant;
  const primaryColor = customColor || palette[0];

  const renderChart = () => {
    if (chartType === 'metric') {
      const val = data && data[0] ? data[0].value : 0;
      return (
        <div className="flex flex-col justify-center items-center h-full p-4 text-center">
          <span
            className="text-3xl sm:text-4xl font-black font-mono tracking-tight"
            style={{ color: primaryColor }}
          >
            {metricPrefix || ''}
            {val.toLocaleString()}
            {metricSuffix || ''}
          </span>
          {metricChange && (
            <div
              className="mt-2 flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: `${primaryColor}18`,
                borderColor: `${primaryColor}40`,
                color: primaryColor,
              }}
            >
              <TrendingUp className="w-3 h-3" strokeWidth={2.5} />
              <span>{metricChange}</span>
            </div>
          )}
          {description && <p className="text-xs text-zinc-400 mt-1">{description}</p>}
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-xs text-zinc-500 font-mono">
          No chart data available
        </div>
      );
    }

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#09090b',
                  borderColor: '#27272a',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
                formatter={(val: any) => [`${metricPrefix || ''}${val}${metricSuffix || ''}`, 'Value']}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`bar-cell-${index}`}
                    fill={entry.color || palette[index % palette.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#09090b',
                  borderColor: '#27272a',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
                formatter={(val: any) => [`${metricPrefix || ''}${val}${metricSuffix || ''}`, 'Value']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={primaryColor}
                strokeWidth={3.5}
                dot={{ fill: '#09090b', stroke: primaryColor, strokeWidth: 2.5, r: 4.5 }}
                activeDot={{ r: 7, fill: primaryColor }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`areaGrad_${element.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.6} />
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#09090b',
                  borderColor: '#27272a',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={primaryColor}
                strokeWidth={3}
                fill={`url(#areaGrad_${element.id})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#09090b',
                  borderColor: '#27272a',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
                formatter={(val: any) => [`${val}${metricSuffix || ''}`, 'Value']}
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={height > 200 ? 35 : 20}
                outerRadius={height > 200 ? 65 : 45}
                paddingAngle={4}
                dataKey="value"
                nameKey="label"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || palette[index % palette.length]}
                    stroke="#09090b"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
      }}
      className={cn(
        'group select-none rounded-xl border-2 border-zinc-800 bg-zinc-950/95 backdrop-blur p-3.5 transition-all shadow-xl flex flex-col',
        isSelected && 'ring-2 ring-white ring-offset-2 ring-offset-black border-zinc-500'
      )}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onOpenDataEditor?.();
      }}
    >
      {/* Top Chart Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2 overflow-hidden">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: primaryColor }}
          />
          <span className="text-xs font-bold text-zinc-200 tracking-wide truncate">{title}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDataEditor?.();
            }}
            title="Edit Chart Data & Colors"
            className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-700 cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Delete Graph"
              className="p-1 rounded hover:bg-red-500/20 hover:text-red-500 text-zinc-500 hover:border-red-500/40 transition-colors border border-transparent cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="flex-1 w-full h-full min-h-0 relative">{renderChart()}</div>
    </div>
  );
};
