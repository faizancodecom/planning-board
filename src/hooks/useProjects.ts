import { useState, useEffect, useMemo } from 'react';
import { PlnFileMetadata, PlnFileContent } from '@/types/board';
import {
  getAllProjectMetadata,
  getProjectContent,
  saveProject,
  deleteProject as deleteProjectStorage,
  duplicateProject as duplicateProjectStorage,
  renameProject as renameProjectStorage,
  toggleFavorite as toggleFavoriteStorage,
} from '@/lib/storage';
import { createNewPlnContent, downloadPlnFile } from '@/lib/pln-file';
import { createPlanFromTemplate } from '@/lib/templates';

export function useProjects() {
  const [projects, setProjects] = useState<PlnFileMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('recent');
  const [boardTypeFilter, setBoardTypeFilter] = useState<'all' | 'planning' | 'flowchart'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('planboard_view_mode') as 'grid' | 'list') || 'grid';
  });

  const reloadProjects = () => {
    const list = getAllProjectMetadata();
    setProjects(list);
  };

  useEffect(() => {
    reloadProjects();
  }, []);

  const handleToggleViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('planboard_view_mode', mode);
  };

  // Filtered & Sorted Projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        // Board Type filter
        const pType = p.boardType || (p.category === 'flowchart' ? 'flowchart' : 'planning');
        if (boardTypeFilter !== 'all' && pType !== boardTypeFilter) {
          return false;
        }

        const q = searchQuery.toLowerCase().trim();
        if (!q) return true;
        return (
          p.title.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
        );
      })
      .sort((a, b) => {
        // Favorites always float to top if matching
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;

        if (sortOption === 'created') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortOption === 'title_asc') {
          return a.title.localeCompare(b.title);
        }
        if (sortOption === 'title_desc') {
          return b.title.localeCompare(a.title);
        }
        // Default: recent / last modified
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [projects, searchQuery, sortOption, boardTypeFilter]);

  const handleCreateNew = (
    title: string,
    description?: string,
    tags?: string[],
    templateId?: string,
    boardType: 'planning' | 'flowchart' = 'planning'
  ): PlnFileContent => {
    let newContent: PlnFileContent;

    if (templateId) {
      newContent = createPlanFromTemplate(templateId, title);
      if (description) newContent.metadata.description = description;
      if (tags && tags.length > 0) newContent.metadata.tags = tags;
      if (boardType) newContent.metadata.boardType = boardType;
    } else {
      newContent = createNewPlnContent(title, {
        description: description || '',
        tags: tags || [boardType === 'flowchart' ? 'Flowchart' : 'General'],
        category: boardType === 'flowchart' ? 'flowchart' : 'business',
        boardType,
      });
    }

    saveProject(newContent);
    reloadProjects();
    return newContent;
  };

  const handleDuplicate = (id: string) => {
    const dup = duplicateProjectStorage(id);
    if (dup) {
      reloadProjects();
    }
  };

  const handleRename = (id: string, newTitle: string) => {
    renameProjectStorage(id, newTitle);
    reloadProjects();
  };

  const handleDelete = (id: string) => {
    deleteProjectStorage(id);
    reloadProjects();
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavoriteStorage(id);
    reloadProjects();
  };

  const handleImportPln = (content: PlnFileContent) => {
    saveProject(content);
    reloadProjects();
  };

  const handleExportPln = (id: string) => {
    const content = getProjectContent(id);
    if (content) {
      downloadPlnFile(content);
    }
  };

  return {
    projects,
    filteredProjects,
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    boardTypeFilter,
    setBoardTypeFilter,
    viewMode,
    toggleViewMode: handleToggleViewMode,
    reloadProjects,
    createNewProject: handleCreateNew,
    duplicateProject: handleDuplicate,
    renameProject: handleRename,
    deleteProject: handleDelete,
    toggleFavorite: handleToggleFavorite,
    importPln: handleImportPln,
    exportPln: handleExportPln,
  };
}
