import React from 'react';
import { PlnFileMetadata } from '@/types/board';
import { formatDate } from '@/lib/utils';
import {
  MoreVertical,
  Star,
  Download,
  Copy,
  Edit2,
  Trash2,
  ExternalLink,
  Calendar,
  Layers,
  Workflow,
  Layout,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface ProjectGridProps {
  projects: PlnFileMetadata[];
  onOpenProject: (id: string) => void;
  onDuplicateProject: (id: string) => void;
  onRenameProject: (id: string) => void;
  onExportProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  onOpenProject,
  onDuplicateProject,
  onRenameProject,
  onExportProject,
  onDeleteProject,
  onToggleFavorite,
}) => {
  if (projects.length === 0) {
    return (
      <div className="py-16 text-center border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40 p-8">
        <Layers className="w-10 h-10 text-sky-400 mx-auto mb-3" strokeWidth={3} />
        <h3 className="text-base font-bold text-white">No boards match your filter</h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
          Try clearing your search query or create a new board to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {projects.map((project) => {
        const isFlowchart = project.boardType === 'flowchart' || project.category === 'flowchart';

        return (
          <div
            key={project.id}
            className={`group relative rounded-xl border-2 bg-zinc-950 transition-all flex flex-col justify-between overflow-hidden ${
              isFlowchart
                ? 'border-zinc-800 hover:border-violet-500/80 hover:shadow-lg hover:shadow-violet-500/10'
                : 'border-zinc-800 hover:border-sky-500/80 hover:shadow-lg hover:shadow-sky-500/10'
            }`}
          >
            {/* Card Header & Preview Area */}
            <div
              onClick={() => onOpenProject(project.id)}
              className="h-36 bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800/80 p-3.5 flex flex-col justify-between cursor-pointer relative overflow-hidden"
            >
              {/* Subtle board grid watermark */}
              <div className="absolute inset-0 bg-grid-dots-dark opacity-30 pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                {isFlowchart ? (
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-violet-950/90 text-violet-300 border border-violet-800/60 flex items-center gap-1">
                    <Workflow className="w-3 h-3 text-violet-400" />
                    <span>FLOWCHART</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-950/90 text-blue-300 border border-blue-800/60 flex items-center gap-1">
                    <Layout className="w-3 h-3 text-blue-400" />
                    <span>PLANNING BOARD</span>
                  </span>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(project.id);
                  }}
                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <Star
                    className={`w-4 h-4 ${
                      project.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-zinc-500 hover:text-amber-300'
                    }`}
                    strokeWidth={3}
                  />
                </button>
              </div>

              {/* Middle Preview Placeholder Button */}
              <div className="flex items-center justify-center my-auto opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all">
                <span
                  className={`text-xs font-mono font-bold px-3 py-1 rounded-lg shadow-sm flex items-center gap-1 border ${
                    isFlowchart
                      ? 'text-violet-300 border-violet-800/60 bg-violet-950/60'
                      : 'text-sky-300 border-sky-800/60 bg-sky-950/60'
                  }`}
                >
                  <span>{isFlowchart ? 'Open Flowchart' : 'Open Board'}</span>
                  <span className={isFlowchart ? 'text-violet-400 font-black' : 'text-sky-400 font-black'}>&rarr;</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 relative z-10">
                <span className="text-zinc-500">v{project.version || '1.0.0'}</span>
                <span className="flex items-center gap-1 text-zinc-400">
                  <Calendar className="w-3 h-3 text-sky-400" strokeWidth={3} />
                  {formatDate(project.updatedAt)}
                </span>
              </div>
            </div>

            {/* Card Details Body */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3
                    onClick={() => onOpenProject(project.id)}
                    className={`font-bold text-sm text-white cursor-pointer line-clamp-1 flex-1 transition-colors ${
                      isFlowchart ? 'group-hover:text-violet-300' : 'group-hover:text-sky-300'
                    }`}
                  >
                    {project.title}
                  </h3>

                  {/* Dropdown Options */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 -mr-1 rounded hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer">
                        <MoreVertical className="w-4 h-4" strokeWidth={3} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 bg-zinc-950 border-zinc-800 text-zinc-200">
                      <DropdownMenuItem onClick={() => onOpenProject(project.id)} className="cursor-pointer hover:bg-zinc-800">
                        <ExternalLink className="w-4 h-4 mr-2 text-sky-400" strokeWidth={3} />
                        <span>Open Board</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicateProject(project.id)} className="cursor-pointer hover:bg-zinc-800">
                        <Copy className="w-4 h-4 mr-2 text-indigo-400" strokeWidth={3} />
                        <span>Duplicate</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onRenameProject(project.id)} className="cursor-pointer hover:bg-zinc-800">
                        <Edit2 className="w-4 h-4 mr-2 text-amber-400" strokeWidth={3} />
                        <span>Rename</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onExportProject(project.id)} className="cursor-pointer hover:bg-zinc-800">
                        <Download className="w-4 h-4 mr-2 text-emerald-400" strokeWidth={3} />
                        <span>Export .pln</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-zinc-800" />
                      <DropdownMenuItem
                        onClick={() => onDeleteProject(project.id)}
                        className="text-red-400 focus:text-red-400 focus:bg-red-950/30 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 mr-2 text-red-400" strokeWidth={3} />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {project.description && (
                  <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                )}
              </div>

              {/* Tags footer */}
              <div className="flex flex-wrap gap-1 mt-3 pt-2.5 border-t border-zinc-800/80">
                {project.tags && project.tags.length > 0 ? (
                  project.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${
                        isFlowchart
                          ? 'text-violet-300 bg-violet-950/40 border-violet-800/40'
                          : 'text-sky-300 bg-sky-950/40 border-sky-800/40'
                      }`}
                    >
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-zinc-400 font-mono">#{isFlowchart ? 'Flowchart' : 'General'}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
