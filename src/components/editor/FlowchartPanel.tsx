import React, { useState } from 'react';
import { ShapeType, BoardElement, ShapeElement } from '@/types/board';
import { generateId } from '@/lib/utils';
import {
  Workflow,
  Search,
  X,
  Plus,
  Maximize2,
  Minimize2,
  Sparkles,
  Link2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TooltipProvider } from '@/components/ui/tooltip';

export interface FlowchartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddElement: (element: BoardElement) => void;
  onAddMultipleElements: (elements: BoardElement[]) => void;
  selectedElements?: BoardElement[];
  viewportCenter: { x: number; y: number };
  activeColor: string;
}

interface ShapeItemDef {
  id: string;
  type: ShapeType;
  title: string;
  subtitle: string;
  category: 'core' | 'data' | 'system';
  defaultWidth: number;
  defaultHeight: number;
  defaultText?: string;
  defaultLabel?: string;
  defaultFill?: string;
  defaultStroke?: string;
  strokeDash?: 'solid' | 'dashed' | 'dotted';
  icon: React.ReactNode;
}

export const FlowchartPanel: React.FC<FlowchartPanelProps> = ({
  isOpen,
  onClose,
  onAddElement,
  onAddMultipleElements,
  selectedElements = [],
  viewportCenter,
  activeColor,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'core' | 'data' | 'system'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) return null;

  const shapeDefinitions: ShapeItemDef[] = [
    // Core Flow Shapes
    {
      id: 'term_start',
      type: 'flowchart-terminator',
      title: 'Start (with Connector)',
      subtitle: 'Flow Initiation Capsule',
      category: 'core',
      defaultWidth: 160,
      defaultHeight: 64,
      defaultText: 'Start',
      defaultFill: '#1e1b4b',
      defaultStroke: '#818cf8',
      icon: (
        <svg className="w-8 h-5" viewBox="0 0 40 24" fill="none">
          <rect x="2" y="2" width="36" height="20" rx="10" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
        </svg>
      ),
    },
    {
      id: 'proc_step',
      type: 'flowchart-process',
      title: 'Process Step',
      subtitle: 'Activity / Task Box',
      category: 'core',
      defaultWidth: 170,
      defaultHeight: 70,
      defaultText: 'Process Task',
      defaultFill: '#18181b',
      defaultStroke: '#38bdf8',
      icon: (
        <svg className="w-8 h-5" viewBox="0 0 40 24" fill="none">
          <rect x="2" y="2" width="36" height="20" rx="4" fill="#18181b" stroke="#38bdf8" strokeWidth="2" />
        </svg>
      ),
    },
    {
      id: 'dec_cond',
      type: 'flowchart-decision',
      title: 'Decision Node',
      subtitle: 'Branch Condition (Diamond)',
      category: 'core',
      defaultWidth: 160,
      defaultHeight: 90,
      defaultText: 'Condition?',
      defaultFill: '#312e81',
      defaultStroke: '#a855f7',
      icon: (
        <svg className="w-8 h-6" viewBox="0 0 40 24" fill="none">
          <polygon points="20,2 38,12 20,22 2,12" fill="#312e81" stroke="#a855f7" strokeWidth="2" />
        </svg>
      ),
    },
    {
      id: 'term_end',
      type: 'flowchart-terminator',
      title: 'End / Finish',
      subtitle: 'Termination Capsule',
      category: 'core',
      defaultWidth: 160,
      defaultHeight: 64,
      defaultText: 'End',
      defaultFill: '#14532d',
      defaultStroke: '#4ade80',
      icon: (
        <svg className="w-8 h-5" viewBox="0 0 40 24" fill="none">
          <rect x="2" y="2" width="36" height="20" rx="10" fill="#14532d" stroke="#4ade80" strokeWidth="2" />
        </svg>
      ),
    },

    // Data & Storage Shapes
    {
      id: 'db_store',
      type: 'flowchart-database',
      title: 'Database Storage',
      subtitle: 'Database / Entity (Cylinder)',
      category: 'data',
      defaultWidth: 150,
      defaultHeight: 85,
      defaultText: 'Database',
      defaultFill: '#701a75',
      defaultStroke: '#f472b6',
      icon: (
        <svg className="w-8 h-6" viewBox="0 0 40 28" fill="none">
          <path d="M4,7 L4,21 A16,5 0 0,0 36,21 L36,7 Z" fill="#701a75" stroke="#f472b6" strokeWidth="2" />
          <ellipse cx="20" cy="7" rx="16" ry="5" fill="#701a75" stroke="#f472b6" strokeWidth="2" />
        </svg>
      ),
    },
    {
      id: 'data_io',
      type: 'flowchart-data',
      title: 'Data Input / Output',
      subtitle: 'I/O Data (Parallelogram)',
      category: 'data',
      defaultWidth: 170,
      defaultHeight: 70,
      defaultText: 'Input / Output',
      defaultFill: '#064e3b',
      defaultStroke: '#34d399',
      icon: (
        <svg className="w-8 h-5" viewBox="0 0 40 24" fill="none">
          <polygon points="8,2 38,2 32,22 2,22" fill="#064e3b" stroke="#34d399" strokeWidth="2" />
        </svg>
      ),
    },
    {
      id: 'doc_rep',
      type: 'flowchart-document',
      title: 'Document / Report',
      subtitle: 'Printed Paper / File',
      category: 'data',
      defaultWidth: 160,
      defaultHeight: 75,
      defaultText: 'Document',
      defaultFill: '#78350f',
      defaultStroke: '#fbbf24',
      icon: (
        <svg className="w-8 h-6" viewBox="0 0 40 26" fill="none">
          <path d="M4,2 L36,2 L36,20 Q27,24 20,20 Q13,16 4,22 Z" fill="#78350f" stroke="#fbbf24" strokeWidth="2" />
        </svg>
      ),
    },

    // Advanced & System Shapes
    {
      id: 'cloud_sys',
      type: 'flowchart-cloud',
      title: 'Cloud Service / API',
      subtitle: 'External Network Node',
      category: 'system',
      defaultWidth: 180,
      defaultHeight: 90,
      defaultText: 'Cloud API',
      defaultFill: '#0c4a6e',
      defaultStroke: '#38bdf8',
      icon: (
        <svg className="w-8 h-6" viewBox="0 0 40 26" fill="none">
          <path
            d="M10,20 A8,7 0 0,1 7,12 A9,8 0 0,1 18,7 A12,9 0 0,1 32,9 A9,7 0 0,1 35,18 A7,6 0 0,1 30,22 L10,22 Z"
            fill="#0c4a6e"
            stroke="#38bdf8"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      id: 'subproc',
      type: 'flowchart-subprocess',
      title: 'Subprocess',
      subtitle: 'Predefined Procedure',
      category: 'system',
      defaultWidth: 170,
      defaultHeight: 70,
      defaultText: 'Subprocess',
      defaultFill: '#1e293b',
      defaultStroke: '#60a5fa',
      icon: (
        <svg className="w-8 h-5" viewBox="0 0 40 24" fill="none">
          <rect x="2" y="2" width="36" height="20" rx="3" fill="#1e293b" stroke="#60a5fa" strokeWidth="2" />
          <line x1="8" y1="2" x2="8" y2="22" stroke="#60a5fa" strokeWidth="2" />
          <line x1="32" y1="2" x2="32" y2="22" stroke="#60a5fa" strokeWidth="2" />
        </svg>
      ),
    },
    {
      id: 'prep_hex',
      type: 'flowchart-preparation',
      title: 'Preparation / Loop',
      subtitle: 'Initialization (Hexagon)',
      category: 'system',
      defaultWidth: 160,
      defaultHeight: 70,
      defaultText: 'Initialize',
      defaultFill: '#14532d',
      defaultStroke: '#4ade80',
      icon: (
        <svg className="w-8 h-5" viewBox="0 0 40 24" fill="none">
          <polygon points="8,2 32,2 38,12 32,22 8,22 2,12" fill="#14532d" stroke="#4ade80" strokeWidth="2" />
        </svg>
      ),
    },
    {
      id: 'delay_buf',
      type: 'flowchart-delay',
      title: 'Delay / Buffer',
      subtitle: 'Queue / Wait State',
      category: 'system',
      defaultWidth: 160,
      defaultHeight: 70,
      defaultText: 'Delay (10s)',
      defaultFill: '#3b0764',
      defaultStroke: '#c084fc',
      icon: (
        <svg className="w-8 h-5" viewBox="0 0 40 24" fill="none">
          <path d="M2,2 L24,2 A10,10 0 0,1 24,22 L2,22 Z" fill="#3b0764" stroke="#c084fc" strokeWidth="2" />
        </svg>
      ),
    },
    {
      id: 'conn_node',
      type: 'flowchart-connector',
      title: 'On-Page Link Point',
      subtitle: 'Jump Point (Circle)',
      category: 'system',
      defaultWidth: 54,
      defaultHeight: 54,
      defaultText: 'A',
      defaultFill: '#18181b',
      defaultStroke: '#f59e0b',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" fill="#18181b" stroke="#f59e0b" strokeWidth="2" />
        </svg>
      ),
    },
  ];

  const filteredItems = shapeDefinitions.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.defaultText && item.defaultText.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCreateShape = (item: ShapeItemDef, customPos?: { x: number; y: number }) => {
    const targetX = customPos ? customPos.x : viewportCenter.x - item.defaultWidth / 2;
    const targetY = customPos ? customPos.y : viewportCenter.y - item.defaultHeight / 2;

    const strokeColor = activeColor !== '#ffffff' ? activeColor : item.defaultStroke || '#ffffff';

    // When adding a Start node, it automatically comes with a connected animated outgoing connector
    if (item.type === 'flowchart-terminator' && (item.id === 'term_start' || item.defaultText?.toLowerCase().includes('start'))) {
      const startNode: ShapeElement = {
        id: generateId('shape'),
        type: 'shape',
        shapeType: 'flowchart-terminator',
        x: targetX,
        y: targetY,
        width: item.defaultWidth,
        height: item.defaultHeight,
        fill: item.defaultFill || '#1e1b4b',
        stroke: strokeColor,
        strokeWidth: 2,
        text: 'Start',
        zIndex: 50,
      };

      const attachedArrow: ShapeElement = {
        id: generateId('shape'),
        type: 'shape',
        shapeType: 'connector-straight',
        x: targetX + item.defaultWidth / 2 - 2,
        y: targetY + item.defaultHeight,
        width: 4,
        height: 65,
        fill: 'transparent',
        stroke: '#818cf8',
        strokeWidth: 3,
        animated: true,
        fromElementId: startNode.id,
        fromPort: 'bottom',
        zIndex: 49,
      };

      onAddMultipleElements([startNode, attachedArrow]);
      return;
    }

    const newShape: ShapeElement = {
      id: generateId('shape'),
      type: 'shape',
      shapeType: item.type,
      x: targetX,
      y: targetY,
      width: item.defaultWidth,
      height: item.defaultHeight,
      fill: item.defaultFill || '#18181b',
      stroke: strokeColor,
      strokeWidth: 2,
      strokeDash: item.strokeDash,
      text: item.defaultText,
      label: item.defaultLabel,
      zIndex: 50,
    };

    onAddElement(newShape);
  };

  // Drag and drop onto canvas
  const handleDragStart = (e: React.DragEvent, item: ShapeItemDef) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Quick Auto-Connect between 2 selected elements with animated line
  const handleAutoConnectSelected = () => {
    if (selectedElements.length < 2) return;
    const [elA, elB] = selectedElements;

    const centerAX = elA.x + elA.width / 2;
    const centerAY = elA.y + elA.height / 2;
    const centerBX = elB.x + elB.width / 2;
    const centerBY = elB.y + elB.height / 2;

    const minX = Math.min(centerAX, centerBX);
    const minY = Math.min(centerAY, centerBY);
    const width = Math.max(10, Math.abs(centerBX - centerAX));
    const height = Math.max(10, Math.abs(centerBY - centerAY));
    const flipX = centerBX < centerAX;
    const flipY = centerBY < centerAY;

    const connector: ShapeElement = {
      id: generateId('shape'),
      type: 'shape',
      shapeType: 'connector-straight',
      x: minX,
      y: minY,
      width,
      height,
      flipX,
      flipY,
      fill: 'transparent',
      stroke: activeColor !== '#ffffff' ? activeColor : '#38bdf8',
      strokeWidth: 3,
      animated: true,
      fromElementId: elA.id,
      toElementId: elB.id,
      zIndex: Math.max(elA.zIndex, elB.zIndex) + 1,
    };

    onAddElement(connector);
  };

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className={`fixed left-4 top-18 z-40 bg-zinc-950/95 border-2 border-zinc-700/90 backdrop-blur-2xl rounded-2xl shadow-2xl transition-all duration-200 select-none flex flex-col ${
          isMinimized ? 'w-64 h-14' : 'w-80 max-h-[calc(100vh-6.5rem)]'
        }`}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between px-3.5 py-3 border-b border-zinc-800/80 bg-zinc-900/40 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-600/30 border border-violet-500/50 flex items-center justify-center text-violet-300">
              <Workflow className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xs font-black tracking-wide uppercase text-white flex items-center gap-1.5">
                Flowchart Shapes
              </h3>
              <p className="text-[10px] text-zinc-400 font-medium">Click or drag any shape to canvas</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized((prev) => !prev)}
              title={isMinimized ? 'Expand Panel' : 'Minimize Panel'}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              title="Close Panel"
              className="p-1 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="flex-1 flex flex-col p-3 gap-2.5 overflow-hidden">
            {/* Auto Connect Bar if 2 items selected */}
            {selectedElements.length === 2 && (
              <div className="p-2 rounded-xl bg-violet-950/60 border border-violet-600/70 flex items-center justify-between gap-2 shadow-lg">
                <div className="flex items-center gap-1.5 text-xs text-violet-200 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span>2 Nodes Selected</span>
                </div>
                <button
                  onClick={handleAutoConnectSelected}
                  className="px-2.5 py-1 text-[11px] font-bold bg-violet-600 hover:bg-violet-500 text-white rounded-lg shadow flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Connect Nodes</span>
                </button>
              </div>
            )}

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 text-[11px] font-bold">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-violet-600 text-white shadow font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedCategory('core')}
                className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
                  selectedCategory === 'core'
                    ? 'bg-violet-600 text-white shadow font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Core
              </button>
              <button
                onClick={() => setSelectedCategory('data')}
                className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
                  selectedCategory === 'data'
                    ? 'bg-violet-600 text-white shadow font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Data
              </button>
              <button
                onClick={() => setSelectedCategory('system')}
                className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
                  selectedCategory === 'system'
                    ? 'bg-violet-600 text-white shadow font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                System
              </button>
            </div>

            {/* Search Filter Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search flowchart shapes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-7.5 text-xs bg-zinc-900 border-zinc-700 text-white rounded-lg focus-visible:ring-violet-500"
              />
            </div>

            {/* Elements Content Grid */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 max-h-[58vh]">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  onClick={() => handleCreateShape(item)}
                  className="group p-2 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-850 hover:border-violet-500/70 transition-all flex items-center justify-between cursor-grab active:cursor-grabbing hover:shadow-md"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:border-violet-500/50 transition-colors">
                      {item.icon}
                    </div>
                    <div className="truncate max-w-[155px]">
                      <h4 className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors truncate">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-zinc-400 truncate">{item.subtitle}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateShape(item);
                    }}
                    title="Add to canvas"
                    className="p-1 rounded-md bg-zinc-800 group-hover:bg-violet-600 text-zinc-400 group-hover:text-white transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {filteredItems.length === 0 && (
                <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                  No shapes match "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
};
