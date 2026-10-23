import { BoardElement, ViewportState } from '@/types/board';
import { jsPDF } from 'jspdf';

export interface ExportOptions {
  format: 'png' | 'pdf' | 'svg' | 'json';
  scale?: number; // 1, 2, 4
  includeBackground?: boolean;
  theme?: 'dark' | 'light';
  filename?: string;
}

export function calculateElementsBounds(elements: BoardElement[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  if (elements.length === 0) {
    return { minX: 0, minY: 0, maxX: 1200, maxY: 800, width: 1200, height: 800 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  elements.forEach((el) => {
    if (el.type === 'pen' || el.type === 'marker' || el.type === 'highlighter') {
      el.points.forEach((p) => {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      });
    } else if (el.type === 'connector') {
      minX = Math.min(minX, el.startX, el.endX);
      minY = Math.min(minY, el.startY, el.endY);
      maxX = Math.max(maxX, el.startX, el.endX);
      maxY = Math.max(maxY, el.startY, el.endY);
    } else {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + el.width);
      maxY = Math.max(maxY, el.y + el.height);
    }
  });

  const padding = 60;
  const width = Math.max(400, (maxX - minX) + padding * 2);
  const height = Math.max(300, (maxY - minY) + padding * 2);

  return {
    minX: minX - padding,
    minY: minY - padding,
    maxX: maxX + padding,
    maxY: maxY + padding,
    width,
    height,
  };
}

export async function exportBoardToPNG(
  canvasContainerElement: HTMLElement,
  filename: string = 'plan-board.png',
  scale: number = 2
): Promise<void> {
  const html2canvasModule = (await import('html2canvas')).default;
  
  const canvas = await html2canvasModule(canvasContainerElement, {
    scale,
    useCORS: true,
    logging: false,
    backgroundColor: '#0a0a0c',
  });

  const image = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = image;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function exportBoardToPDF(
  canvasContainerElement: HTMLElement,
  filename: string = 'plan-board.pdf'
): Promise<void> {
  const html2canvasModule = (await import('html2canvas')).default;
  
  const canvas = await html2canvasModule(canvasContainerElement, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#0a0a0c',
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  // Calculate PDF dimensions (landscape or portrait based on canvas aspect ratio)
  const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait';
  const pdf = new jsPDF({
    orientation,
    unit: 'px',
    format: [imgWidth, imgHeight],
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
  pdf.save(filename);
}
