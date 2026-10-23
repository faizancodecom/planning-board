import React, { useState, useRef, useEffect } from 'react';
import { PlnFileContent, ToolType, BoardType } from '@/types/board';
import { useProjects } from '@/hooks/useProjects';
import { useCanvasEngine } from '@/hooks/useCanvasEngine';
import { getProjectContent, clearAllDemoData } from '@/lib/storage';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { ProjectGrid } from '@/components/dashboard/ProjectGrid';
import { ProjectList } from '@/components/dashboard/ProjectList';
import { SearchModal } from '@/components/dashboard/SearchModal';
import { NewProjectDialog } from '@/components/dashboard/NewProjectDialog';
import { ImportPlnDialog } from '@/components/dashboard/ImportPlnDialog';
import { RenameDialog } from '@/components/dashboard/RenameDialog';
import { DeleteConfirmDialog } from '@/components/dashboard/DeleteConfirmDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EditorHeader } from '@/components/editor/EditorHeader';
import { Toolbar } from '@/components/editor/Toolbar';
import { Canvas } from '@/components/editor/Canvas';
import { ExportModal } from '@/components/editor/ExportModal';
import { ShareModal } from '@/components/editor/ShareModal';
import { generateId } from '@/lib/utils';
import { Plus, Trash2, Layers, Workflow, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function App() {
  // Navigation State: 'dashboard' | 'editor'
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>('dashboard');
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [activePlanContent, setActivePlanContent] = useState<PlnFileContent | null>(null);

  // Active Drawing Tool and Active Color in Editor
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [activeColor, setActiveColor] = useState<string>('#ffffff');

  // Modals state
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [newProjectInitialType, setNewProjectInitialType] = useState<BoardType>('planning');
  const [isImportPlnOpen, setIsImportPlnOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isClearAllPlansOpen, setIsClearAllPlansOpen] = useState(false);
  const [isClearCanvasOpen, setIsClearCanvasOpen] = useState(false);
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Projects Dashboard Hook
  const {
    projects,
    filteredProjects,
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    boardTypeFilter,
    setBoardTypeFilter,
    viewMode,
    toggleViewMode,
    reloadProjects,
    createNewProject,
    duplicateProject,
    renameProject,
    deleteProject,
    toggleFavorite,
    importPln,
    exportPln,
  } = useProjects();

  // Canvas Engine Hook
  const {
    plan,
    elements,
    viewport,
    canUndo,
    canRedo,
    updateElements,
    setElementsDirect,
    pushHistorySnapshot,
    updateViewport,
    undo,
    redo,
    updateTitle,
  } = useCanvasEngine(activePlanContent);

  // Counts for Planning Boards vs Flowcharts
  const planningProjectsCount = projects.filter(
    (p) => (p.boardType || (p.category === 'flowchart' ? 'flowchart' : 'planning')) === 'planning'
  ).length;

  const flowchartProjectsCount = projects.filter(
    (p) => (p.boardType || (p.category === 'flowchart' ? 'flowchart' : 'planning')) === 'flowchart'
  ).length;

  // Global keyboard shortcut: Ctrl+K / Cmd+K to open Search Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Open a plan in editor
  const handleOpenPlan = (id: string) => {
    const content = getProjectContent(id);
    if (content) {
      setActivePlanId(id);
      setActivePlanContent(content);
      setActiveTool('select');
      setCurrentView('editor');
      window.scrollTo(0, 0);
    }
  };

  // Back to dashboard
  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setActivePlanId(null);
    setActivePlanContent(null);
    reloadProjects();
  };

  // Create new plan and open
  const handleCreateNewProject = (
    title: string,
    description: string,
    tags: string[],
    templateId?: string,
    boardType: BoardType = 'planning'
  ) => {
    const newContent = createNewProject(title, description, tags, templateId, boardType);
    setActivePlanId(newContent.metadata.id);
    setActivePlanContent(newContent);
    setActiveTool('select');
    setCurrentView('editor');
  };

  // Handle Image Upload on Canvas
  const handleUploadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const newImage = {
        id: generateId('img'),
        type: 'image' as const,
        src,
        x: (100 - viewport.panX) / viewport.zoom,
        y: (100 - viewport.panY) / viewport.zoom,
        width: 320,
        height: 240,
        isMonochrome: false,
        zIndex: elements.length + 1,
      };
      pushHistorySnapshot();
      updateElements([...elements, newImage]);
      setActiveTool('select');
    };
    reader.readAsDataURL(file);
  };

  // Handle Image Drop on Canvas
  const handleDropImage = (file: File, worldX: number, worldY: number) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const newImage = {
        id: generateId('img'),
        type: 'image' as const,
        src,
        x: worldX,
        y: worldY,
        width: 320,
        height: 240,
        isMonochrome: false,
        zIndex: elements.length + 1,
      };
      pushHistorySnapshot();
      updateElements([...elements, newImage]);
      setActiveTool('select');
    };
    reader.readAsDataURL(file);
  };

  const isCurrentFlowchart =
    plan?.metadata.boardType === 'flowchart' || plan?.metadata.category === 'flowchart';

  const projectToRename = projects.find((p) => p.id === renamingProjectId);
  const projectToDelete = projects.find((p) => p.id === deletingProjectId);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {currentView === 'dashboard' ? (
        /* ================= DASHBOARD VIEW ================= */
        <div className="flex-1 flex flex-col">
          <DashboardHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortOption={sortOption}
            onSortChange={setSortOption}
            boardTypeFilter={boardTypeFilter}
            onBoardTypeFilterChange={setBoardTypeFilter}
            viewMode={viewMode}
            onToggleViewMode={toggleViewMode}
            onOpenNewProject={(type) => {
              setNewProjectInitialType(type || 'planning');
              setIsNewProjectOpen(true);
            }}
            onOpenImportPln={() => setIsImportPlnOpen(true)}
            onOpenSearchModal={() => setIsSearchModalOpen(true)}
            totalPlansCount={projects.length}
            planningCount={planningProjectsCount}
            flowchartCount={flowchartProjectsCount}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Dashboard Hero Banner with Illustration */}
            <DashboardHero
              onNewPlanningBoard={() => {
                setNewProjectInitialType('planning');
                setIsNewProjectOpen(true);
              }}
              onNewFlowchart={() => {
                setNewProjectInitialType('flowchart');
                setIsNewProjectOpen(true);
              }}
              onImportPln={() => setIsImportPlnOpen(true)}
              totalPlansCount={projects.length}
            />

            {/* Plans List or Grid Heading & Actions */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black uppercase tracking-wider text-white">
                  {boardTypeFilter === 'all'
                    ? `All Boards (${filteredProjects.length})`
                    : boardTypeFilter === 'flowchart'
                    ? `Flowcharts (${filteredProjects.length})`
                    : `Planning Boards (${filteredProjects.length})`}
                </h2>
                {searchQuery && (
                  <span className="text-xs text-zinc-400 font-mono">
                    matching "{searchQuery}"
                  </span>
                )}
              </div>

              {projects.length > 0 && (
                <button
                  onClick={() => setIsClearAllPlansOpen(true)}
                  className="text-xs text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer font-mono"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={3} />
                  <span>Clear All Boards</span>
                </button>
              )}
            </div>

            {/* Empty State vs Grid / List Render */}
            {filteredProjects.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40 p-8 flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300 mb-4 shadow-sm">
                  {boardTypeFilter === 'flowchart' ? (
                    <Workflow className="w-7 h-7 text-violet-400" strokeWidth={2.5} />
                  ) : (
                    <Layers className="w-7 h-7 text-sky-400" strokeWidth={3} />
                  )}
                </div>
                <h3 className="text-base font-bold text-white">
                  {boardTypeFilter === 'flowchart'
                    ? 'No Flowcharts created yet'
                    : 'No Planning boards created yet'}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
                  {boardTypeFilter === 'flowchart'
                    ? 'Map processes, logic conditions, databases, and smart arrows.'
                    : 'Start an infinite canvas with marker, colorful sticky notes, live charts, and .pln export.'}
                </p>
                <div className="flex items-center gap-3 mt-6">
                  {boardTypeFilter === 'flowchart' ? (
                    <Button
                      size="default"
                      onClick={() => {
                        setNewProjectInitialType('flowchart');
                        setIsNewProjectOpen(true);
                      }}
                      className="gap-2 font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 cursor-pointer"
                    >
                      <Workflow className="w-4 h-4" strokeWidth={2.5} />
                      <span>Create Flowchart</span>
                    </Button>
                  ) : (
                    <Button
                      size="default"
                      onClick={() => {
                        setNewProjectInitialType('planning');
                        setIsNewProjectOpen(true);
                      }}
                      className="gap-2 font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 cursor-pointer"
                    >
                      <Layout className="w-4 h-4" strokeWidth={2.5} />
                      <span>Create Planning Board</span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => setIsImportPlnOpen(true)}
                    className="gap-2 border-emerald-700/60 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 hover:text-emerald-100 font-bold cursor-pointer"
                  >
                    <span>Import .pln File</span>
                  </Button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <ProjectGrid
                projects={filteredProjects}
                onOpenProject={handleOpenPlan}
                onDuplicateProject={duplicateProject}
                onRenameProject={(id) => setRenamingProjectId(id)}
                onExportProject={exportPln}
                onDeleteProject={(id) => setDeletingProjectId(id)}
                onToggleFavorite={toggleFavorite}
              />
            ) : (
              <ProjectList
                projects={filteredProjects}
                onOpenProject={handleOpenPlan}
                onDuplicateProject={duplicateProject}
                onRenameProject={(id) => setRenamingProjectId(id)}
                onExportProject={exportPln}
                onDeleteProject={(id) => setDeletingProjectId(id)}
                onToggleFavorite={toggleFavorite}
              />
            )}
          </main>
        </div>
      ) : (
        /* ================= CANVAS EDITOR VIEW ================= */
        <div className="flex-1 flex flex-col overflow-hidden relative" onContextMenu={(e) => e.preventDefault()}>
          {plan && (
            <>
              <EditorHeader
                metadata={plan.metadata}
                zoom={viewport.zoom}
                canUndo={canUndo}
                canRedo={canRedo}
                onBackToDashboard={handleBackToDashboard}
                onUpdateTitle={updateTitle}
                onUndo={undo}
                onRedo={redo}
                onZoomIn={() => {
                  const rect = canvasContainerRef.current?.getBoundingClientRect() || {
                    width: window.innerWidth,
                    height: window.innerHeight,
                  };
                  const cx = rect.width / 2;
                  const cy = rect.height / 2;
                  const newZoom = Math.min(4.0, Number((viewport.zoom * 1.2).toFixed(2)));
                  const newPanX = cx - (cx - viewport.panX) * (newZoom / viewport.zoom);
                  const newPanY = cy - (cy - viewport.panY) * (newZoom / viewport.zoom);
                  updateViewport({ ...viewport, panX: newPanX, panY: newPanY, zoom: newZoom });
                }}
                onZoomOut={() => {
                  const rect = canvasContainerRef.current?.getBoundingClientRect() || {
                    width: window.innerWidth,
                    height: window.innerHeight,
                  };
                  const cx = rect.width / 2;
                  const cy = rect.height / 2;
                  const newZoom = Math.max(0.15, Number((viewport.zoom / 1.2).toFixed(2)));
                  const newPanX = cx - (cx - viewport.panX) * (newZoom / viewport.zoom);
                  const newPanY = cy - (cy - viewport.panY) * (newZoom / viewport.zoom);
                  updateViewport({ ...viewport, panX: newPanX, panY: newPanY, zoom: newZoom });
                }}
                onResetZoom={() => {
                  const rect = canvasContainerRef.current?.getBoundingClientRect() || {
                    width: window.innerWidth,
                    height: window.innerHeight,
                  };
                  const cx = rect.width / 2;
                  const cy = rect.height / 2;
                  const newZoom = 1.0;
                  const newPanX = cx - (cx - viewport.panX) * (newZoom / viewport.zoom);
                  const newPanY = cy - (cy - viewport.panY) * (newZoom / viewport.zoom);
                  updateViewport({ ...viewport, panX: newPanX, panY: newPanY, zoom: newZoom });
                }}
                onOpenExport={() => setIsExportOpen(true)}
                onOpenShare={() => setIsShareOpen(true)}
              />

              <div className="flex-1 relative">
                <Canvas
                  elements={elements}
                  viewport={viewport}
                  activeTool={activeTool}
                  activeColor={activeColor}
                  boardType={isCurrentFlowchart ? 'flowchart' : 'planning'}
                  onSelectTool={setActiveTool}
                  onUpdateElements={updateElements}
                  onSetElementsDirect={setElementsDirect}
                  onPushHistorySnapshot={pushHistorySnapshot}
                  onUpdateViewport={updateViewport}
                  containerRef={canvasContainerRef}
                  onDropImage={handleDropImage}
                />

                <Toolbar
                  activeTool={activeTool}
                  activeColor={activeColor}
                  boardType={isCurrentFlowchart ? 'flowchart' : 'planning'}
                  onSelectTool={setActiveTool}
                  onSelectColor={setActiveColor}
                  onUploadImage={handleUploadImage}
                  onClearCanvas={() => setIsClearCanvasOpen(true)}
                />
              </div>

              {/* Export Modal */}
              <ExportModal
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                planContent={{
                  ...plan,
                  elements,
                  viewport,
                }}
                canvasContainerRef={canvasContainerRef}
              />

              {/* Share Modal */}
              <ShareModal
                isOpen={isShareOpen}
                onClose={() => setIsShareOpen(false)}
                planContent={{
                  ...plan,
                  elements,
                  viewport,
                }}
              />
            </>
          )}
        </div>
      )}

      {/* New Project Dialog with Planning vs Flowchart Selection */}
      <NewProjectDialog
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onCreate={handleCreateNewProject}
        initialBoardType={newProjectInitialType}
      />

      {/* Global Search & Command Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        projects={projects}
        onOpenProject={handleOpenPlan}
        onNewProject={() => {
          setNewProjectInitialType('planning');
          setIsNewProjectOpen(true);
        }}
      />

      {/* Import .pln Dialog */}
      <ImportPlnDialog
        isOpen={isImportPlnOpen}
        onClose={() => setIsImportPlnOpen(false)}
        onImportSuccess={(content) => {
          importPln(content);
          handleOpenPlan(content.metadata.id);
        }}
      />

      {/* Rename Board Dialog */}
      {projectToRename && (
        <RenameDialog
          isOpen={!!renamingProjectId}
          onClose={() => setRenamingProjectId(null)}
          initialTitle={projectToRename.title}
          onRename={(newTitle) => {
            renameProject(projectToRename.id, newTitle);
            setRenamingProjectId(null);
          }}
        />
      )}

      {/* Delete Board Confirmation Dialog */}
      {projectToDelete && (
        <DeleteConfirmDialog
          isOpen={!!deletingProjectId}
          onClose={() => setDeletingProjectId(null)}
          planTitle={projectToDelete.title}
          onConfirm={() => {
            deleteProject(projectToDelete.id);
            setDeletingProjectId(null);
          }}
        />
      )}

      {/* Clear All Plans Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isClearAllPlansOpen}
        onClose={() => setIsClearAllPlansOpen(false)}
        onConfirm={() => {
          clearAllDemoData();
          reloadProjects();
        }}
        title="Clear All Saved Boards?"
        description="Are you sure you want to remove all saved boards from your dashboard? This will wipe your local workspace index."
        confirmText="Yes, Clear All"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Clear Canvas Elements Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isClearCanvasOpen}
        onClose={() => setIsClearCanvasOpen(false)}
        onConfirm={() => {
          pushHistorySnapshot();
          updateElements([]);
        }}
        title="Clear Whiteboard Canvas?"
        description="Are you sure you want to remove all elements, drawings, sticky notes, and graphs from this canvas?"
        confirmText="Clear Canvas"
        cancelText="Keep Elements"
        variant="danger"
      />
    </div>
  );
}

export default App;
