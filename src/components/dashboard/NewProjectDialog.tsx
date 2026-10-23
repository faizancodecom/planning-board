import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Layout, Workflow } from 'lucide-react';
import { BoardType } from '@/types/board';

interface NewProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (
    title: string,
    description: string,
    tags: string[],
    templateId?: string,
    boardType?: BoardType
  ) => void;
  initialBoardType?: BoardType;
}

export const NewProjectDialog: React.FC<NewProjectDialogProps> = ({
  isOpen,
  onClose,
  onCreate,
  initialBoardType = 'planning',
}) => {
  const [boardType, setBoardType] = useState<BoardType>(initialBoardType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setBoardType(initialBoardType);
      setTitle(initialBoardType === 'flowchart' ? 'Untitled Flowchart' : 'Untitled Planning Board');
      setDescription('');
    }
  }, [isOpen, initialBoardType]);

  const handleSelectType = (type: BoardType) => {
    setBoardType(type);
    if (!title || title === 'Untitled Planning Board' || title === 'Untitled Flowchart') {
      setTitle(type === 'flowchart' ? 'Untitled Flowchart' : 'Untitled Planning Board');
    }
  };

  const handleCreate = () => {
    if (!title.trim()) return;

    const defaultTag = boardType === 'flowchart' ? 'Flowchart' : 'Planning';

    onCreate(
      title.trim(),
      description.trim(),
      [defaultTag],
      undefined,
      boardType
    );

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-zinc-950 border-2 border-zinc-800 text-zinc-100 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white">
            <Plus className="w-5 h-5 text-sky-400" strokeWidth={2.5} />
            <span>Create New Board</span>
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            Select your board type and set up your workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Board Type Selection Cards */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
              Select Board Type *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Planning Whiteboard */}
              <div
                onClick={() => handleSelectType('planning')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  boardType === 'planning'
                    ? 'border-blue-500 bg-blue-950/30 shadow-lg shadow-blue-500/10'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                      <Layout className="w-4 h-4" strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                      WHITEBOARD
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">Planning Board</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Sticky notes, ink pens, highlighters, live graphs, and brainstorming.
                  </p>
                </div>
              </div>

              {/* Option 2: Flowchart Diagram */}
              <div
                onClick={() => handleSelectType('flowchart')}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  boardType === 'flowchart'
                    ? 'border-violet-500 bg-violet-950/30 shadow-lg shadow-violet-500/10'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
                      <Workflow className="w-4 h-4" strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800">
                      FLOWCHART
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">Flowchart & Logic</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Process mapping, decisions, database cylinders, and smart animated connectors.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Board Title & Description */}
          <div className="space-y-3 pt-1 border-t border-zinc-800">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">
                Board Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={boardType === 'flowchart' ? 'e.g. User Auth & Verification Flow' : 'e.g. Q3 Growth Strategy & Math'}
                className="font-bold text-sm bg-zinc-900 border-zinc-700 text-white"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Description (Optional)
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of workflow or objectives..."
                className="text-xs bg-zinc-900 border-zinc-700 text-zinc-200"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-zinc-800">
          <Button variant="outline" onClick={onClose} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={!title.trim()}
            className={`font-bold text-white shadow-lg cursor-pointer ${
              boardType === 'flowchart'
                ? 'bg-violet-600 hover:bg-violet-500 shadow-violet-600/30'
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
            }`}
          >
            <Plus className="w-4 h-4 mr-1" strokeWidth={3} />
            <span>Create & Open {boardType === 'flowchart' ? 'Flowchart' : 'Planning Board'}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
