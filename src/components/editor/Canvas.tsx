import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  BoardElement,
  ToolType,
  ShapeType,
  PortDirection,
  ViewportState,
  DrawingElement,
  ShapeElement,
  StickyElement,
  TextElement,
  ImageElement,
  GraphElement,
} from '@/types/board';
import { generateId } from '@/lib/utils';
import { ShapeRenderer } from './elements/ShapeRenderer';
import { PenPathRenderer } from './elements/PenPathRenderer';
import { StickyNoteRenderer } from './elements/StickyNoteRenderer';
import { TextRenderer } from './elements/TextRenderer';
import { ImageRenderer } from './elements/ImageRenderer';
import { GraphRenderer } from './elements/GraphRenderer';
import { PropertiesPanel } from './PropertiesPanel';
import { FlowchartPanel } from './FlowchartPanel';
import {
  Trash2,
  Copy,
  Lock,
  Unlock,
  BringToFront,
  SendToBack,
  Hand,
  MousePointer2,
  Workflow,
} from 'lucide-react';
import { ChartConfigModal } from './ChartConfigModal';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuShortcut,
} from '@/components/ui/context-menu';

interface CanvasProps {
  elements: BoardElement[];
  viewport: ViewportState;
  activeTool: ToolType;
  activeColor: string;
  boardType?: 'planning' | 'flowchart';
  onSelectTool: (tool: ToolType) => void;
  onUpdateElements: (elements: BoardElement[]) => void;
  onSetElementsDirect: (elements: BoardElement[]) => void;
  onPushHistorySnapshot: () => void;
  onUpdateViewport: (viewport: ViewportState) => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  onDropImage?: (file: File, x: number, y: number) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  elements,
  viewport,
  activeTool,
  activeColor,
  boardType = 'planning',
  onSelectTool,
  onUpdateElements,
  onPushHistorySnapshot,
  onUpdateViewport,
  containerRef: externalContainerRef,
  onDropImage,
}) => {
  const localContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = externalContainerRef || localContainerRef;

  // Selected element ID
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [editingGraphId, setEditingGraphId] = useState<string | null>(null);

  // Inline Shape Text Editing State
  const [editingShapeId, setEditingShapeId] = useState<string | null>(null);
  const [shapeEditingText, setShapeEditingText] = useState('');

  // Interactive Node Connection State
  const [connectingFromNodeId, setConnectingFromNodeId] = useState<string | null>(null);
  const [connectionDrag, setConnectionDrag] = useState<{
    fromId: string;
    fromPort: PortDirection;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Flowchart Left Panel state
  const [isFlowchartPanelOpen, setIsFlowchartPanelOpen] = useState(boardType === 'flowchart');

  // Automatically open Flowchart Panel when Flowchart tool is selected
  useEffect(() => {
    if (activeTool === 'flowchart' || boardType === 'flowchart') {
      setIsFlowchartPanelOpen(true);
    }
  }, [activeTool, boardType]);

  // Freehand drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStrokePoints, setCurrentStrokePoints] = useState<{ x: number; y: number }[]>([]);

  // Shape creation state (only for manual drawing of standard geometric shapes)
  const [shapeStartPoint, setShapeStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [shapePreview, setShapePreview] = useState<ShapeElement | null>(null);

  // Pan state (Hand tool or middle-click)
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 120 FPS hardware-accelerated drag state
  const dragInfoRef = useRef<{
    elementId: string;
    startScreenX: number;
    startScreenY: number;
    origX: number;
    origY: number;
    currentDx: number;
    currentDy: number;
  } | null>(null);

  const [liveDrag, setLiveDrag] = useState<{
    elementId: string;
    dx: number;
    dy: number;
  } | null>(null);

  // Resize state
  const resizeInfoRef = useRef<{
    elementId: string;
    startScreenX: number;
    startScreenY: number;
    origWidth: number;
    origHeight: number;
    currentDw: number;
    currentDh: number;
  } | null>(null);

  const [liveResize, setLiveResize] = useState<{
    elementId: string;
    dw: number;
    dh: number;
  } | null>(null);

  // Screen Coordinates to World (Canvas) Coordinates
  const screenToWorld = useCallback(
    (screenX: number, screenY: number) => {
      const rect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
      const localX = screenX - rect.left;
      const localY = screenY - rect.top;
      return {
        x: (localX - viewport.panX) / viewport.zoom,
        y: (localY - viewport.panY) / viewport.zoom,
      };
    },
    [viewport.panX, viewport.panY, viewport.zoom, containerRef]
  );

  // Calculate Center of Viewport in World Coordinates
  const getViewportCenter = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect() || { width: 1000, height: 800 };
    const screenCenterX = rect.width / 2;
    const screenCenterY = rect.height / 2;
    return {
      x: (screenCenterX - viewport.panX) / viewport.zoom,
      y: (screenCenterY - viewport.panY) / viewport.zoom,
    };
  }, [viewport.panX, viewport.panY, viewport.zoom, containerRef]);

  // Add Flowchart Element Handler
  const handleAddFlowchartElement = useCallback(
    (newEl: BoardElement) => {
      onPushHistorySnapshot();
      onUpdateElements([...elements, newEl]);
      setSelectedElementId(newEl.id);
    },
    [elements, onPushHistorySnapshot, onUpdateElements]
  );

  // Add Multiple Flowchart Elements Handler
  const handleAddMultipleFlowchartElements = useCallback(
    (newElements: BoardElement[]) => {
      onPushHistorySnapshot();
      onUpdateElements([...elements, ...newElements]);
      if (newElements.length > 0) {
        setSelectedElementId(newElements[0].id);
      }
    },
    [elements, onPushHistorySnapshot, onUpdateElements]
  );

  // Compute exact coordinates of a connection port on any node
  const getNodePortPos = useCallback(
    (el: BoardElement, port: PortDirection, liveDx: number = 0, liveDy: number = 0) => {
      const nx = el.x + liveDx;
      const ny = el.y + liveDy;
      switch (port) {
        case 'top':
          return { x: nx + el.width / 2, y: ny };
        case 'right':
          return { x: nx + el.width, y: ny + el.height / 2 };
        case 'bottom':
          return { x: nx + el.width / 2, y: ny + el.height };
        case 'left':
          return { x: nx, y: ny + el.height / 2 };
      }
    },
    []
  );

  // Compute best attachment ports between 2 nodes
  const getClosestPorts = useCallback(
    (fromEl: BoardElement, toEl: BoardElement, liveDxA = 0, liveDyA = 0, liveDxB = 0, liveDyB = 0) => {
      const ax = fromEl.x + liveDxA + fromEl.width / 2;
      const ay = fromEl.y + liveDyA + fromEl.height / 2;
      const bx = toEl.x + liveDxB + toEl.width / 2;
      const by = toEl.y + liveDyB + toEl.height / 2;

      const dx = bx - ax;
      const dy = by - ay;

      if (Math.abs(dx) > Math.abs(dy)) {
        return dx > 0
          ? { fromPort: 'right' as PortDirection, toPort: 'left' as PortDirection }
          : { fromPort: 'left' as PortDirection, toPort: 'right' as PortDirection };
      } else {
        return dy > 0
          ? { fromPort: 'bottom' as PortDirection, toPort: 'top' as PortDirection }
          : { fromPort: 'top' as PortDirection, toPort: 'bottom' as PortDirection };
      }
    },
    []
  );

  // Helper to connect two existing nodes
  const handleConnectTwoNodes = useCallback(
    (
      fromId: string,
      toId: string,
      fromPort?: PortDirection,
      toPort?: PortDirection,
      connectorType: ShapeType = 'connector-straight'
    ) => {
      if (fromId === toId) {
        setConnectingFromNodeId(null);
        setConnectionDrag(null);
        return;
      }
      const elA = elements.find((e) => e.id === fromId);
      const elB = elements.find((e) => e.id === toId);
      if (!elA || !elB) {
        setConnectingFromNodeId(null);
        setConnectionDrag(null);
        return;
      }

      let pA = fromPort;
      let pB = toPort;
      if (!pA || !pB) {
        const closest = getClosestPorts(elA, elB);
        if (!pA) pA = closest.fromPort;
        if (!pB) pB = closest.toPort;
      }

      const posA = getNodePortPos(elA, pA || 'bottom');
      const posB = getNodePortPos(elB, pB || 'top');

      let posX_A = posA.x;
      let posX_B = posB.x;
      let posY_A = posA.y;
      let posY_B = posB.y;

      if (Math.abs(posX_A - posX_B) <= 8) {
        posX_B = posX_A;
      }
      if (Math.abs(posY_A - posY_B) <= 8) {
        posY_B = posY_A;
      }

      const minX = Math.min(posX_A, posX_B);
      const minY = Math.min(posY_A, posY_B);
      const width = Math.abs(posX_B - posX_A);
      const height = Math.abs(posY_B - posY_A);
      const flipX = posX_B < posX_A;
      const flipY = posY_B < posY_A;

      const newConnector: ShapeElement = {
        id: generateId('shape'),
        type: 'shape',
        shapeType: connectorType,
        x: minX,
        y: minY,
        width,
        height,
        flipX,
        flipY,
        fill: 'transparent',
        stroke: activeColor !== '#ffffff' ? activeColor : '#38bdf8',
        strokeWidth: 3,
        animated: true,
        fromElementId: elA.id,
        fromPort: pA,
        toElementId: elB.id,
        toPort: pB,
        zIndex: Math.max(elA.zIndex, elB.zIndex) + 1,
      };

      onPushHistorySnapshot();
      onUpdateElements([...elements, newConnector]);
      setConnectingFromNodeId(null);
      setConnectionDrag(null);
    },
    [elements, activeColor, onPushHistorySnapshot, onUpdateElements, getClosestPorts, getNodePortPos]
  );

  // Helper to quickly create the next node and link with dynamic animated line
  const handleQuickAddNextNode = useCallback(
    (
      fromEl: ShapeElement,
      direction: 'right' | 'down',
      nodeType: ShapeType = 'flowchart-process',
      text: string = 'Next Step'
    ) => {
      const isRight = direction === 'right';
      const nextWidth =
        nodeType === 'flowchart-decision' ? 160 : nodeType === 'flowchart-database' ? 150 : 170;
      const nextHeight =
        nodeType === 'flowchart-decision' ? 90 : nodeType === 'flowchart-database' ? 85 : 70;

      // Perfectly center-aligned on the parent's axis
      const nextX = isRight
        ? fromEl.x + fromEl.width + 100
        : Math.round(fromEl.x + fromEl.width / 2 - nextWidth / 2);
      const nextY = isRight
        ? Math.round(fromEl.y + fromEl.height / 2 - nextHeight / 2)
        : fromEl.y + fromEl.height + 80;

      const newNode: ShapeElement = {
        id: generateId('shape'),
        type: 'shape',
        shapeType: nodeType,
        x: nextX,
        y: nextY,
        width: nextWidth,
        height: nextHeight,
        fill:
          nodeType === 'flowchart-decision'
            ? '#312e81'
            : nodeType === 'flowchart-database'
            ? '#701a75'
            : nodeType === 'flowchart-terminator'
            ? '#14532d'
            : '#18181b',
        stroke:
          nodeType === 'flowchart-decision'
            ? '#a855f7'
            : nodeType === 'flowchart-database'
            ? '#f472b6'
            : nodeType === 'flowchart-terminator'
            ? '#4ade80'
            : '#38bdf8',
        strokeWidth: 2,
        text,
        zIndex: elements.length + 1,
      };

      const fromPort: PortDirection = isRight ? 'right' : 'bottom';
      const toPort: PortDirection = isRight ? 'left' : 'top';

      const posA = getNodePortPos(fromEl, fromPort);
      const posB = getNodePortPos(newNode, toPort);

      let posX_A = posA.x;
      let posX_B = posB.x;
      let posY_A = posA.y;
      let posY_B = posB.y;

      if (Math.abs(posX_A - posX_B) <= 8) posX_B = posX_A;
      if (Math.abs(posY_A - posY_B) <= 8) posY_B = posY_A;

      const minX = Math.min(posX_A, posX_B);
      const minY = Math.min(posY_A, posY_B);
      const width = Math.abs(posX_B - posX_A);
      const height = Math.abs(posY_B - posY_A);
      const flipX = posX_B < posX_A;
      const flipY = posY_B < posY_A;

      const connectorArrow: ShapeElement = {
        id: generateId('shape'),
        type: 'shape',
        shapeType: 'connector-straight',
        x: minX,
        y: minY,
        width,
        height,
        flipX,
        flipY,
        fill: 'transparent',
        stroke: '#818cf8',
        strokeWidth: 3,
        animated: true,
        fromElementId: fromEl.id,
        fromPort,
        toElementId: newNode.id,
        toPort,
        zIndex: elements.length + 2,
      };

      onPushHistorySnapshot();
      onUpdateElements([...elements, newNode, connectorArrow]);
      setSelectedElementId(newNode.id);
    },
    [elements, getNodePortPos, onPushHistorySnapshot, onUpdateElements]
  );

  // Global Pointer Events for smooth 120 FPS dragging and resizing
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      // Element Dragging
      if (dragInfoRef.current) {
        const info = dragInfoRef.current;
        const dx = (e.clientX - info.startScreenX) / viewport.zoom;
        const dy = (e.clientY - info.startScreenY) / viewport.zoom;
        info.currentDx = dx;
        info.currentDy = dy;
        setLiveDrag({ elementId: info.elementId, dx, dy });
      }

      // Element Resizing
      if (resizeInfoRef.current) {
        const info = resizeInfoRef.current;
        const dw = (e.clientX - info.startScreenX) / viewport.zoom;
        const dh = (e.clientY - info.startScreenY) / viewport.zoom;
        info.currentDw = dw;
        info.currentDh = dh;
        setLiveResize({ elementId: info.elementId, dw, dh });
      }
    };

    const handleGlobalPointerUp = () => {
      // Commit Element Drag
      if (dragInfoRef.current) {
        const info = dragInfoRef.current;
        dragInfoRef.current = null;
        setLiveDrag(null);

        if (Math.abs(info.currentDx) > 1 || Math.abs(info.currentDy) > 1) {
          onPushHistorySnapshot();
          const updated = elements.map((el) => {
            if (el.id === info.elementId) {
              return {
                ...el,
                x: Math.round(info.origX + info.currentDx),
                y: Math.round(info.origY + info.currentDy),
              };
            }
            return el;
          });
          onUpdateElements(updated);
        }
      }

      // Commit Element Resize
      if (resizeInfoRef.current) {
        const info = resizeInfoRef.current;
        resizeInfoRef.current = null;
        setLiveResize(null);

        if (Math.abs(info.currentDw) > 1 || Math.abs(info.currentDh) > 1) {
          onPushHistorySnapshot();
          const updated = elements.map((el) => {
            if (el.id === info.elementId) {
              return {
                ...el,
                width: Math.max(30, Math.round(info.origWidth + info.currentDw)),
                height: Math.max(20, Math.round(info.origHeight + info.currentDh)),
              };
            }
            return el;
          });
          onUpdateElements(updated);
        }
      }
    };

    window.addEventListener('pointermove', handleGlobalPointerMove, { passive: true });
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, [viewport.zoom, elements, onPushHistorySnapshot, onUpdateElements]);

  // Delete element helper
  const handleDeleteElement = useCallback(
    (idToDelete?: string) => {
      const targetId = idToDelete || selectedElementId;
      if (targetId) {
        onPushHistorySnapshot();
        onUpdateElements(
          elements.filter(
            (el) =>
              el.id !== targetId &&
              !(
                el.type === 'shape' &&
                ((el as ShapeElement).fromElementId === targetId ||
                  (el as ShapeElement).toElementId === targetId)
              )
          )
        );
        if (targetId === selectedElementId) {
          setSelectedElementId(null);
        }
      }
    },
    [selectedElementId, elements, onUpdateElements, onPushHistorySnapshot]
  );

  // Duplicate element helper
  const handleDuplicateElement = useCallback(
    (idToDup?: string) => {
      const targetId = idToDup || selectedElementId;
      const target = elements.find((el) => el.id === targetId);
      if (target) {
        onPushHistorySnapshot();
        const cloned: BoardElement = {
          ...target,
          id: generateId(target.type),
          x: target.x + 24,
          y: target.y + 24,
          zIndex: elements.length + 1,
        };
        onUpdateElements([...elements, cloned]);
        setSelectedElementId(cloned.id);
      }
    },
    [selectedElementId, elements, onUpdateElements, onPushHistorySnapshot]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.key.toLowerCase();

      // Tool switching
      if (key === 'v') onSelectTool('select');
      if (key === 'h') onSelectTool('hand');
      if (key === 'p') onSelectTool('pen');
      if (key === 'm') onSelectTool('marker');
      if (key === 's') onSelectTool('sticky');
      if (key === 't') onSelectTool('text');
      if (key === 'r') onSelectTool('rectangle');
      if (key === 'c') onSelectTool('circle');
      if (key === 'd') onSelectTool('diamond');
      if (key === 'e') onSelectTool('eraser');
      if (key === 'f') {
        onSelectTool('flowchart');
        setIsFlowchartPanelOpen(true);
      }

      // Delete selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        handleDeleteElement(selectedElementId);
      }

      // Duplicate selected
      if ((e.ctrlKey || e.metaKey) && key === 'd' && selectedElementId) {
        e.preventDefault();
        handleDuplicateElement(selectedElementId);
      }

      // Escape to cancel connecting / drawing
      if (e.key === 'Escape') {
        setSelectedElementId(null);
        setEditingShapeId(null);
        setConnectingFromNodeId(null);
        setConnectionDrag(null);
        setShapeStartPoint(null);
        setShapePreview(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, onSelectTool, handleDeleteElement, handleDuplicateElement]);

  // Smooth Wheel Zoom & Pan (Direct cursor-centered zoom)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    // If shift is held, do horizontal panning
    if (e.shiftKey) {
      onUpdateViewport({
        ...viewport,
        panX: viewport.panX - e.deltaY,
      });
      return;
    }

    // Direct wheel scrolling performs smooth zoom centered on mouse cursor
    const rect = containerRef.current?.getBoundingClientRect() || {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Zoom direction: scroll down (positive deltaY) = zoom out; scroll up (negative deltaY) = zoom in
    const zoomFactor = e.deltaY < 0 ? 1.09 : 1 / 1.09;
    const newZoom = Math.min(4.0, Math.max(0.15, Number((viewport.zoom * zoomFactor).toFixed(3))));

    if (newZoom === viewport.zoom) return;

    // Exact cursor-anchoring formula: Keep (mouseX, mouseY) fixed in canvas world coordinates
    const newPanX = mouseX - (mouseX - viewport.panX) * (newZoom / viewport.zoom);
    const newPanY = mouseY - (mouseY - viewport.panY) * (newZoom / viewport.zoom);

    onUpdateViewport({
      ...viewport,
      panX: newPanX,
      panY: newPanY,
      zoom: newZoom,
    });
  };

  // Mouse Down on canvas background
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || activeTool === 'hand') {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - viewport.panX, y: e.clientY - viewport.panY };
      return;
    }

    if (e.button !== 0) return;

    const worldPos = screenToWorld(e.clientX, e.clientY);

    // Freehand Drawing (Pen, Marker, Highlighter)
    if (['pen', 'marker', 'highlighter'].includes(activeTool)) {
      setIsDrawing(true);
      setCurrentStrokePoints([worldPos]);
      return;
    }

    // Manual Geometric Shapes drawing (only rectangle, circle, diamond, arrow, line, star)
    if (['rectangle', 'circle', 'diamond', 'arrow', 'line', 'star'].includes(activeTool)) {
      setShapeStartPoint(worldPos);
      return;
    }

    // Quick Insert: Sticky Note
    if (activeTool === 'sticky') {
      let chosenVariant: any = 'yellow';
      const c = activeColor.toLowerCase();
      if (c.includes('10b981') || c.includes('22c55e') || c.includes('green')) chosenVariant = 'green';
      else if (c.includes('3b82f6') || c.includes('0ea5e9') || c.includes('blue')) chosenVariant = 'blue';
      else if (c.includes('a855f7') || c.includes('8b5cf6') || c.includes('purple')) chosenVariant = 'purple';
      else if (c.includes('f97316') || c.includes('orange')) chosenVariant = 'orange';
      else if (c === '#09090b' || c === '#000000') chosenVariant = 'dark';
      else if (c === '#ffffff') chosenVariant = 'light';

      const newSticky: StickyElement = {
        id: generateId('sticky'),
        type: 'sticky',
        x: worldPos.x - 110,
        y: worldPos.y - 80,
        width: 220,
        height: 180,
        text: 'New thought / note...',
        variant: chosenVariant,
        fontSize: 14,
        zIndex: elements.length + 1,
      };
      onPushHistorySnapshot();
      onUpdateElements([...elements, newSticky]);
      setSelectedElementId(newSticky.id);
      onSelectTool('select');
      return;
    }

    // Quick Insert: Text Box
    if (activeTool === 'text') {
      const newText: TextElement = {
        id: generateId('text'),
        type: 'text',
        x: worldPos.x - 80,
        y: worldPos.y - 20,
        width: 240,
        height: 50,
        text: 'Type heading or note...',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'sans',
        align: 'left',
        color: activeColor || '#ffffff',
        zIndex: elements.length + 1,
      };
      onPushHistorySnapshot();
      onUpdateElements([...elements, newText]);
      setSelectedElementId(newText.id);
      onSelectTool('select');
      return;
    }

    // Quick Insert: Graph / KPI
    if (activeTool === 'graph') {
      const newGraph: GraphElement = {
        id: generateId('graph'),
        type: 'graph',
        chartType: 'bar',
        colorTheme: 'vibrant',
        customColor: activeColor !== '#ffffff' ? activeColor : '#3b82f6',
        x: worldPos.x - 180,
        y: worldPos.y - 120,
        width: 380,
        height: 250,
        title: 'Performance Overview',
        data: [
          { label: 'Jan', value: 35 },
          { label: 'Feb', value: 58 },
          { label: 'Mar', value: 84 },
          { label: 'Apr', value: 110 },
        ],
        metricSuffix: ' pts',
        zIndex: elements.length + 1,
      };
      onPushHistorySnapshot();
      onUpdateElements([...elements, newGraph]);
      setSelectedElementId(newGraph.id);
      onSelectTool('select');
      return;
    }

    // Eraser Tool
    if (activeTool === 'eraser') {
      const clicked = [...elements].reverse().find((el) => {
        return (
          worldPos.x >= el.x &&
          worldPos.x <= el.x + el.width &&
          worldPos.y >= el.y &&
          worldPos.y <= el.y + el.height
        );
      });
      if (clicked) {
        handleDeleteElement(clicked.id);
      }
      return;
    }

    // Direct background click: Deselect current element and cancel connecting mode
    setSelectedElementId(null);
    setEditingShapeId(null);
    setConnectingFromNodeId(null);
    setConnectionDrag(null);
  };

  // Mouse Move on canvas
  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 0 && (isPanning || isDrawing || shapeStartPoint || connectionDrag)) {
      handleMouseUp();
      return;
    }

    // Pan movement
    if (isPanning) {
      onUpdateViewport({
        ...viewport,
        panX: e.clientX - panStartRef.current.x,
        panY: e.clientY - panStartRef.current.y,
      });
      return;
    }

    const worldPos = screenToWorld(e.clientX, e.clientY);

    // Active Connection Dragging (Live Line Preview)
    if (connectionDrag) {
      setConnectionDrag((prev) => (prev ? { ...prev, currentX: worldPos.x, currentY: worldPos.y } : null));
      return;
    }

    // Freehand Drawing live tracking
    if (isDrawing && ['pen', 'marker', 'highlighter'].includes(activeTool)) {
      setCurrentStrokePoints((prev) => [...prev, worldPos]);
      return;
    }

    // Shape Creation Preview (only for actual shape tools)
    if (shapeStartPoint && ['rectangle', 'circle', 'diamond', 'arrow', 'line', 'star'].includes(activeTool)) {
      const minX = Math.min(shapeStartPoint.x, worldPos.x);
      const minY = Math.min(shapeStartPoint.y, worldPos.y);
      const width = Math.max(10, Math.abs(worldPos.x - shapeStartPoint.x));
      const height = Math.max(10, Math.abs(worldPos.y - shapeStartPoint.y));
      const flipX = worldPos.x < shapeStartPoint.x;
      const flipY = worldPos.y < shapeStartPoint.y;

      const preview: ShapeElement = {
        id: 'preview_shape',
        type: 'shape',
        shapeType: activeTool as any,
        x: minX,
        y: minY,
        width,
        height,
        fill: '#18181b',
        stroke: activeColor || '#ffffff',
        strokeWidth: 3,
        zIndex: 9999,
        flipX,
        flipY,
      };
      setShapePreview(preview);
      return;
    }
  };

  // Mouse Up
  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }

    // Finish Connection Dragging if released over another node
    if (connectionDrag) {
      if (hoveredNodeId && hoveredNodeId !== connectionDrag.fromId) {
        handleConnectTwoNodes(connectionDrag.fromId, hoveredNodeId, connectionDrag.fromPort);
      }
      setConnectionDrag(null);
      return;
    }

    // Commit Drawn Stroke
    if (isDrawing && currentStrokePoints.length > 1) {
      const isHighlighter = activeTool === 'highlighter';
      const isMarker = activeTool === 'marker';

      const minX = Math.min(...currentStrokePoints.map((p) => p.x));
      const minY = Math.min(...currentStrokePoints.map((p) => p.y));
      const maxX = Math.max(...currentStrokePoints.map((p) => p.x));
      const maxY = Math.max(...currentStrokePoints.map((p) => p.y));

      const strokeColor = activeColor || (isHighlighter ? '#fef08a' : '#ffffff');

      const newStroke: DrawingElement = {
        id: generateId('draw'),
        type: activeTool as any,
        points: currentStrokePoints,
        stroke: strokeColor,
        strokeWidth: isHighlighter ? 18 : isMarker ? 8 : 3,
        opacity: isHighlighter ? 0.35 : 1,
        x: minX,
        y: minY,
        width: Math.max(10, maxX - minX),
        height: Math.max(10, maxY - minY),
        zIndex: elements.length + 1,
      };

      onPushHistorySnapshot();
      onUpdateElements([...elements, newStroke]);
      setIsDrawing(false);
      setCurrentStrokePoints([]);
      return;
    }

    // Commit Created Shape (only if dragged with meaningful size >= 20px)
    if (shapePreview && shapeStartPoint) {
      if (shapePreview.width >= 20 && shapePreview.height >= 20) {
        const finalShape: ShapeElement = {
          ...shapePreview,
          id: generateId('shape'),
          zIndex: elements.length + 1,
        };
        onPushHistorySnapshot();
        onUpdateElements([...elements, finalShape]);
        setSelectedElementId(finalShape.id);
        onSelectTool('select');
      }
      setShapeStartPoint(null);
      setShapePreview(null);
    }
  };

  // Element Selection & Drag Initiation Handler
  const handleElementInteraction = (
    e: React.PointerEvent | React.MouseEvent,
    element: BoardElement
  ) => {
    // Clear any pending canvas shape creation
    setShapeStartPoint(null);
    setShapePreview(null);

    if (activeTool === 'eraser') {
      e.stopPropagation();
      handleDeleteElement(element.id);
      return;
    }

    // If connection mode or drag is active and clicked another node, connect them!
    if (connectingFromNodeId && connectingFromNodeId !== element.id) {
      e.stopPropagation();
      handleConnectTwoNodes(connectingFromNodeId, element.id);
      return;
    }

    // Only allow selection and dragging if using Select, Hand, or Flowchart tools
    if (activeTool !== 'select' && activeTool !== 'hand' && activeTool !== 'flowchart') {
      return;
    }

    e.stopPropagation();

    // Instant selection on click/down
    setSelectedElementId(element.id);

    // If left-click, start drag
    if (e.button === 0 && !element.locked) {
      dragInfoRef.current = {
        elementId: element.id,
        startScreenX: e.clientX,
        startScreenY: e.clientY,
        origX: element.x,
        origY: element.y,
        currentDx: 0,
        currentDy: 0,
      };
    }
  };

  const handleUpdateElementData = (id: string, partial: Partial<BoardElement>) => {
    onPushHistorySnapshot();
    onUpdateElements(
      elements.map((el) => (el.id === id ? ({ ...el, ...partial } as BoardElement) : el))
    );
  };

  const handleBringToFront = () => {
    if (!selectedElementId) return;
    const maxZ = Math.max(...elements.map((e) => e.zIndex || 0), 0);
    handleUpdateElementData(selectedElementId, { zIndex: maxZ + 1 });
  };

  const handleSendToBack = () => {
    if (!selectedElementId) return;
    const minZ = Math.min(...elements.map((e) => e.zIndex || 0), 0);
    handleUpdateElementData(selectedElementId, { zIndex: Math.max(0, minZ - 1) });
  };

  const selectedElement = elements.find((e) => e.id === selectedElementId);

  // Grid style
  const gridClass =
    'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] [background-size:24px_24px] bg-[radial-gradient(#27272a_1px,transparent_1px)]';

  // Dynamic Cursor
  let cursorClass = 'cursor-default';
  if (isPanning || activeTool === 'hand') cursorClass = 'cursor-grab active:cursor-grabbing';
  else if (['pen', 'marker', 'highlighter'].includes(activeTool)) cursorClass = 'cursor-crosshair';
  else if (['rectangle', 'circle', 'diamond', 'arrow', 'line', 'star'].includes(activeTool))
    cursorClass = 'cursor-crosshair';
  else if (activeTool === 'eraser') cursorClass = 'cursor-pointer';
  else if (connectionDrag) cursorClass = 'cursor-crosshair';

  // Compute dynamic positions for attached connectors in real time
  const resolvedElements = elements.map((el) => {
    if (
      el.type === 'shape' &&
      (el as ShapeElement).fromElementId &&
      (el as ShapeElement).toElementId
    ) {
      const conn = el as ShapeElement;
      const fromEl = elements.find((e) => e.id === conn.fromElementId);
      const toEl = elements.find((e) => e.id === conn.toElementId);
      if (fromEl && toEl) {
        const dxA = liveDrag?.elementId === fromEl.id ? liveDrag.dx : 0;
        const dyA = liveDrag?.elementId === fromEl.id ? liveDrag.dy : 0;
        const dxB = liveDrag?.elementId === toEl.id ? liveDrag.dx : 0;
        const dyB = liveDrag?.elementId === toEl.id ? liveDrag.dy : 0;

        const pA = conn.fromPort || 'bottom';
        const pB = conn.toPort || 'top';

        const posA = getNodePortPos(fromEl, pA, dxA, dyA);
        const posB = getNodePortPos(toEl, pB, dxB, dyB);

        let posX_A = posA.x;
        let posX_B = posB.x;
        let posY_A = posA.y;
        let posY_B = posB.y;

        if (Math.abs(posX_A - posX_B) <= 8) posX_B = posX_A;
        if (Math.abs(posY_A - posY_B) <= 8) posY_B = posY_A;

        const minX = Math.min(posX_A, posX_B);
        const minY = Math.min(posY_A, posY_B);
        const width = Math.abs(posX_B - posX_A);
        const height = Math.abs(posY_B - posY_A);
        const flipX = posX_B < posX_A;
        const flipY = posY_B < posY_A;

        return {
          ...conn,
          x: minX,
          y: minY,
          width,
          height,
          flipX,
          flipY,
        } as ShapeElement;
      }
    }
    return el;
  });

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            ref={containerRef as any}
            className={`relative w-full h-[calc(100vh-3.5rem)] overflow-hidden bg-background ${gridClass} ${cursorClass} select-none touch-none`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();

              // Check if dropping flowchart item from FlowchartPanel
              const rawItem = e.dataTransfer.getData('application/json');
              if (rawItem) {
                try {
                  const item = JSON.parse(rawItem);
                  if (item && item.type) {
                    const worldPos = screenToWorld(e.clientX, e.clientY);
                    const strokeColor =
                      activeColor !== '#ffffff' ? activeColor : item.defaultStroke || '#ffffff';

                    // When dropping Start node, automatically spawn with attached animated connector!
                    if (
                      item.type === 'flowchart-terminator' &&
                      (item.id === 'term_start' || item.defaultText?.toLowerCase().includes('start'))
                    ) {
                      const startX = Math.round(worldPos.x - item.defaultWidth / 2);
                      const startY = Math.round(worldPos.y - item.defaultHeight / 2);
                      const startShape: ShapeElement = {
                        id: generateId('shape'),
                        type: 'shape',
                        shapeType: item.type,
                        x: startX,
                        y: startY,
                        width: item.defaultWidth,
                        height: item.defaultHeight,
                        fill: item.defaultFill || '#1e1b4b',
                        stroke: strokeColor,
                        strokeWidth: 2,
                        text: 'Start',
                        zIndex: elements.length + 1,
                      };

                      const arrow: ShapeElement = {
                        id: generateId('shape'),
                        type: 'shape',
                        shapeType: 'connector-straight',
                        x: startX + item.defaultWidth / 2 - 2,
                        y: startY + item.defaultHeight,
                        width: 4,
                        height: 65,
                        fill: 'transparent',
                        stroke: '#818cf8',
                        strokeWidth: 3,
                        animated: true,
                        fromElementId: startShape.id,
                        fromPort: 'bottom',
                        zIndex: elements.length + 2,
                      };

                      onPushHistorySnapshot();
                      onUpdateElements([...elements, startShape, arrow]);
                      setSelectedElementId(startShape.id);
                      return;
                    }

                    const newShape: ShapeElement = {
                      id: generateId('shape'),
                      type: 'shape',
                      shapeType: item.type,
                      x: Math.round(worldPos.x - item.defaultWidth / 2),
                      y: Math.round(worldPos.y - item.defaultHeight / 2),
                      width: item.defaultWidth,
                      height: item.defaultHeight,
                      fill: item.defaultFill || '#18181b',
                      stroke: strokeColor,
                      strokeWidth: 2,
                      strokeDash: item.strokeDash,
                      text: item.defaultText,
                      label: item.defaultLabel,
                      zIndex: elements.length + 1,
                    };
                    onPushHistorySnapshot();
                    onUpdateElements([...elements, newShape]);
                    setSelectedElementId(newShape.id);
                    return;
                  }
                } catch (err) {
                  console.error('Error parsing drop payload:', err);
                }
              }

              // Image Drop (Disabled in Flowchart mode)
              if (boardType !== 'flowchart' && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                if (file.type.startsWith('image/') && onDropImage) {
                  const worldPos = screenToWorld(e.clientX, e.clientY);
                  onDropImage(file, worldPos.x, worldPos.y);
                }
              }
            }}
          >
            {/* Zoomable & Pannable Canvas World Container */}
            <div
              style={{
                transform: `translate(${viewport.panX}px, ${viewport.panY}px) scale(${viewport.zoom})`,
                transformOrigin: '0 0',
                width: '10000px',
                height: '10000px',
                position: 'absolute',
                top: 0,
                left: 0,
                willChange: isPanning || liveDrag ? 'transform' : 'auto',
              }}
            >
              {/* Unified Interactive Elements Layer */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Active Previews (Drawing / Shapes / Connection Line Drag) */}
                <svg className="w-full h-full absolute inset-0 pointer-events-none z-[9999] overflow-visible">
                  {/* Drawing Preview */}
                  {isDrawing && currentStrokePoints.length > 1 && (
                    <PenPathRenderer
                      element={{
                        id: 'active_stroke',
                        type: activeTool as any,
                        points: currentStrokePoints,
                        stroke:
                          activeColor || (activeTool === 'highlighter' ? '#fef08a' : '#ffffff'),
                        strokeWidth: activeTool === 'highlighter' ? 18 : activeTool === 'marker' ? 8 : 3,
                        opacity: activeTool === 'highlighter' ? 0.35 : 1,
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 0,
                        zIndex: 9999,
                      }}
                    />
                  )}

                  {/* Geometric Shape Draw Preview */}
                  {shapePreview && <ShapeRenderer element={shapePreview} />}

                  {/* Active Connection Line Dragging Preview */}
                  {connectionDrag && (
                    <g>
                      <path
                        d={`M ${connectionDrag.startX},${connectionDrag.startY} C ${(connectionDrag.startX + connectionDrag.currentX) / 2},${connectionDrag.startY} ${(connectionDrag.startX + connectionDrag.currentX) / 2},${connectionDrag.currentY} ${connectionDrag.currentX},${connectionDrag.currentY}`}
                        fill="none"
                        stroke="#818cf8"
                        strokeWidth={3}
                        strokeDasharray="6 4"
                        className="animate-flow-line"
                      />
                      <circle
                        cx={connectionDrag.currentX}
                        cy={connectionDrag.currentY}
                        r={6}
                        fill="#818cf8"
                        className="animate-pulse"
                      />
                    </g>
                  )}
                </svg>

                {/* Render Committed Elements (Sorted by zIndex) */}
                {resolvedElements
                  .slice()
                  .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                  .map((el) => {
                    const isSelected = selectedElementId === el.id;
                    const isDraggingThis = liveDrag?.elementId === el.id;
                    const dx = isDraggingThis ? liveDrag?.dx || 0 : 0;
                    const dy = isDraggingThis ? liveDrag?.dy || 0 : 0;

                    const isSvg =
                      el.type === 'shape' ||
                      el.type === 'pen' ||
                      el.type === 'marker' ||
                      el.type === 'highlighter';

                    const isResizingThis = liveResize?.elementId === el.id;
                    const dw = isResizingThis ? liveResize?.dw || 0 : 0;
                    const dh = isResizingThis ? liveResize?.dh || 0 : 0;

                    const currentWidth = Math.max(20, el.width + dw);
                    const currentHeight = Math.max(20, el.height + dh);

                    const isDrawingElement =
                      el.type === 'pen' || el.type === 'marker' || el.type === 'highlighter';

                    const isShapeNode =
                      el.type === 'shape' && !(el as ShapeElement).shapeType.startsWith('connector');

                    const isHovered = hoveredNodeId === el.id;

                    // Shared wrapper styles
                    const wrapperStyle: React.CSSProperties = {
                      position: 'absolute',
                      left: `${el.x}px`,
                      top: `${el.y}px`,
                      width: `${currentWidth}px`,
                      height: `${currentHeight}px`,
                      transform: `translate3d(${dx}px, ${dy}px, 0)`,
                      zIndex: el.zIndex || 20,
                      willChange: isDraggingThis || isResizingThis ? 'width, height, transform' : 'auto',
                    };

                    return (
                      <div
                        key={el.id}
                        className={`select-none ${
                          isDrawingElement ? 'pointer-events-none' : 'pointer-events-auto cursor-move'
                        }`}
                        style={wrapperStyle}
                        onPointerEnter={() => {
                          if (isShapeNode) setHoveredNodeId(el.id);
                        }}
                        onPointerLeave={() => {
                          if (isShapeNode) setHoveredNodeId(null);
                        }}
                        onPointerDown={(e) => handleElementInteraction(e, el)}
                        onMouseDown={(e) => handleElementInteraction(e, el)}
                        onDoubleClick={(e) => {
                          if (el.type === 'shape') {
                            e.stopPropagation();
                            setEditingShapeId(el.id);
                            setShapeEditingText(
                              (el as ShapeElement).text || (el as ShapeElement).label || ''
                            );
                          }
                        }}
                      >
                        {/* Floating Action Bar on Selection */}
                        {isSelected && (
                          <div
                            style={{
                              position: 'absolute',
                              left: 0,
                              top: '-38px',
                              zIndex: 9999,
                            }}
                            className="flex items-center gap-1 bg-zinc-950 border border-zinc-700 rounded-lg px-1.5 py-1 shadow-2xl backdrop-blur pointer-events-auto"
                            onMouseDown={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteElement(el.id);
                              }}
                              title="Delete Element (Del / Backspace)"
                              className="p-1 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400" strokeWidth={3} />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateElement(el.id);
                              }}
                              title="Duplicate (Ctrl+D)"
                              className="p-1 rounded hover:bg-zinc-800 text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-sky-400" strokeWidth={3} />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateElementData(el.id, { locked: !el.locked });
                              }}
                              title={el.locked ? 'Unlock' : 'Lock'}
                              className="p-1 rounded hover:bg-amber-950/60 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                            >
                              {el.locked ? (
                                <Lock className="w-3.5 h-3.5 text-amber-400" strokeWidth={3} />
                              ) : (
                                <Unlock className="w-3.5 h-3.5 text-amber-400/70" strokeWidth={3} />
                              )}
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBringToFront();
                              }}
                              title="Bring to Front"
                              className="p-1 rounded hover:bg-indigo-950/60 text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                            >
                              <BringToFront className="w-3.5 h-3.5 text-indigo-400" strokeWidth={3} />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendToBack();
                              }}
                              title="Send to Back"
                              className="p-1 rounded hover:bg-indigo-950/60 text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                            >
                              <SendToBack className="w-3.5 h-3.5 text-indigo-400" strokeWidth={3} />
                            </button>
                          </div>
                        )}

                        {/* SVG Elements */}
                        {isSvg && (
                          <svg
                            width="100%"
                            height="100%"
                            viewBox={`${el.x} ${el.y} ${currentWidth} ${currentHeight}`}
                            style={{ overflow: 'visible' }}
                            className="pointer-events-none"
                          >
                            <g className={isDrawingElement ? 'pointer-events-none' : 'pointer-events-auto'}>
                              {el.type === 'shape' ? (
                                <ShapeRenderer
                                  element={
                                    {
                                      ...el,
                                      width: currentWidth,
                                      height: currentHeight,
                                    } as ShapeElement
                                  }
                                  isSelected={isSelected}
                                />
                              ) : (
                                <PenPathRenderer
                                  element={
                                    {
                                      ...el,
                                      width: currentWidth,
                                      height: currentHeight,
                                    } as DrawingElement
                                  }
                                  isSelected={isSelected}
                                />
                              )}
                            </g>
                          </svg>
                        )}

                        {/* Inline Text Input on Shape Double-Click */}
                        {editingShapeId === el.id && el.type === 'shape' && (
                          <div
                            className="absolute inset-0 flex items-center justify-center p-2 z-[10001] pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              autoFocus
                              value={shapeEditingText}
                              onChange={(e) => setShapeEditingText(e.target.value)}
                              onBlur={() => {
                                handleUpdateElementData(el.id, {
                                  [(el as ShapeElement).shapeType.startsWith('connector') ? 'label' : 'text']: shapeEditingText,
                                });
                                setEditingShapeId(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleUpdateElementData(el.id, {
                                    [(el as ShapeElement).shapeType.startsWith('connector') ? 'label' : 'text']: shapeEditingText,
                                  });
                                  setEditingShapeId(null);
                                } else if (e.key === 'Escape') {
                                  setEditingShapeId(null);
                                }
                              }}
                              className="w-full bg-zinc-950/95 text-white font-bold text-center text-xs border-2 border-violet-500 rounded-md px-1.5 py-1 focus:outline-none shadow-2xl"
                            />
                          </div>
                        )}

                        {/* HTML Elements */}
                        {!isSvg && el.type === 'sticky' && (
                          <StickyNoteRenderer
                            element={el as StickyElement}
                            isSelected={isSelected}
                            onUpdateText={(text: string) => handleUpdateElementData(el.id, { text })}
                            onDelete={() => handleDeleteElement(el.id)}
                          />
                        )}

                        {!isSvg && el.type === 'text' && (
                          <TextRenderer
                            element={el as TextElement}
                            isSelected={isSelected}
                            onUpdateText={(text: string) => handleUpdateElementData(el.id, { text })}
                          />
                        )}

                        {!isSvg && el.type === 'image' && (
                          <ImageRenderer
                            element={el as ImageElement}
                            isSelected={isSelected}
                            onToggleMonochrome={() =>
                              handleUpdateElementData(el.id, {
                                isMonochrome: !(el as ImageElement).isMonochrome,
                              })
                            }
                          />
                        )}

                        {!isSvg && el.type === 'graph' && (
                          <GraphRenderer
                            element={el as GraphElement}
                            isSelected={isSelected}
                            onDelete={() => handleDeleteElement(el.id)}
                            onOpenDataEditor={() => setEditingGraphId(el.id)}
                          />
                        )}

                        {/* Resize Corner Handle */}
                        {isSelected && !el.locked && (
                          <div
                            className="absolute -right-1.5 -bottom-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-500 rounded-full cursor-nwse-resize z-[10000] shadow-sm pointer-events-auto"
                            onMouseDown={(e) => e.stopPropagation()}
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              resizeInfoRef.current = {
                                elementId: el.id,
                                startScreenX: e.clientX,
                                startScreenY: e.clientY,
                                origWidth: el.width,
                                origHeight: el.height,
                                currentDw: 0,
                                currentDh: 0,
                              };
                            }}
                          />
                        )}

                        {/* Connection Anchor Ports on All 4 Sides of Every Shape */}
                        {isShapeNode && (isSelected || isHovered || connectionDrag !== null) && (
                          <>
                            {/* Top Port */}
                            <button
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                const pos = getNodePortPos(el, 'top');
                                setConnectionDrag({
                                  fromId: el.id,
                                  fromPort: 'top',
                                  startX: pos.x,
                                  startY: pos.y,
                                  currentX: pos.x,
                                  currentY: pos.y,
                                });
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (connectingFromNodeId && connectingFromNodeId !== el.id) {
                                  handleConnectTwoNodes(connectingFromNodeId, el.id, undefined, 'top');
                                } else {
                                  setConnectingFromNodeId(el.id);
                                }
                              }}
                              title="Top Port: Drag or Click to connect"
                              style={{
                                position: 'absolute',
                                top: '-10px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 10003,
                              }}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-crosshair pointer-events-auto transition-all shadow-md ${
                                connectingFromNodeId === el.id || connectionDrag?.fromId === el.id
                                  ? 'bg-violet-500 border-white ring-4 ring-violet-400/60 animate-anchor-pulse scale-125'
                                  : 'bg-zinc-950 border-violet-400 hover:bg-violet-600 hover:scale-130 text-violet-300 hover:text-white'
                              }`}
                            >
                              <span className="text-[10px] font-black leading-none">+</span>
                            </button>

                            {/* Right Port */}
                            <button
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                const pos = getNodePortPos(el, 'right');
                                setConnectionDrag({
                                  fromId: el.id,
                                  fromPort: 'right',
                                  startX: pos.x,
                                  startY: pos.y,
                                  currentX: pos.x,
                                  currentY: pos.y,
                                });
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (connectingFromNodeId && connectingFromNodeId !== el.id) {
                                  handleConnectTwoNodes(connectingFromNodeId, el.id, undefined, 'right');
                                } else {
                                  setConnectingFromNodeId(el.id);
                                }
                              }}
                              title="Right Port: Drag or Click to connect"
                              style={{
                                position: 'absolute',
                                right: '-10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 10003,
                              }}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-crosshair pointer-events-auto transition-all shadow-md ${
                                connectingFromNodeId === el.id || connectionDrag?.fromId === el.id
                                  ? 'bg-violet-500 border-white ring-4 ring-violet-400/60 animate-anchor-pulse scale-125'
                                  : 'bg-zinc-950 border-violet-400 hover:bg-violet-600 hover:scale-130 text-violet-300 hover:text-white'
                              }`}
                            >
                              <span className="text-[10px] font-black leading-none">+</span>
                            </button>

                            {/* Bottom Port */}
                            <button
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                const pos = getNodePortPos(el, 'bottom');
                                setConnectionDrag({
                                  fromId: el.id,
                                  fromPort: 'bottom',
                                  startX: pos.x,
                                  startY: pos.y,
                                  currentX: pos.x,
                                  currentY: pos.y,
                                });
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (connectingFromNodeId && connectingFromNodeId !== el.id) {
                                  handleConnectTwoNodes(connectingFromNodeId, el.id, undefined, 'bottom');
                                } else {
                                  setConnectingFromNodeId(el.id);
                                }
                              }}
                              title="Bottom Port: Drag or Click to connect"
                              style={{
                                position: 'absolute',
                                bottom: '-10px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 10003,
                              }}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-crosshair pointer-events-auto transition-all shadow-md ${
                                connectingFromNodeId === el.id || connectionDrag?.fromId === el.id
                                  ? 'bg-violet-500 border-white ring-4 ring-violet-400/60 animate-anchor-pulse scale-125'
                                  : 'bg-zinc-950 border-violet-400 hover:bg-violet-600 hover:scale-130 text-violet-300 hover:text-white'
                              }`}
                            >
                              <span className="text-[10px] font-black leading-none">+</span>
                            </button>

                            {/* Left Port */}
                            <button
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                const pos = getNodePortPos(el, 'left');
                                setConnectionDrag({
                                  fromId: el.id,
                                  fromPort: 'left',
                                  startX: pos.x,
                                  startY: pos.y,
                                  currentX: pos.x,
                                  currentY: pos.y,
                                });
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (connectingFromNodeId && connectingFromNodeId !== el.id) {
                                  handleConnectTwoNodes(connectingFromNodeId, el.id, undefined, 'left');
                                } else {
                                  setConnectingFromNodeId(el.id);
                                }
                              }}
                              title="Left Port: Drag or Click to connect"
                              style={{
                                position: 'absolute',
                                left: '-10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 10003,
                              }}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-crosshair pointer-events-auto transition-all shadow-md ${
                                connectingFromNodeId === el.id || connectionDrag?.fromId === el.id
                                  ? 'bg-violet-500 border-white ring-4 ring-violet-400/60 animate-anchor-pulse scale-125'
                                  : 'bg-zinc-950 border-violet-400 hover:bg-violet-600 hover:scale-130 text-violet-300 hover:text-white'
                              }`}
                            >
                              <span className="text-[10px] font-black leading-none">+</span>
                            </button>
                          </>
                        )}

                        {/* Quick Flow Extender Toolbar on Selection */}
                        {isSelected && isShapeNode && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '-36px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              zIndex: 10002,
                            }}
                            className="flex items-center gap-1 bg-zinc-950 border border-violet-500/80 rounded-full px-2 py-0.5 shadow-2xl backdrop-blur pointer-events-auto whitespace-nowrap text-[10px] font-bold animate-in-fade"
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <span className="text-violet-400 font-mono hidden sm:inline">Connect:</span>
                            <button
                              onClick={() =>
                                handleQuickAddNextNode(
                                  el as ShapeElement,
                                  'right',
                                  'flowchart-process',
                                  'Process Step'
                                )
                              }
                              title="Add and Connect Process Step to Right"
                              className="px-1.5 py-0.5 rounded-full bg-violet-900/70 hover:bg-violet-600 text-white flex items-center gap-0.5 cursor-pointer transition-colors shadow-sm"
                            >
                              <span>+ Step &rarr;</span>
                            </button>
                            <button
                              onClick={() =>
                                handleQuickAddNextNode(
                                  el as ShapeElement,
                                  'down',
                                  'flowchart-process',
                                  'Process Step'
                                )
                              }
                              title="Add and Connect Process Step Below"
                              className="px-1.5 py-0.5 rounded-full bg-violet-900/70 hover:bg-violet-600 text-white flex items-center gap-0.5 cursor-pointer transition-colors shadow-sm"
                            >
                              <span>+ Step &darr;</span>
                            </button>
                            <button
                              onClick={() =>
                                handleQuickAddNextNode(
                                  el as ShapeElement,
                                  'right',
                                  'flowchart-decision',
                                  'Condition?'
                                )
                              }
                              title="Add and Connect Decision Diamond"
                              className="px-1.5 py-0.5 rounded-full bg-indigo-900/70 hover:bg-indigo-600 text-white flex items-center gap-0.5 cursor-pointer transition-colors shadow-sm"
                            >
                              <span>+ Decision 🔀</span>
                            </button>
                            <button
                              onClick={() =>
                                handleQuickAddNextNode(
                                  el as ShapeElement,
                                  'right',
                                  'flowchart-database',
                                  'Database'
                                )
                              }
                              title="Add and Connect Database Storage"
                              className="px-1.5 py-0.5 rounded-full bg-fuchsia-950/80 hover:bg-fuchsia-700 text-fuchsia-200 hover:text-white flex items-center gap-0.5 cursor-pointer transition-colors shadow-sm border border-fuchsia-800/60"
                            >
                              <span>+ DB 🗄️</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Left Flowchart Toggle Button if panel is closed */}
            {!isFlowchartPanelOpen && (
              <button
                onClick={() => {
                  setIsFlowchartPanelOpen(true);
                  onSelectTool('flowchart');
                }}
                className="fixed left-4 top-20 z-40 px-3 py-2 rounded-xl bg-zinc-950/95 border border-violet-500/60 shadow-xl backdrop-blur flex items-center gap-2 text-xs font-bold text-violet-300 hover:bg-violet-950/60 hover:text-white hover:scale-105 transition-all cursor-pointer"
                title="Open Flowchart Shapes Palette (F)"
              >
                <Workflow className="w-4 h-4 text-violet-400" />
                <span>Flowchart Shapes</span>
              </button>
            )}

            {/* Flowchart Shapes Left-Side Popup Panel */}
            <FlowchartPanel
              isOpen={isFlowchartPanelOpen}
              onClose={() => setIsFlowchartPanelOpen(false)}
              onAddElement={handleAddFlowchartElement}
              onAddMultipleElements={handleAddMultipleFlowchartElements}
              selectedElements={selectedElement ? [selectedElement] : []}
              viewportCenter={getViewportCenter()}
              activeColor={activeColor}
            />

            {/* Properties & Customization Side Panel */}
            {selectedElement && (
              <PropertiesPanel
                selectedElement={selectedElement}
                onUpdateElement={(partial: Partial<BoardElement>) =>
                  handleUpdateElementData(selectedElement.id, partial)
                }
                onDeleteElement={() => handleDeleteElement(selectedElement.id)}
                onDuplicateElement={() => handleDuplicateElement(selectedElement.id)}
                onBringToFront={handleBringToFront}
                onSendToBack={handleSendToBack}
                onClosePanel={() => setSelectedElementId(null)}
              />
            )}
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent className="w-56 bg-zinc-950/95 border-zinc-800 text-zinc-300">
          <ContextMenuItem onClick={() => onSelectTool('select')} className="cursor-pointer hover:bg-zinc-800">
            <MousePointer2 className="w-4 h-4 mr-2" /> Select Tool
            <ContextMenuShortcut>V</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onSelectTool('hand')} className="cursor-pointer hover:bg-zinc-800">
            <Hand className="w-4 h-4 mr-2" /> Pan Canvas
            <ContextMenuShortcut>H</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              onSelectTool('flowchart');
              setIsFlowchartPanelOpen(true);
            }}
            className="cursor-pointer hover:bg-zinc-800 text-violet-400"
          >
            <Workflow className="w-4 h-4 mr-2" /> Flowchart Palette
            <ContextMenuShortcut>F</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuSeparator className="bg-zinc-800" />

          <ContextMenuItem
            onClick={() => {
              if (selectedElementId) {
                handleBringToFront();
              }
            }}
            disabled={!selectedElementId}
            className="cursor-pointer hover:bg-zinc-800"
          >
            <BringToFront className="w-4 h-4 mr-2 text-indigo-400" /> Bring to Front
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              if (selectedElementId) {
                handleSendToBack();
              }
            }}
            disabled={!selectedElementId}
            className="cursor-pointer hover:bg-zinc-800"
          >
            <SendToBack className="w-4 h-4 mr-2 text-indigo-400" /> Send to Back
          </ContextMenuItem>

          <ContextMenuSeparator className="bg-zinc-800" />

          <ContextMenuItem
            onClick={() => {
              if (selectedElementId) {
                handleDuplicateElement(selectedElementId);
              }
            }}
            disabled={!selectedElementId}
            className="cursor-pointer hover:bg-zinc-800"
          >
            <Copy className="w-4 h-4 mr-2 text-sky-400" /> Duplicate
            <ContextMenuShortcut>Ctrl+D</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuItem
            onClick={() => {
              if (selectedElementId) {
                handleDeleteElement(selectedElementId);
              }
            }}
            disabled={!selectedElementId}
            className="cursor-pointer hover:bg-red-900/40 text-red-400"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete
            <ContextMenuShortcut>Del</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Chart Config Modal */}
      <ChartConfigModal
        isOpen={!!editingGraphId}
        onClose={() => setEditingGraphId(null)}
        element={(elements.find((e) => e.id === editingGraphId) as GraphElement) || null}
        onSave={(updated) => {
          if (editingGraphId) {
            handleUpdateElementData(editingGraphId, updated);
          }
        }}
      />
    </>
  );
};
