import React, { useState, useEffect } from 'react';
import { PlnFileMetadata, BoardType } from '@/types/board';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Download,
  Share2,
  CheckCircle2,
  Workflow,
  Layout,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EditorHeaderProps {
  metadata: PlnFileMetadata;
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  onBackToDashboard: () => void;
  onUpdateTitle: (newTitle: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onOpenExport: () => void;
  onOpenShare: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  metadata,
  zoom,
  canUndo,
  canRedo,
  onBackToDashboard,
  onUpdateTitle,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onOpenExport,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(metadata.title);

  const isFlowchart = metadata.boardType === 'flowchart' || metadata.category === 'flowchart';

  useEffect(() => {
    setTitleInput(metadata.title);
  }, [metadata.title]);

  const handleFinishTitleEdit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim()) {
      onUpdateTitle(titleInput.trim());
    } else {
      setTitleInput(metadata.title);
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <header className="h-14 border-b-2 border-zinc-800 bg-zinc-950/95 backdrop-blur px-4 flex items-center justify-between z-30 select-none">
        {/* Left Section: Back, Type Badge & Title */}
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onBackToDashboard}
                className="h-8 gap-1.5 border-sky-800/60 bg-sky-950/40 hover:bg-sky-900/60 text-sky-300 hover:text-sky-100 cursor-pointer font-bold shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 text-sky-400" strokeWidth={3} />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span className="font-bold">Return to Dashboard</span>
            </TooltipContent>
          </Tooltip>

          <div className="h-5 w-px bg-zinc-800" />

          {/* Mode Indicator Badge */}
          {isFlowchart ? (
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-violet-950/90 text-violet-300 border border-violet-700/60 font-bold">
              <Workflow className="w-3 h-3 text-violet-400" />
              <span>Flowchart</span>
            </span>
          ) : (
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-950/90 text-blue-300 border border-blue-700/60 font-bold">
              <Layout className="w-3 h-3 text-blue-400" />
              <span>Planning Board</span>
            </span>
          )}

          {isEditingTitle ? (
            <Input
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleFinishTitleEdit}
              onKeyDown={(e) => e.key === 'Enter' && handleFinishTitleEdit()}
              autoFocus
              className="h-8 text-sm font-bold w-48 sm:w-72 bg-zinc-900 border-zinc-700 text-white"
            />
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-zinc-900 text-sm font-bold text-zinc-100 hover:text-white transition-colors cursor-pointer text-left"
                >
                  <span className="truncate max-w-[160px] sm:max-w-[280px]">{metadata.title}</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold">
                    .pln
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <span className="font-bold">Click to Rename</span>
              </TooltipContent>
            </Tooltip>
          )}

          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono font-bold bg-emerald-950/30 px-2 py-0.5 rounded-md border border-emerald-800/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" strokeWidth={3} />
            <span>Auto-Saved</span>
          </div>
        </div>

        {/* Center Section: Undo / Redo & Zoom */}
        <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-700/80 rounded-xl p-1 shadow-inner">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-amber-400 hover:text-amber-300 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all"
              >
                <Undo2 className="w-4 h-4 text-amber-400" strokeWidth={3} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span className="font-bold">Undo</span>
              <span className="ml-1.5 opacity-60 font-mono">(Ctrl+Z)</span>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-emerald-400 hover:text-emerald-300 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all"
              >
                <Redo2 className="w-4 h-4 text-emerald-400" strokeWidth={3} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span className="font-bold">Redo</span>
              <span className="ml-1.5 opacity-60 font-mono">(Ctrl+Y)</span>
            </TooltipContent>
          </Tooltip>

          <div className="h-4 w-px bg-zinc-800 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onZoomOut}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-sky-400 hover:text-sky-300 cursor-pointer transition-all"
              >
                <ZoomOut className="w-4 h-4 text-sky-400" strokeWidth={3} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span className="font-bold">Zoom Out</span>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onResetZoom}
                className="px-2.5 py-1 text-xs font-mono font-bold text-zinc-200 hover:text-white hover:bg-zinc-800 rounded-md cursor-pointer transition-colors"
              >
                {Math.round(zoom * 100)}%
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span className="font-bold">Reset Zoom to 100%</span>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onZoomIn}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-sky-400 hover:text-sky-300 cursor-pointer transition-all"
              >
                <ZoomIn className="w-4 h-4 text-sky-400" strokeWidth={3} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span className="font-bold">Zoom In</span>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Right Section: Export */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                onClick={onOpenExport}
                className={`h-8 gap-1.5 text-white border shadow-md font-bold cursor-pointer ${
                  isFlowchart
                    ? 'bg-violet-600 hover:bg-violet-500 border-violet-400/30 shadow-violet-600/20'
                    : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400/30 shadow-emerald-600/20'
                }`}
              >
                <Download className="w-3.5 h-3.5" strokeWidth={3} />
                <span>Export .pln</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span className="font-bold">Export and Save</span>
            </TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  );
};
