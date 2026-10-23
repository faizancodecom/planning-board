import React, { useState, useRef, useEffect } from 'react';
import { TextElement } from '@/types/board';
import { cn } from '@/lib/utils';

interface TextRendererProps {
  element: TextElement;
  isSelected?: boolean;
  onUpdateText: (newText: string) => void;
}

export const TextRenderer: React.FC<TextRendererProps> = ({
  element,
  isSelected,
  onUpdateText,
}) => {
  const { x, y, width, height, text, fontSize, fontWeight, fontFamily, align, color } = element;
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCurrentText(text);
  }, [text]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
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

  const fontClasses = fontFamily === 'mono' ? 'font-mono' : 'font-sans';
  const weightClasses =
    fontWeight === 'black'
      ? 'font-black tracking-tight'
      : fontWeight === 'bold'
      ? 'font-bold'
      : 'font-normal';

  const alignClasses =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100%',
        fontSize: `${fontSize || 16}px`,
        color: color || '#ffffff',
      }}
      className={cn(
        'select-none cursor-text p-1 transition-all rounded',
        fontClasses,
        weightClasses,
        alignClasses,
        isSelected && 'ring-1 ring-white/60 ring-dashed bg-white/5'
      )}
      onDoubleClick={() => setIsEditing(true)}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{ fontSize: `${fontSize || 16}px` }}
          className={cn(
            'w-full min-h-[40px] bg-black/80 text-white border border-white/40 rounded p-1 outline-none resize-none',
            fontClasses,
            weightClasses,
            alignClasses
          )}
        />
      ) : (
        <div className="whitespace-pre-wrap leading-tight break-words">
          {currentText || <span className="opacity-40 italic">Click to edit text...</span>}
        </div>
      )}
    </div>
  );
};
