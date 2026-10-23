import React from 'react';
import { BoardElement, StickyVariant, ShapeElement, ShapeType } from '@/types/board';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  Lock,
  Unlock,
  BringToFront,
  SendToBack,
  Sliders,
  Type,
  Palette,
  X,
  Copy,
  Workflow,
  ArrowRight,
  FlipHorizontal,
  FlipVertical,
} from 'lucide-react';
import { DRAWING_COLORS } from './Toolbar';

interface PropertiesPanelProps {
  selectedElement: BoardElement | null;
  onUpdateElement: (updated: Partial<BoardElement>) => void;
  onDeleteElement: () => void;
  onDuplicateElement?: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onClosePanel?: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onBringToFront,
  onSendToBack,
  onClosePanel,
}) => {
  if (!selectedElement) return null;

  const isShape = selectedElement.type === 'shape';
  const isSticky = selectedElement.type === 'sticky';
  const isText = selectedElement.type === 'text';
  const isDrawing =
    selectedElement.type === 'pen' ||
    selectedElement.type === 'marker' ||
    selectedElement.type === 'highlighter';

  const shapeEl = isShape ? (selectedElement as ShapeElement) : null;
  const isConnector = shapeEl && (shapeEl.shapeType.startsWith('connector') || shapeEl.shapeType === 'arrow' || shapeEl.shapeType === 'line');

  const strokeWidths = [2, 4, 8, 14];

  const stickyPresets: { id: StickyVariant; label: string; color: string }[] = [
    { id: 'yellow', label: 'Yellow', color: '#fef08a' },
    { id: 'green', label: 'Green', color: '#bbf7d0' },
    { id: 'blue', label: 'Blue', color: '#bfdbfe' },
    { id: 'purple', label: 'Purple', color: '#e9d5ff' },
    { id: 'orange', label: 'Orange', color: '#fed7aa' },
    { id: 'dark', label: 'Dark', color: '#18181b' },
    { id: 'light', label: 'Light', color: '#f4f4f5' },
    { id: 'slate', label: 'Slate', color: '#3f3f46' },
  ];

  const shapeTypeOptions: { id: ShapeType; label: string }[] = [
    { id: 'flowchart-process', label: 'Process Box' },
    { id: 'flowchart-terminator', label: 'Start / End' },
    { id: 'flowchart-decision', label: 'Decision (Diamond)' },
    { id: 'flowchart-data', label: 'Data I/O' },
    { id: 'flowchart-database', label: 'Database' },
    { id: 'flowchart-document', label: 'Document' },
    { id: 'flowchart-subprocess', label: 'Subprocess' },
    { id: 'flowchart-cloud', label: 'Cloud Service' },
    { id: 'rectangle', label: 'Rectangle' },
    { id: 'circle', label: 'Circle' },
    { id: 'diamond', label: 'Diamond' },
    { id: 'star', label: 'Star' },
    { id: 'connector-straight', label: 'Straight Arrow' },
    { id: 'connector-elbow', label: 'Elbow Arrow' },
    { id: 'connector-curved', label: 'Curved Arrow' },
    { id: 'connector-bidirectional', label: 'Bidirectional' },
  ];

  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null);
  const dragRef = React.useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('select')) return;

    if (target.closest('.drag-handle')) {
      e.currentTarget.setPointerCapture(e.pointerId);
      const rect = e.currentTarget.getBoundingClientRect();
      const currentX = pos ? pos.x : rect.left;
      const currentY = pos ? pos.y : rect.top;

      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: currentX,
        origY: currentY,
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragRef.current) {
      const { startX, startY, origX, origY } = dragRef.current;
      setPos({
        x: origX + (e.clientX - startX),
        y: origY + (e.clientY - startY),
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragRef.current) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      dragRef.current = null;
    }
  };

  return (
    <aside
      className="fixed z-50 w-76 bg-zinc-950/98 border-2 border-zinc-700 backdrop-blur-xl rounded-2xl p-4 shadow-2xl space-y-3.5 text-xs select-none animate-in-fade max-h-[85vh] overflow-y-auto"
      style={pos ? { left: pos.x, top: pos.y } : { right: '16px', top: '80px' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800 drag-handle cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-sky-400">
          <Sliders className="w-4 h-4 text-sky-400" strokeWidth={3} />
          <span>{isShape ? (shapeEl?.shapeType.replace('flowchart-', '').toUpperCase() || 'SHAPE') : selectedElement.type} Settings</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateElement({ locked: !selectedElement.locked });
            }}
            title={selectedElement.locked ? 'Unlock element' : 'Lock element'}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-amber-400 transition-colors cursor-pointer border border-zinc-800"
          >
            {selectedElement.locked ? (
              <Lock className="w-3.5 h-3.5 text-amber-400" strokeWidth={3} />
            ) : (
              <Unlock className="w-3.5 h-3.5 text-zinc-400 hover:text-amber-400" strokeWidth={3} />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onDuplicateElement) onDuplicateElement();
            }}
            title="Duplicate element"
            className="p-1.5 rounded-lg hover:bg-sky-500/20 text-sky-400 hover:text-sky-300 transition-colors cursor-pointer border border-zinc-800"
          >
            <Copy className="w-3.5 h-3.5 text-sky-400" strokeWidth={3} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteElement();
            }}
            title="Delete element"
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer border border-zinc-800"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" strokeWidth={3} />
          </button>

          {onClosePanel && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClosePanel();
              }}
              title="Close Settings"
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-zinc-800"
            >
              <X className="w-3.5 h-3.5" strokeWidth={3} />
            </button>
          )}
        </div>
      </div>

      {/* Flowchart Node / Connector Text Label */}
      {isShape && (
        <div className="space-y-1.5">
          <label className="font-bold text-violet-300 block flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-violet-400" />
            {isConnector ? 'Connector Label' : 'Node Label / Text'}
          </label>
          <input
            type="text"
            value={isConnector ? shapeEl?.label || '' : shapeEl?.text || ''}
            placeholder={isConnector ? 'e.g. Yes / No / Next' : 'e.g. Process Step'}
            onChange={(e) => {
              e.stopPropagation();
              if (isConnector) {
                onUpdateElement({ label: e.target.value } as any);
              } else {
                onUpdateElement({ text: e.target.value } as any);
              }
            }}
            className="w-full h-8 px-2.5 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-100 text-xs font-medium focus:border-violet-500 focus:outline-none"
          />
        </div>
      )}

      {/* Shape Type Switcher */}
      {isShape && (
        <div className="space-y-1.5">
          <label className="font-bold text-sky-400 block flex items-center gap-1.5">
            <Workflow className="w-3.5 h-3.5 text-sky-400" />
            Symbol Type
          </label>
          <select
            value={shapeEl?.shapeType || 'rectangle'}
            onChange={(e) => {
              e.stopPropagation();
              onUpdateElement({ shapeType: e.target.value as ShapeType } as any);
            }}
            className="w-full h-8 px-2 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 text-xs font-semibold focus:border-sky-500 focus:outline-none cursor-pointer"
          >
            {shapeTypeOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Flip Connector Direction */}
      {isConnector && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateElement({ flipX: !shapeEl?.flipX } as any);
            }}
            className="flex-1 h-8 text-xs border-zinc-700 hover:bg-zinc-800 gap-1 text-zinc-300"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
            <span>Flip H</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateElement({ flipY: !shapeEl?.flipY } as any);
            }}
            className="flex-1 h-8 text-xs border-zinc-700 hover:bg-zinc-800 gap-1 text-zinc-300"
          >
            <FlipVertical className="w-3.5 h-3.5" />
            <span>Flip V</span>
          </Button>
        </div>
      )}

      {/* Sticky Note Color Presets */}
      {isSticky && (
        <div className="space-y-2">
          <label className="font-bold text-amber-300 block flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-amber-400" strokeWidth={3} />
            Note Color Preset
          </label>
          <div className="flex flex-wrap gap-2">
            {stickyPresets.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateElement({
                    variant: v.id,
                    customBgColor: undefined,
                    customTextColor: undefined,
                  } as any);
                }}
                className={`p-1 rounded-full border font-bold text-center transition-all flex items-center justify-center cursor-pointer ${
                  (selectedElement as any).variant === v.id &&
                  !(selectedElement as any).customBgColor
                    ? 'border-white bg-zinc-900 ring-2 ring-white/50'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                }`}
                title={v.label}
              >
                <span
                  className="w-6 h-6 rounded-full border border-black/30 shrink-0 shadow-sm"
                  style={{ backgroundColor: v.color }}
                />
              </button>
            ))}
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-zinc-800 flex items-center gap-2">
            <label className="text-xs text-zinc-400 font-bold w-20">Hex Color:</label>
            <input
              type="color"
              value={(selectedElement as any).customBgColor || '#fef08a'}
              onChange={(e) => {
                e.stopPropagation();
                onUpdateElement({
                  customBgColor: e.target.value,
                  customTextColor: '#000000',
                } as any);
              }}
              className="w-full h-8 rounded border border-zinc-700 bg-zinc-900 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Color Selection for Drawing / Shapes / Text */}
      {(isDrawing || isShape || isText) && (
        <div className="space-y-2">
          <label className="font-bold text-emerald-400 block flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-emerald-400" strokeWidth={3} />
            {isText ? 'Text Color' : isShape ? 'Stroke / Border' : 'Ink Color'}
          </label>
          <div className="grid grid-cols-5 gap-2 mb-2">
            {DRAWING_COLORS.map((c) => {
              const currentColor =
                (selectedElement as any).stroke || (selectedElement as any).color || '#ffffff';
              return (
                <button
                  key={c.hex}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateElement(
                      isText
                        ? ({ color: c.hex } as any)
                        : ({ stroke: c.hex } as any)
                    );
                  }}
                  title={c.name}
                  className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer shadow-sm ${
                    currentColor.toLowerCase() === c.hex.toLowerCase()
                      ? 'border-white ring-2 ring-white/60 scale-110'
                      : 'border-zinc-700'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
            <label className="text-xs text-zinc-400 font-bold w-20">Custom:</label>
            <input
              type="color"
              value={(selectedElement as any).stroke || (selectedElement as any).color || '#ffffff'}
              onChange={(e) => {
                e.stopPropagation();
                onUpdateElement(
                  isText ? ({ color: e.target.value } as any) : ({ stroke: e.target.value } as any)
                );
              }}
              className="w-full h-8 rounded border border-zinc-700 bg-zinc-900 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Shape Fill Color (Not applicable to pure lines/arrows) */}
      {isShape && !isConnector && (
        <div className="space-y-2">
          <label className="font-bold text-violet-400 block">Fill Preset</label>
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {[
              { label: 'None', hex: 'transparent' },
              { label: 'Dark', hex: '#18181b' },
              { label: 'Blue', hex: '#1e3a8a' },
              { label: 'Green', hex: '#064e3b' },
              { label: 'Purple', hex: '#581c87' },
              { label: 'Red', hex: '#7f1d1d' },
              { label: 'Amber', hex: '#78350f' },
              { label: 'White', hex: '#ffffff' },
            ].map((f) => (
              <button
                key={f.hex}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateElement({ fill: f.hex } as any);
                }}
                className={`py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                  (selectedElement as any).fill === f.hex
                    ? 'border-white bg-white text-black font-black shadow-sm'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
            <label className="text-xs text-zinc-400 font-bold w-20">Custom Fill:</label>
            <input
              type="color"
              value={(selectedElement as any).fill === 'transparent' ? '#000000' : (selectedElement as any).fill || '#ffffff'}
              onChange={(e) => {
                e.stopPropagation();
                onUpdateElement({ fill: e.target.value } as any);
              }}
              className="w-full h-8 rounded border border-zinc-700 bg-zinc-900 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Stroke Style (Solid / Dashed / Dotted) */}
      {isShape && (
        <div className="space-y-1.5">
          <label className="font-bold text-zinc-300 block">Line Pattern</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'solid', label: 'Solid' },
              { id: 'dashed', label: 'Dashed' },
              { id: 'dotted', label: 'Dotted' },
            ].map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateElement({ strokeDash: style.id as any } as any);
                }}
                className={`py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition-colors ${
                  (shapeEl?.strokeDash || 'solid') === style.id
                    ? 'border-white bg-zinc-800 text-white'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stroke Width Selector */}
      {(isShape || isDrawing) && (
        <div className="space-y-2">
          <label className="font-bold text-indigo-400 block">Thickness</label>
          <div className="grid grid-cols-4 gap-1.5">
            {strokeWidths.map((w) => (
              <button
                key={w}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateElement({ strokeWidth: w } as any);
                }}
                className={`flex items-center justify-center h-8 rounded-lg border transition-colors cursor-pointer ${
                  (selectedElement as any).strokeWidth === w
                    ? 'border-white bg-white text-black font-bold'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div
                  className="bg-current rounded-full"
                  style={{ width: `${w * 1.5}px`, height: `${w * 1.5}px` }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Font Size for Text / Sticky / Shapes */}
      {(isText || isSticky || isShape) && (
        <div className="space-y-1.5">
          <label className="font-bold text-cyan-400 block flex items-center gap-1">
            <Type className="w-3.5 h-3.5 text-cyan-400" strokeWidth={3} />
            Font Size
          </label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              min={8}
              max={120}
              value={(selectedElement as any).fontSize || (isShape ? 14 : isSticky ? 16 : 24)}
              onChange={(e) => {
                e.stopPropagation();
                onUpdateElement({ fontSize: Number(e.target.value) } as any);
              }}
              className="w-full h-8 px-2 rounded-lg border border-zinc-700 bg-zinc-900/50 text-zinc-200 text-sm font-bold outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            <span className="text-zinc-400 font-bold text-xs">px</span>
          </div>
        </div>
      )}

      {/* Layer Arrange */}
      <div className="space-y-2 pt-1 border-t border-zinc-800">
        <label className="font-bold text-zinc-300 block">Layer Order</label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onBringToFront();
            }}
            className="h-8 text-xs gap-1 border border-indigo-700/60 bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-200"
          >
            <BringToFront className="w-3.5 h-3.5 text-indigo-400" strokeWidth={3} />
            To Front
          </Button>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSendToBack();
            }}
            className="h-8 text-xs gap-1 border border-indigo-700/60 bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-200"
          >
            <SendToBack className="w-3.5 h-3.5 text-indigo-400" strokeWidth={3} />
            To Back
          </Button>
        </div>
      </div>
    </aside>
  );
};
