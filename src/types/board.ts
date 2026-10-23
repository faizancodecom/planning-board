export type ToolType =
  | 'select'
  | 'hand'
  | 'pen'
  | 'marker'
  | 'highlighter'
  | 'eraser'
  | 'rectangle'
  | 'circle'
  | 'diamond'
  | 'arrow'
  | 'line'
  | 'star'
  | 'sticky'
  | 'text'
  | 'image'
  | 'graph'
  | 'connector'
  | 'flowchart';

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'metric';
export type ChartColorTheme = 'vibrant' | 'monochrome' | 'emerald' | 'sunset' | 'ocean' | 'purple' | 'custom';

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  color?: string;
}

export type StickyVariant =
  | 'yellow'
  | 'green'
  | 'blue'
  | 'pink'
  | 'purple'
  | 'orange'
  | 'dark'
  | 'light'
  | 'slate'
  | 'outline';

export interface BaseElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex: number;
  locked?: boolean;
}

export interface DrawingElement extends BaseElement {
  type: 'pen' | 'marker' | 'highlighter';
  points: Point[];
  stroke: string;
  strokeWidth: number;
  opacity: number;
}

export type ShapeType =
  | 'rectangle'
  | 'circle'
  | 'diamond'
  | 'arrow'
  | 'line'
  | 'star'
  | 'flowchart'
  | 'flowchart-process'
  | 'flowchart-decision'
  | 'flowchart-terminator'
  | 'flowchart-data'
  | 'flowchart-database'
  | 'flowchart-document'
  | 'flowchart-subprocess'
  | 'flowchart-preparation'
  | 'flowchart-connector'
  | 'flowchart-cloud'
  | 'flowchart-delay'
  | 'connector-straight'
  | 'connector-elbow'
  | 'connector-curved'
  | 'connector-bidirectional'
  | 'connector-dashed';

export type PortDirection = 'top' | 'right' | 'bottom' | 'left';

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: ShapeType;
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeDash?: 'solid' | 'dashed' | 'dotted';
  flipX?: boolean;
  flipY?: boolean;
  text?: string;
  textColor?: string;
  fontSize?: number;
  label?: string;
  animated?: boolean;
  fromElementId?: string;
  fromPort?: PortDirection;
  toElementId?: string;
  toPort?: PortDirection;
}

export interface StickyElement extends BaseElement {
  type: 'sticky';
  text: string;
  variant: StickyVariant;
  customBgColor?: string;
  customTextColor?: string;
  fontSize: number;
  pinned?: boolean;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | 'black';
  fontFamily: 'sans' | 'mono';
  align: 'left' | 'center' | 'right';
  color: string;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  alt?: string;
  isMonochrome?: boolean;
  aspectRatio?: number;
}

export interface GraphElement extends BaseElement {
  type: 'graph';
  chartType: ChartType;
  title: string;
  data: ChartDataPoint[];
  colorTheme?: ChartColorTheme;
  customColor?: string;
  metricPrefix?: string;
  metricSuffix?: string;
  metricChange?: string;
  description?: string;
}

export interface ConnectorElement extends BaseElement {
  type: 'connector';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  arrowEnd?: boolean;
  label?: string;
  stroke: string;
  strokeWidth: number;
  strokeDash?: 'solid' | 'dashed';
}

export type BoardElement =
  | DrawingElement
  | ShapeElement
  | StickyElement
  | TextElement
  | ImageElement
  | GraphElement
  | ConnectorElement;

export type GridType = 'dots' | 'lines' | 'none';
export type ThemeMode = 'dark' | 'light';

export interface ViewportState {
  zoom: number;
  panX: number;
  panY: number;
  gridType: GridType;
  theme: ThemeMode;
}

export type BoardType = 'planning' | 'flowchart';

export interface PlnFileMetadata {
  id: string;
  title: string;
  description?: string;
  author?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  version: string;
  isFavorite?: boolean;
  category?: 'business' | 'academic' | 'strategy' | 'roadmap' | 'mindmap' | 'flowchart' | 'other';
  boardType?: BoardType;
}

export interface PlnFileContent {
  format: 'PLAN_BOARD_SPEC';
  version: string;
  metadata: PlnFileMetadata;
  viewport: ViewportState;
  elements: BoardElement[];
}
