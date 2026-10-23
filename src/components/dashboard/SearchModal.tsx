import React, { useState, useEffect, useRef } from 'react';
import { PlnFileMetadata } from '@/types/board';
import { formatDate } from '@/lib/utils';
import {
  Search,
  X,
  ExternalLink,
  Star,
  Plus,
  Layers,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: PlnFileMetadata[];
  onOpenProject: (id: string) => void;
  onNewProject: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  projects,
  onOpenProject,
  onNewProject,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filtered = projects.filter((p) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (filtered.length ? (prev + 1) % filtered.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (filtered.length ? (prev - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        onOpenProject(filtered[selectedIndex].id);
        onClose();
      } else if (query) {
        onNewProject();
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-zinc-950 border-2 border-zinc-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Top Search Input Bar */}
        <div className="relative border-b-2 border-zinc-800 p-4 flex items-center gap-3 bg-zinc-900/60">
          <Search className="w-5 h-5 text-sky-400 shrink-0" strokeWidth={3} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search boards by title, tags, or topic..."
            className="w-full bg-transparent text-white placeholder-zinc-500 text-sm font-semibold outline-none border-none p-0"
          />

          {query ? (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" strokeWidth={3} />
            </button>
          ) : (
            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
              <span>ESC</span>
            </div>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-[160px] max-h-[50vh]">
          {filtered.length > 0 ? (
            filtered.map((project, index) => {
              const isSelected = selectedIndex === index;
              return (
                <div
                  key={project.id}
                  onClick={() => {
                    onOpenProject(project.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3 rounded-xl transition-all flex items-center justify-between cursor-pointer border ${
                    isSelected
                      ? 'bg-zinc-900 border-sky-500/80 shadow-md shadow-sky-500/10'
                      : 'border-transparent hover:bg-zinc-900/50 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 border-blue-400 text-white'
                          : 'bg-zinc-900 border-zinc-800 text-sky-400'
                      }`}
                    >
                      <Layers className="w-4 h-4" strokeWidth={3} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white truncate">
                          {project.title}
                        </span>
                        <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border bg-blue-950/80 text-blue-300 border-blue-800/60">
                          .PLN
                        </span>
                        {project.isFavorite && (
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" strokeWidth={3} />
                        )}
                      </div>

                      {project.description ? (
                        <p className="text-xs text-zinc-400 truncate mt-0.5">
                          {project.description}
                        </p>
                      ) : (
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-zinc-400" strokeWidth={3} />
                            {formatDate(project.updatedAt)}
                          </span>
                          {project.tags && project.tags.length > 0 && (
                            <span className="text-sky-400/80">#{project.tags.join(' #')}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenProject(project.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 shadow-sm transition-all"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" strokeWidth={3} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-zinc-400 flex flex-col items-center justify-center">
              <Layers className="w-10 h-10 text-zinc-600 mb-2.5" strokeWidth={3} />
              <p className="text-sm font-bold text-white">No boards found matching "{query}"</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                Press Enter to create a new board with this title or try different keywords.
              </p>
              <button
                onClick={() => {
                  onNewProject();
                  onClose();
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                <Plus className="w-4 h-4" strokeWidth={3} />
                <span>Create New Board</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="p-3 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold">
                ↑
              </kbd>{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold">
                ↓
              </kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold">
                ↵
              </kbd>{' '}
              Select
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-400">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" strokeWidth={3} />
            <span>{projects.length} Total Boards</span>
          </div>
        </div>
      </div>
    </div>
  );
};
