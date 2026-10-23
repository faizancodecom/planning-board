import React, { useState, useRef, useEffect } from 'react';
import { StickyElement } from '@/types/board';
import { Pin, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StickyNoteRendererProps {
  element: StickyElement;
  isSelected?: boolean;
  onUpdateText: (newText: string) => void;
  onTogglePin?: () => void;
  onDelete?: () => void;
}

export const StickyNoteRenderer: React.FC<StickyNoteRendererProps> = ({
  element,
  isSelected,
  onUpdateText,
  onTogglePin,
  onDelete,
}) => {
  const { x, y, width, height, text, variant, fontSize, pinned, customBgColor, customTextColor } =
    element;
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCurrentText(text);
  }, [text]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    onUpdateText(currentText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      onUpdateText(currentText);
    }
  };

  const variantStyles: Record<string, string> = {
    yellow: 'bg-amber-200 border-2 border-amber-400 text-amber-950 shadow-lg shadow-black/30',
    green: 'bg-emerald-200 border-2 border-emerald-400 text-emerald-950 shadow-lg shadow-black/30',
    blue: 'bg-sky-200 border-2 border-sky-400 text-sky-950 shadow-lg shadow-black/30',
    pink: 'bg-pink-200 border-2 border-pink-400 text-pink-950 shadow-lg shadow-black/30',
    purple: 'bg-purple-200 border-2 border-purple-400 text-purple-950 shadow-lg shadow-black/30',
    orange: 'bg-orange-200 border-2 border-orange-400 text-orange-950 shadow-lg shadow-black/30',
    dark: 'bg-zinc-900 border-2 border-zinc-700 text-zinc-100 shadow-lg shadow-black/50',
    light: 'bg-zinc-100 border-2 border-zinc-300 text-zinc-950 shadow-lg shadow-black/40',
    slate: 'bg-zinc-800 border-2 border-zinc-600 text-zinc-200 shadow-md shadow-black/40',
    outline: 'bg-transparent border-2 border-dashed border-zinc-400 text-zinc-100 backdrop-blur-sm',
  };

  const customStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    fontSize: `${fontSize || 14}px`,
    ...(customBgColor ? { backgroundColor: customBgColor } : {}),
    ...(customTextColor ? { color: customTextColor } : {}),
  };

  return (
    <div
      style={customStyle}
      className={cn(
        'group select-none rounded-none p-4 transition-all flex flex-col relative',
        !customBgColor && (variantStyles[variant] || variantStyles.yellow),
        isSelected && 'ring-2 ring-white ring-offset-2 ring-offset-black',
        pinned && 'border-t-4 border-t-foreground'
      )}
      onDoubleClick={() => setIsEditing(true)}
    >
      {/* Note Content */}
      <div className="flex-1 overflow-hidden relative w-full h-full">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full h-full bg-transparent resize-none border-none outline-none text-inherit font-sans font-medium leading-relaxed p-0 overflow-y-auto"
            placeholder="Type note or bullet points..."
          />
        ) : (
          <div className="w-full h-full whitespace-pre-wrap font-sans font-medium leading-relaxed overflow-y-auto pr-1">
            {currentText || <span className="opacity-40 italic">Double-click to write...</span>}
          </div>
        )}
      </div>
      
      {/* Subtle corner fold design mark */}
      <div className="absolute bottom-1 right-1 opacity-40 pointer-events-none">
        <svg width="12" height="12" viewBox="0 0 10 10" fill="currentColor">
          <polygon points="0,10 10,0 10,10" />
        </svg>
      </div>
    </div>
  );
};
