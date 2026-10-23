import React from 'react';
import { PlnFileMetadata } from '@/types/board';
import { formatDate, formatExactDateTime } from '@/lib/utils';
import {
  MoreVertical,
  Star,
  Download,
  Copy,
  Edit2,
  Trash2,
  ExternalLink,
  Layers,
  Workflow,
  Layout,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface ProjectListProps {
  projects: PlnFileMetadata[];
  onOpenProject: (id: string) => void;
  onDuplicateProject: (id: string) => void;
  onRenameProject: (id: string) => void;
  onExportProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
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
          Try adjusting your search criteria or create a new board.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-zinc-800 bg-zinc-950 overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          {/* Table Header */}
          <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-mono uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4 w-10 text-center">Fav</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Board Name & Details</th>
              <th className="py-3 px-4">Tags</th>
              <th className="py-3 px-4">Last Modified</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-zinc-800/80">
            {projects.map((project) => {
              const isFlowchart = project.boardType === 'flowchart' || project.category === 'flowchart';

              return (
                <tr
                  key={project.id}
                  className="group hover:bg-zinc-900/60 transition-colors cursor-pointer"
                  onClick={() => onOpenProject(project.id)}
                >
                  {/* Favorite Star */}
                  <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleFavorite(project.id)}
                      className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          project.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
                        }`}
                        strokeWidth={3}
                      />
                    </button>
                  </td>

                  {/* Board Type Badge */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {isFlowchart ? (
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-violet-950/90 text-violet-300 border border-violet-800/60 inline-flex items-center gap-1">
                        <Workflow className="w-3 h-3 text-violet-400" />
                        <span>FLOWCHART</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-950/90 text-blue-300 border border-blue-800/60 inline-flex items-center gap-1">
                        <Layout className="w-3 h-3 text-blue-400" />
                        <span>PLANNING</span>
                      </span>
                    )}
                  </td>

                  {/* Title & Description */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold text-sm text-white transition-colors ${
                          isFlowchart ? 'group-hover:text-violet-300' : 'group-hover:text-sky-300'
                        }`}
                      >
                        {project.title}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                        {project.description}
                      </p>
                    )}
                  </td>

                  {/* Tags */}
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {project.tags && project.tags.length > 0 ? (
                        project.tags.slice(0, 3).map((t, idx) => (
                          <span
                            key={idx}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                              isFlowchart
                                ? 'text-violet-300 bg-violet-950/40 border-violet-800/40'
                                : 'text-sky-300 bg-sky-950/40 border-sky-800/40'
                            }`}
                          >
                            #{t}
                          </span>
                        ))
                      ) : (
                        <span className="text-zinc-600 font-mono">—</span>
                      )}
                    </div>
                  </td>

                  {/* Last Modified */}
                  <td className="py-3 px-4 font-mono text-zinc-400 whitespace-nowrap">
                    <span title={formatExactDateTime(project.updatedAt)}>
                      {formatDate(project.updatedAt)}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        onClick={() => onOpenProject(project.id)}
                        className={`h-7 px-3 text-xs font-bold text-white gap-1 shadow-sm ${
                          isFlowchart
                            ? 'bg-violet-600 hover:bg-violet-500'
                            : 'bg-blue-600 hover:bg-blue-500'
                        }`}
                      >
                        <ExternalLink className="w-3 h-3 text-white" strokeWidth={3} />
                        <span>Open</span>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer">
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
