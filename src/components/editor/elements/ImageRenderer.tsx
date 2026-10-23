import React from 'react';
import { ImageElement } from '@/types/board';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface ImageRendererProps {
  element: ImageElement;
  isSelected?: boolean;
  onToggleMonochrome?: () => void;
}

export const ImageRenderer: React.FC<ImageRendererProps> = ({
  element,
  isSelected,
  onToggleMonochrome,
}) => {
  const { x, y, width, height, src, alt, isMonochrome } = element;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      className={cn(
        'group select-none rounded-xl overflow-hidden border-2 border-zinc-700 bg-zinc-950 transition-shadow shadow-md touch-none',
        isSelected && 'ring-2 ring-white ring-offset-2 ring-offset-black'
      )}
    >
      <img
        src={src}
        alt={alt || 'Plan image asset'}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        className={cn(
          'w-full h-full object-cover transition-all duration-200 pointer-events-none select-none',
          isMonochrome && 'grayscale contrast-125 brightness-95'
        )}
      />

      {/* Monochrome filter toggle badge on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleMonochrome?.();
        }}
        title="Toggle Black & White / Grayscale filter"
        className="absolute top-2 right-2 p-1.5 rounded-md bg-black/70 hover:bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm border border-white/20 flex items-center gap-1 cursor-pointer"
      >
        <Sparkles className="w-3 h-3" strokeWidth={2.5} />
        <span>{isMonochrome ? 'B&W On' : 'Grayscale'}</span>
      </button>
    </div>
  );
};
