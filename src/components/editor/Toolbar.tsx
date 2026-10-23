import React, { useRef } from 'react';
import { ToolType } from '@/types/board';
import {
  MousePointer2,
  Hand,
  PenLine,
  Pencil,
  Highlighter,
  Square,
  Circle,
  Diamond,
  ArrowRight,
  Minus,
  Star,
  StickyNote,
  Type,
  ImagePlus,
  BarChart3,
  Eraser,
  Trash2,
  ChevronUp,
  Palette,
  Workflow,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const DRAWING_COLORS = [
  { name: 'White', hex: '#ffffff' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Slate', hex: '#71717a' },
  { name: 'Dark', hex: '#18181b' },
];

interface ToolbarProps {
  activeTool: ToolType;
  activeColor: string;
  boardType?: 'planning' | 'flowchart';
  onSelectTool: (tool: ToolType) => void;
  onSelectColor: (color: string) => void;
  onUploadImage: (file: File) => void;
  onClearCanvas: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  activeColor,
  boardType = 'planning',
  onSelectTool,
  onSelectColor,
  onUploadImage,
  onClearCanvas,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadImage(e.target.files[0]);
    }
  };

  const isShapeTool = [
    'rectangle',
    'circle',
    'diamond',
    'arrow',
    'line',
    'star',
  ].includes(activeTool);

  const shapeIcons: Record<string, React.ReactNode> = {
    rectangle: <Square className="w-5 h-5 text-violet-400" strokeWidth={3} />,
    circle: <Circle className="w-5 h-5 text-violet-400" strokeWidth={3} />,
    diamond: <Diamond className="w-5 h-5 text-violet-400" strokeWidth={3} />,
    arrow: <ArrowRight className="w-5 h-5 text-violet-400" strokeWidth={3} />,
    line: <Minus className="w-5 h-5 text-violet-400" strokeWidth={3} />,
    star: <Star className="w-5 h-5 text-violet-400" strokeWidth={3} />,
    flowchart: <Workflow className="w-5 h-5 text-violet-400" strokeWidth={3} />,
  };

  const tools: {
    id: ToolType;
    label: string;
    shortcut: string;
    icon: React.ReactNode;
    colorClass: string;
    activeBg: string;
  }[] = [
    {
      id: 'select',
      label: 'Select & Move',
      shortcut: 'V',
      icon: <MousePointer2 className="w-5 h-5" strokeWidth={3} />,
      colorClass: 'text-sky-400',
      activeBg: 'bg-sky-500 text-white shadow-lg shadow-sky-500/30',
    },
    {
      id: 'hand',
      label: 'Pan Canvas',
      shortcut: 'H / Space',
      icon: <Hand className="w-5 h-5" strokeWidth={3} />,
      colorClass: 'text-amber-400',
      activeBg: 'bg-amber-500 text-white shadow-lg shadow-amber-500/30',
    },
    {
      id: 'pen',
      label: 'Ink Pen',
      shortcut: 'P',
      icon: <PenLine className="w-5 h-5" strokeWidth={3} />,
      colorClass: 'text-emerald-400',
      activeBg: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30',
    },
    {
      id: 'marker',
      label: 'Marker Pen',
      shortcut: 'M',
      icon: <Pencil className="w-5 h-5" strokeWidth={3} />,
      colorClass: 'text-indigo-400',
      activeBg: 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30',
    },
    {
      id: 'highlighter',
      label: 'Highlighter',
      shortcut: 'Shift+H',
      icon: <Highlighter className="w-5 h-5" strokeWidth={3} />,
      colorClass: 'text-yellow-400',
      activeBg: 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/30',
    },
    {
      id: 'flowchart',
      label: 'Flowchart & Connectors Palette',
      shortcut: 'F',
      icon: <Workflow className="w-5 h-5" strokeWidth={3} />,
      colorClass: 'text-violet-400',
      activeBg: 'bg-violet-600 text-white shadow-lg shadow-violet-600/40 ring-2 ring-violet-400/50',
    },
    {
      id: 'sticky',
      label: 'Sticky Note',
      shortcut: 'S',
      icon: <StickyNote className="w-5 h-5" strokeWidth={3} />,
      colorClass: 'text-amber-300',
      activeBg: 'bg-amber-500 text-white shadow-lg shadow-amber-500/30',
    },
    {
      id: 'text',
      label: 'Text Box',
      shortcut: 'T',
      icon: <Type className="w-5 h-5" strokeWidth={3} />,
      colorClass: 'text-cyan-400',
      activeBg: 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30',
    },
    {
      id: 'graph',
      label: 'Insert Graph / KPI',
      shortcut: 'G',
      icon: <BarChart3 className="w-5 h-5" strokeWidth={3} />,
      colorClass: 'text-teal-400',
      activeBg: 'bg-teal-500 text-white shadow-lg shadow-teal-500/30',
    },
    {
      id: 'eraser',
      label: 'Eraser',
      shortcut: 'E',
      icon: <Eraser className="w-5 h-5" strokeWidth={3} />,
      colorClass: 'text-red-400',
      activeBg: 'bg-red-500 text-white shadow-lg shadow-red-500/30',
    },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <nav aria-label="Whiteboard Drawing Tools" className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-950/95 border-2 border-zinc-700/80 backdrop-blur-xl rounded-2xl p-1.5 shadow-2xl flex items-center gap-1.5">
        {/* Drawing & Flowchart Tools */}
        {tools.slice(0, 6).map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelectTool(tool.id)}
                  className={`p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                    isActive
                      ? tool.activeBg + ' scale-105 font-bold'
                      : `${tool.colorClass} hover:bg-zinc-900/80 hover:scale-105`
                  }`}
                >
                  {tool.icon}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <span className="font-bold">{tool.label}</span>
                <span className="ml-1.5 opacity-60 font-mono">({tool.shortcut})</span>
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Shapes Dropdown Menu */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <button
                  className={`p-2.5 rounded-xl transition-all flex items-center gap-0.5 justify-center cursor-pointer ${
                    isShapeTool
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 scale-105'
                      : 'text-violet-400 hover:bg-zinc-900/80 hover:scale-105'
                  }`}
                >
                  {isShapeTool ? shapeIcons[activeTool] || shapeIcons.rectangle : shapeIcons.rectangle}
                  <ChevronUp className="w-3.5 h-3.5 -mr-1 text-violet-300" strokeWidth={3} />
                </button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="top">
              <span className="font-bold">Basic Shapes</span>
            </TooltipContent>
          </Tooltip>

          <DropdownMenuContent side="top" align="center" className="w-48 bg-zinc-950 border-zinc-700 text-zinc-200">
            <DropdownMenuLabel className="text-violet-400 font-bold">Geometric Shapes</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onSelectTool('rectangle')} className="cursor-pointer hover:bg-zinc-800">
              <Square className="w-4 h-4 mr-2 text-violet-400" strokeWidth={3} />
              <span>Rectangle</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSelectTool('circle')} className="cursor-pointer hover:bg-zinc-800">
              <Circle className="w-4 h-4 mr-2 text-violet-400" strokeWidth={3} />
              <span>Circle / Ellipse</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSelectTool('diamond')} className="cursor-pointer hover:bg-zinc-800">
              <Diamond className="w-4 h-4 mr-2 text-violet-400" strokeWidth={3} />
              <span>Decision Diamond</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSelectTool('star')} className="cursor-pointer hover:bg-zinc-800">
              <Star className="w-4 h-4 mr-2 text-amber-400" strokeWidth={3} />
              <span>Milestone Star</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuLabel className="text-indigo-400 font-bold">Connectors</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onSelectTool('arrow')} className="cursor-pointer hover:bg-zinc-800">
              <ArrowRight className="w-4 h-4 mr-2 text-indigo-400" strokeWidth={3} />
              <span>Directional Arrow</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSelectTool('line')} className="cursor-pointer hover:bg-zinc-800">
              <Minus className="w-4 h-4 mr-2 text-indigo-400" strokeWidth={3} />
              <span>Straight Line</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Color Palette Popover */}
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button
                  className="p-2.5 rounded-xl text-emerald-400 hover:bg-zinc-900/80 hover:scale-105 transition-all flex items-center justify-center cursor-pointer relative"
                  title="Choose Color"
                >
                  <Palette className="w-5 h-5 text-emerald-400" strokeWidth={3} />
                  <span
                    className="w-3 h-3 rounded-full absolute bottom-1 right-1 border-2 border-zinc-950 shadow"
                    style={{ backgroundColor: activeColor }}
                  />
                </button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="top">
              <span className="font-bold">Drawing & Note Color</span>
            </TooltipContent>
          </Tooltip>

          <PopoverContent side="top" align="center" className="w-56 p-3 bg-zinc-950 border-zinc-700">
            <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-emerald-400" strokeWidth={3} />
              <span>Color Palette</span>
            </div>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {DRAWING_COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => onSelectColor(c.hex)}
                  title={c.name}
                  className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-115 cursor-pointer shadow-sm ${
                    activeColor.toLowerCase() === c.hex.toLowerCase()
                      ? 'border-white ring-2 ring-white/60 scale-110'
                      : 'border-zinc-700'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
              <label className="text-xs text-zinc-400 font-bold w-20">Custom:</label>
              <input
                type="color"
                value={activeColor}
                onChange={(e) => onSelectColor(e.target.value)}
                className="w-full h-8 rounded border border-zinc-700 bg-zinc-900 cursor-pointer"
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* Remaining Tools */}
        {tools.slice(6).map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelectTool(tool.id)}
                  className={`p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                    isActive
                      ? tool.activeBg + ' scale-105 font-bold'
                      : `${tool.colorClass} hover:bg-zinc-900/80 hover:scale-105`
                  }`}
                >
                  {tool.icon}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <span className="font-bold">{tool.label}</span>
                <span className="ml-1.5 opacity-60 font-mono">({tool.shortcut})</span>
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Image Uploader (Disabled in Flowchart mode) */}
        {boardType !== 'flowchart' && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl text-blue-400 hover:bg-zinc-900/80 hover:scale-105 transition-all flex items-center justify-center cursor-pointer"
                >
                  <ImagePlus className="w-5 h-5 text-blue-400" strokeWidth={3} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <span className="font-bold">Insert Image</span>
              </TooltipContent>
            </Tooltip>
          </>
        )}

        <div className="w-px h-6 bg-zinc-800 mx-1" />

        {/* Clear Canvas */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onClearCanvas}
              className="p-2.5 rounded-xl text-red-400 hover:bg-red-950/60 hover:text-red-300 hover:scale-105 transition-all flex items-center justify-center cursor-pointer"
            >
              <Trash2 className="w-5 h-5 text-red-400" strokeWidth={3} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <span className="font-bold text-red-400">Clear Canvas</span>
          </TooltipContent>
        </Tooltip>
      </nav>
    </TooltipProvider>
  );
};
