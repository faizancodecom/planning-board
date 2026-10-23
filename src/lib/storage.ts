import { PlnFileContent, PlnFileMetadata } from '@/types/board';
import { createNewPlnContent, serializePlnFile, parsePlnFile, downloadPlnFile } from '@/lib/pln-file';
import { TEMPLATES } from '@/lib/templates';

const PROJECTS_INDEX_KEY = 'planboard_projects_index_v1';
const PROJECT_PREFIX = 'planboard_project_content_';

export function getAllProjectMetadata(): PlnFileMetadata[] {
  try {
    const raw = localStorage.getItem(PROJECTS_INDEX_KEY);
    if (!raw) {
      // Clean slate by default - no forced demo data
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (e) {
    console.error('Failed to read projects index from storage:', e);
    return [];
  }
}

export function saveAllProjectMetadata(list: PlnFileMetadata[]): void {
  try {
    localStorage.setItem(PROJECTS_INDEX_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save project metadata index:', e);
  }
}

export function getProjectContent(id: string): PlnFileContent | null {
  try {
    const raw = localStorage.getItem(`${PROJECT_PREFIX}${id}`);
    if (!raw) return null;
    const result = parsePlnFile(raw);
    if (result.valid && result.content) {
      return result.content;
    }
    return null;
  } catch (e) {
    console.error(`Failed to load project ${id}:`, e);
    return null;
  }
}

export function saveProject(content: PlnFileContent): void {
  try {
    const updatedMetadata: PlnFileMetadata = {
      ...content.metadata,
      updatedAt: new Date().toISOString(),
    };
    const updatedContent: PlnFileContent = {
      ...content,
      metadata: updatedMetadata,
    };

    // Save content
    localStorage.setItem(`${PROJECT_PREFIX}${content.metadata.id}`, serializePlnFile(updatedContent));

    // Update metadata index
    const all = getAllProjectMetadata();
    const existingIndex = all.findIndex((p) => p.id === content.metadata.id);
    if (existingIndex >= 0) {
      all[existingIndex] = updatedMetadata;
    } else {
      all.unshift(updatedMetadata);
    }
    saveAllProjectMetadata(all);
  } catch (e) {
    console.error('Failed to save project:', e);
  }
}

export function deleteProject(id: string): void {
  try {
    localStorage.removeItem(`${PROJECT_PREFIX}${id}`);
    const all = getAllProjectMetadata().filter((p) => p.id !== id);
    saveAllProjectMetadata(all);
  } catch (e) {
    console.error('Failed to delete project:', e);
  }
}

export function duplicateProject(id: string): PlnFileContent | null {
  const original = getProjectContent(id);
  if (!original) return null;

  const newId = `pln_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const duplicated: PlnFileContent = {
    ...original,
    metadata: {
      ...original.metadata,
      id: newId,
      title: `${original.metadata.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
    },
    elements: original.elements.map((el) => ({
      ...el,
      id: `elem_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      x: el.x + 20,
      y: el.y + 20,
    })),
  };

  saveProject(duplicated);
  return duplicated;
}

export function renameProject(id: string, newTitle: string): void {
  const content = getProjectContent(id);
  if (!content) return;
  content.metadata.title = newTitle;
  saveProject(content);
}

export function toggleFavorite(id: string): void {
  const all = getAllProjectMetadata();
  const target = all.find((p) => p.id === id);
  if (target) {
    target.isFavorite = !target.isFavorite;
    saveAllProjectMetadata(all);

    const content = getProjectContent(id);
    if (content) {
      content.metadata.isFavorite = target.isFavorite;
      localStorage.setItem(`${PROJECT_PREFIX}${id}`, serializePlnFile(content));
    }
  }
}

export function clearAllDemoData(): void {
  try {
    const all = getAllProjectMetadata();
    all.forEach((p) => {
      localStorage.removeItem(`${PROJECT_PREFIX}${p.id}`);
    });
    localStorage.removeItem(PROJECTS_INDEX_KEY);
  } catch (e) {
    console.error('Failed to clear storage:', e);
  }
}
