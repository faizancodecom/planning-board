import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  LayoutGrid,
  List,
  Search,
  Plus,
  Upload,
  SlidersHorizontal,
  Layout,
  Workflow,
  Sparkles,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOption: string;
  onSortChange: (sort: string) => void;
  boardTypeFilter: 'all' | 'planning' | 'flowchart';
  onBoardTypeFilterChange: (filter: 'all' | 'planning' | 'flowchart') => void;
  viewMode: 'grid' | 'list';
  onToggleViewMode: (mode: 'grid' | 'list') => void;
  onOpenNewProject: (initialType?: 'planning' | 'flowchart') => void;
  onOpenImportPln: () => void;
  onOpenSearchModal?: () => void;
  totalPlansCount: number;
  planningCount: number;
  flowchartCount: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  boardTypeFilter,
  onBoardTypeFilterChange,
  viewMode,
  onToggleViewMode,
  onOpenNewProject,
  onOpenImportPln,
  onOpenSearchModal,
  totalPlansCount,
  planningCount,
  flowchartCount,
}) => {
  return (
    <header className="border-b-2 border-zinc-800 bg-zinc-950/95 backdrop-blur-md sticky top-0 z-30 select-none py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        {/* Top Row: Search & Creation Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search bar & quick action buttons */}
          <div className="flex items-center gap-2.5 flex-1 max-w-2xl">
            <div
              className="relative flex-1 cursor-pointer group"
              onClick={onOpenSearchModal}
            >
              <Search
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sky-400 group-hover:text-sky-300 transition-colors"
                strokeWidth={3}
              />
              <Input
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onClick={onOpenSearchModal}
                placeholder="Search boards by title, tags, or topic... (Click or Ctrl+K)"
                className="pl-9 pr-14 h-9 text-xs font-medium bg-zinc-900 border-zinc-750 text-zinc-100 focus-visible:ring-sky-400 cursor-pointer group-hover:border-sky-500/60 transition-colors"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-0.5 text-[10px] font-mono font-bold text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                <span>⌘K</span>
              </div>
            </div>

            <Button
              size="sm"
              onClick={onOpenImportPln}
              className="h-9 gap-1.5 border border-emerald-700/60 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 hover:text-emerald-100 shrink-0 font-bold cursor-pointer transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4 text-emerald-400" strokeWidth={3} />
              <span className="hidden sm:inline">Import .pln</span>
            </Button>

            {/* New Planning Board Button */}
            <Button
              size="sm"
              onClick={() => onOpenNewProject('planning')}
              className="h-9 gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold shrink-0 shadow-lg shadow-blue-600/30 cursor-pointer transition-transform hover:scale-102"
              title="Create New Planning Whiteboard"
            >
              <Plus className="w-4 h-4 text-white" strokeWidth={3} />
              <span className="hidden md:inline">Planning Board</span>
              <span className="md:hidden">Board</span>
            </Button>

            {/* New Flowchart Button */}
            <Button
              size="sm"
              onClick={() => onOpenNewProject('flowchart')}
              className="h-9 gap-1.5 bg-violet-600 hover:bg-violet-500 text-white font-bold shrink-0 shadow-lg shadow-violet-600/30 cursor-pointer transition-transform hover:scale-102"
              title="Create New Flowchart Diagram"
            >
              <Workflow className="w-4 h-4 text-white" strokeWidth={2.5} />
              <span className="hidden md:inline">Flowchart</span>
              <span className="md:hidden">Flow</span>
            </Button>
          </div>

          {/* Sort & Grid/List View Controls */}
          <div className="flex items-center justify-end gap-2">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1 text-xs font-bold border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-indigo-300 hover:text-indigo-200 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" strokeWidth={3} />
                  <span>Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 bg-zinc-950 border-zinc-800 text-zinc-200">
                <DropdownMenuLabel className="text-indigo-400 font-bold">Sort Boards By</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onSortChange('recent')} className="cursor-pointer hover:bg-zinc-800">
                  <span>Last Modified</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSortChange('created')} className="cursor-pointer hover:bg-zinc-800">
                  <span>Date Created</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSortChange('title_asc')} className="cursor-pointer hover:bg-zinc-800">
                  <span>Title (A - Z)</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSortChange('title_desc')} className="cursor-pointer hover:bg-zinc-800">
                  <span>Title (Z - A)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Grid vs List Switcher */}
            <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => onToggleViewMode('grid')}
                title="Grid View"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-sm font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" strokeWidth={3} />
              </button>
              <button
                onClick={() => onToggleViewMode('list')}
                title="List View"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-sm font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row: Filter Tabs (All Boards | Planning Boards | Flowcharts) */}
        <div className="flex items-center gap-2 pt-1 border-t border-zinc-850">
          <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 text-xs font-bold">
            <button
              onClick={() => onBoardTypeFilterChange('all')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                boardTypeFilter === 'all'
                  ? 'bg-zinc-800 text-white shadow font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>All Boards</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-950 font-mono text-zinc-300">
                {totalPlansCount}
              </span>
            </button>

            <button
              onClick={() => onBoardTypeFilterChange('planning')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                boardTypeFilter === 'planning'
                  ? 'bg-blue-600 text-white shadow font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Planning Boards</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-950 font-mono text-blue-200 border border-blue-800">
                {planningCount}
              </span>
            </button>

            <button
              onClick={() => onBoardTypeFilterChange('flowchart')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                boardTypeFilter === 'flowchart'
                  ? 'bg-violet-600 text-white shadow font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>Flowcharts</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-violet-950 font-mono text-violet-200 border border-violet-800">
                {flowchartCount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
