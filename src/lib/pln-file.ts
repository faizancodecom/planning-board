import { PlnFileContent, PlnFileMetadata, ViewportState, BoardElement } from '@/types/board';

const CURRENT_PLN_VERSION = '1.0.0';

export function createNewPlnContent(
  title: string = 'Untitled Plan',
  metadataOverrides: Partial<PlnFileMetadata> = {},
  initialElements: BoardElement[] = []
): PlnFileContent {
  const now = new Date().toISOString();
  const id = metadataOverrides.id || `pln_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

  return {
    format: 'PLAN_BOARD_SPEC',
    version: CURRENT_PLN_VERSION,
    metadata: {
      id,
      title,
      description: '',
      author: 'PlanBoard User',
      tags: ['Strategy', 'Planning'],
      createdAt: now,
      updatedAt: now,
      version: CURRENT_PLN_VERSION,
      category: 'business',
      boardType: metadataOverrides.boardType || 'planning',
      ...metadataOverrides,
    },
    viewport: {
      zoom: 1.0,
      panX: 0,
      panY: 0,
      gridType: 'dots',
      theme: 'dark',
    },
    elements: initialElements,
  };
}

export function serializePlnFile(content: PlnFileContent): string {
  const updatedContent: PlnFileContent = {
    ...content,
    metadata: {
      ...content.metadata,
      updatedAt: new Date().toISOString(),
    },
  };
  return JSON.stringify(updatedContent, null, 2);
}

export function validatePlnFile(data: unknown): { valid: boolean; error?: string; content?: PlnFileContent } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'File content is not a valid JSON object.' };
  }

  const obj = data as Record<string, any>;

  if (obj.format !== 'PLAN_BOARD_SPEC') {
    return { valid: false, error: 'Invalid file format: Missing PLAN_BOARD_SPEC identifier.' };
  }

  if (!obj.metadata || typeof obj.metadata !== 'object' || !obj.metadata.id || !obj.metadata.title) {
    return { valid: false, error: 'Invalid PLN file: Missing required metadata (id, title).' };
  }

  if (!Array.isArray(obj.elements)) {
    return { valid: false, error: 'Invalid PLN file: Missing elements array.' };
  }

  const sanitizedContent: PlnFileContent = {
    format: 'PLAN_BOARD_SPEC',
    version: obj.version || CURRENT_PLN_VERSION,
    metadata: {
      id: String(obj.metadata.id),
      title: String(obj.metadata.title),
      description: obj.metadata.description ? String(obj.metadata.description) : '',
      author: obj.metadata.author ? String(obj.metadata.author) : 'Anonymous',
      tags: Array.isArray(obj.metadata.tags) ? obj.metadata.tags.map(String) : [],
      createdAt: obj.metadata.createdAt || new Date().toISOString(),
      updatedAt: obj.metadata.updatedAt || new Date().toISOString(),
      thumbnail: obj.metadata.thumbnail,
      version: obj.metadata.version || CURRENT_PLN_VERSION,
      category: obj.metadata.category || 'business',
      boardType: obj.metadata.boardType === 'flowchart' || obj.metadata.category === 'flowchart' ? 'flowchart' : 'planning',
      isFavorite: Boolean(obj.metadata.isFavorite),
    },
    viewport: {
      zoom: typeof obj.viewport?.zoom === 'number' ? obj.viewport.zoom : 1.0,
      panX: typeof obj.viewport?.panX === 'number' ? obj.viewport.panX : 0,
      panY: typeof obj.viewport?.panY === 'number' ? obj.viewport.panY : 0,
      gridType: obj.viewport?.gridType || 'dots',
      theme: obj.viewport?.theme || 'dark',
    },
    elements: obj.elements,
  };

  return { valid: true, content: sanitizedContent };
}

export function parsePlnFile(jsonString: string): { valid: boolean; error?: string; content?: PlnFileContent } {
  try {
    const parsed = JSON.parse(jsonString);
    return validatePlnFile(parsed);
  } catch (err: any) {
    return { valid: false, error: `JSON Parse Error: ${err.message}` };
  }
}

export function downloadPlnFile(content: PlnFileContent, customFilename?: string): void {
  const jsonStr = serializePlnFile(content);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const rawTitle = content.metadata.title.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const filename = customFilename || `${rawTitle || 'plan'}.pln`;
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function readPlnFileFromBlob(file: File): Promise<PlnFileContent> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = parsePlnFile(content);
      if (result.valid && result.content) {
        resolve(result.content);
      } else {
        reject(new Error(result.error || 'Failed to read .pln file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file from disk.'));
    reader.readAsText(file);
  });
}
