import React, { useState, useEffect } from 'react';
import { GraphElement, ChartType, ChartColorTheme, ChartDataPoint } from '@/types/board';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Trash2,
  BarChart2,
  LineChart,
  PieChart,
  Activity,
  Sparkles,
  Palette,
} from 'lucide-react';
import { CHART_PALETTES } from './elements/GraphRenderer';

interface ChartConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: GraphElement | null;
  onSave: (updated: Partial<GraphElement>) => void;
}

export const ChartConfigModal: React.FC<ChartConfigModalProps> = ({
  isOpen,
  onClose,
  element,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [colorTheme, setColorTheme] = useState<ChartColorTheme>('vibrant');
  const [customColor, setCustomColor] = useState('#3b82f6');
  const [metricPrefix, setMetricPrefix] = useState('');
  const [metricSuffix, setMetricSuffix] = useState('');
  const [metricChange, setMetricChange] = useState('');
  const [dataPoints, setDataPoints] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    if (element) {
      setTitle(element.title || 'Chart Title');
      setChartType(element.chartType || 'bar');
      setColorTheme(element.colorTheme || 'vibrant');
      setCustomColor(element.customColor || '#3b82f6');
      setMetricPrefix(element.metricPrefix || '');
      setMetricSuffix(element.metricSuffix || '');
      setMetricChange(element.metricChange || '');
      setDataPoints(element.data ? JSON.parse(JSON.stringify(element.data)) : []);
    }
  }, [element, isOpen]);

  const handleAddRow = () => {
    setDataPoints((prev) => [
      ...prev,
      { label: `Item ${prev.length + 1}`, value: Math.floor(Math.random() * 80) + 20 },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setDataPoints((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (index: number, field: 'label' | 'value' | 'color', val: any) => {
    setDataPoints((prev) => {
      const copy = [...prev];
      if (field === 'value') {
        copy[index] = { ...copy[index], value: parseFloat(val) || 0 };
      } else if (field === 'color') {
        copy[index] = { ...copy[index], color: val };
      } else {
        copy[index] = { ...copy[index], label: val };
      }
      return copy;
    });
  };

  const handleSave = () => {
    onSave({
      title,
      chartType,
      colorTheme,
      customColor,
      metricPrefix,
      metricSuffix,
      metricChange,
      data: dataPoints,
    });
    onClose();
  };

  const chartTypes: { type: ChartType; label: string; icon: React.ReactNode }[] = [
    { type: 'bar', label: 'Bar Chart', icon: <BarChart2 className="w-4 h-4" strokeWidth={2.5} /> },
    { type: 'line', label: 'Line Chart', icon: <LineChart className="w-4 h-4" strokeWidth={2.5} /> },
    { type: 'pie', label: 'Pie Chart', icon: <PieChart className="w-4 h-4" strokeWidth={2.5} /> },
    { type: 'metric', label: 'KPI Metric', icon: <Activity className="w-4 h-4" strokeWidth={2.5} /> },
  ];

  const themeOptions: { id: ChartColorTheme; label: string; preview: string[] }[] = [
    { id: 'vibrant', label: 'Vibrant Multi', preview: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'] },
    { id: 'emerald', label: 'Emerald Mint', preview: ['#10b981', '#34d399', '#059669', '#047857'] },
    { id: 'sunset', label: 'Sunset Coral', preview: ['#f97316', '#fb923c', '#ea580c', '#ef4444'] },
    { id: 'ocean', label: 'Ocean Sky', preview: ['#0ea5e9', '#38bdf8', '#0284c7', '#2563eb'] },
    { id: 'purple', label: 'Lavender Violet', preview: ['#8b5cf6', '#a78bfa', '#7c3aed', '#d946ef'] },
    { id: 'monochrome', label: 'Monochrome B&W', preview: ['#ffffff', '#a1a1aa', '#71717a', '#27272a'] },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
            Configure Graph & Color Theme
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Chart Title */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Chart Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Growth Strategy / Study Hours"
            />
          </div>

          {/* Chart Type Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Chart Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {chartTypes.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setChartType(item.type)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 text-xs font-bold transition-all cursor-pointer ${
                    chartType === item.type
                      ? 'border-white bg-white text-black shadow-solid'
                      : 'border-border bg-card text-foreground hover:border-muted-foreground'
                  }`}
                >
                  <div className="mb-1.5">{item.icon}</div>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Theme Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" strokeWidth={2.5} />
              Color Palette Theme
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {themeOptions.map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setColorTheme(th.id)}
                  className={`p-2.5 rounded-lg border-2 text-left transition-all cursor-pointer ${
                    colorTheme === th.id
                      ? 'border-white bg-zinc-900 shadow-solid'
                      : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-xs font-bold text-zinc-200 block mb-1.5">{th.label}</span>
                  <div className="flex gap-1">
                    {th.preview.map((c, idx) => (
                      <span
                        key={idx}
                        className="w-3.5 h-3.5 rounded-full inline-block border border-black/40"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Prefixes & Suffixes */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">Prefix</label>
              <Input
                value={metricPrefix}
                onChange={(e) => setMetricPrefix(e.target.value)}
                placeholder="e.g. $"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">Suffix</label>
              <Input
                value={metricSuffix}
                onChange={(e) => setMetricSuffix(e.target.value)}
                placeholder="e.g. K, %, hrs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">Subtext</label>
              <Input
                value={metricChange}
                onChange={(e) => setMetricChange(e.target.value)}
                placeholder="e.g. +24% MoM"
              />
            </div>
          </div>

          {/* Data Points Table */}
          {chartType !== 'metric' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Data Points ({dataPoints.length})
                </label>
                <Button size="sm" variant="outline" onClick={handleAddRow} className="h-7 text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" strokeWidth={2.5} />
                  Add Row
                </Button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {dataPoints.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      value={row.label}
                      onChange={(e) => handleUpdateRow(idx, 'label', e.target.value)}
                      placeholder="Label (e.g. Q1)"
                      className="flex-1 h-8 text-xs font-mono"
                    />
                    <Input
                      type="number"
                      value={row.value}
                      onChange={(e) => handleUpdateRow(idx, 'value', e.target.value)}
                      placeholder="Value"
                      className="w-24 h-8 text-xs font-mono"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveRow(idx)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">Metric Value</label>
              <Input
                type="number"
                value={dataPoints[0]?.value || 0}
                onChange={(e) =>
                  setDataPoints([{ label: 'Metric', value: parseFloat(e.target.value) || 0 }])
                }
                placeholder="e.g. 98"
                className="font-mono text-base font-bold"
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="monochrome" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
