import { useState, useCallback, useRef, useEffect } from 'react';
import { BoardElement, PlnFileContent, ViewportState } from '@/types/board';
import { saveProject } from '@/lib/storage';

export function useCanvasEngine(initialPlan: PlnFileContent | null) {
  const [plan, setPlan] = useState<PlnFileContent | null>(initialPlan);
  const [elements, setElements] = useState<BoardElement[]>(initialPlan?.elements || []);
  const [viewport, setViewport] = useState<ViewportState>(
    initialPlan?.viewport || { zoom: 1.0, panX: 0, panY: 0, gridType: 'dots', theme: 'dark' }
  );

  // Undo / Redo history stacks
  const [history, setHistory] = useState<BoardElement[][]>([]);
  const [redoStack, setRedoStack] = useState<BoardElement[][]>([]);

  // Update internal state when a different plan is loaded
  useEffect(() => {
    if (initialPlan) {
      setPlan(initialPlan);
      setElements(initialPlan.elements || []);
      setViewport(
        initialPlan.viewport || { zoom: 1.0, panX: 0, panY: 0, gridType: 'dots', theme: 'dark' }
      );
      setHistory([]);
      setRedoStack([]);
    }
  }, [initialPlan?.metadata.id]);

  // Debounced auto-save to storage
  const saveTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (!plan) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const updatedPlan: PlnFileContent = {
        ...plan,
        elements,
        viewport,
        metadata: {
          ...plan.metadata,
          updatedAt: new Date().toISOString(),
        },
      };
      saveProject(updatedPlan);
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [elements, viewport, plan?.metadata.title]);

  // Fast direct elements update (used during live drag/draw without polluting history)
  const setElementsDirect = useCallback((newElements: BoardElement[]) => {
    setElements(newElements);
  }, []);

  // Commit changes with undo snapshot recording
  const updateElementsWithHistory = useCallback(
    (newElements: BoardElement[]) => {
      setHistory((prev) => [...prev.slice(-40), elements]);
      setRedoStack([]);
      setElements(newElements);
    },
    [elements]
  );

  // Save explicit history snapshot before a major drag/edit action starts
  const pushHistorySnapshot = useCallback(() => {
    setHistory((prev) => [...prev.slice(-40), elements]);
    setRedoStack([]);
  }, [elements]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack((prev) => [elements, ...prev]);
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setElements(previous);
  }, [history, elements]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory((prev) => [...prev, elements]);
    setRedoStack((prev) => prev.slice(1));
    setElements(next);
  }, [redoStack, elements]);

  const handleUpdateTitle = useCallback(
    (newTitle: string) => {
      if (!plan) return;
      setPlan({
        ...plan,
        metadata: {
          ...plan.metadata,
          title: newTitle,
        },
      });
    },
    [plan]
  );

  return {
    plan,
    elements,
    viewport,
    canUndo: history.length > 0,
    canRedo: redoStack.length > 0,
    updateElements: updateElementsWithHistory,
    setElementsDirect,
    pushHistorySnapshot,
    updateViewport: setViewport,
    undo: handleUndo,
    redo: handleRedo,
    updateTitle: handleUpdateTitle,
  };
}
