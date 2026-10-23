import React, { useState } from 'react';
import { PlnFileContent } from '@/types/board';
import { downloadPlnFile, serializePlnFile } from '@/lib/pln-file';
import { exportBoardToPNG, exportBoardToPDF } from '@/lib/export-canvas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileCode2, Image, FileText, Code2, Download, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  planContent: PlnFileContent;
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  planContent,
  canvasContainerRef,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'pln' | 'png' | 'pdf' | 'json'>('pln');
  const [pngScale, setPngScale] = useState<number>(2);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedSuccess, setExportedSuccess] = useState(false);

  const cleanFilename = (ext: string) => {
    const raw = planContent.metadata.title.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    return `${raw || 'plan'}.${ext}`;
  };

  const handleExecuteExport = async () => {
    setIsExporting(true);
    try {
      if (selectedFormat === 'pln') {
        downloadPlnFile(planContent, cleanFilename('pln'));
      } else if (selectedFormat === 'png' && canvasContainerRef.current) {
        await exportBoardToPNG(canvasContainerRef.current, cleanFilename('png'), pngScale);
      } else if (selectedFormat === 'pdf' && canvasContainerRef.current) {
        await exportBoardToPDF(canvasContainerRef.current, cleanFilename('pdf'));
      } else if (selectedFormat === 'json') {
        const jsonStr = serializePlnFile(planContent);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = cleanFilename('json');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      setExportedSuccess(true);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ffffff', '#a1a1aa', '#52525b', '#27272a'],
      });

      setTimeout(() => {
        setExportedSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const options = [
    {
      id: 'pln',
      title: '.pln Native File',
      desc: 'PlanBoard standard format. Preserves complete vector data, editable graphs, and layers for instant re-opening.',
      badge: 'Recommended',
      icon: <FileCode2 className="w-5 h-5" strokeWidth={2.5} />,
    },
    {
      id: 'png',
      title: 'PNG Raster Image',
      desc: 'High-resolution image snapshot with crisp edges for presentations, docs, and social sharing.',
      icon: <Image className="w-5 h-5" strokeWidth={2.5} />,
    },
    {
      id: 'pdf',
      title: 'PDF Document',
      desc: 'Print-ready vector document format formatted for standard reports and handouts.',
      icon: <FileText className="w-5 h-5" strokeWidth={2.5} />,
    },
    {
      id: 'json',
      title: 'JSON Raw Data',
      desc: 'Machine-readable schema for automated backups and programmatic ingestion.',
      icon: <Code2 className="w-5 h-5" strokeWidth={2.5} />,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Download className="w-5 h-5 text-white" strokeWidth={2.5} />
            Export Plan
          </DialogTitle>
          <DialogDescription>
            Choose your preferred output format for <span className="font-bold text-foreground">"{planContent.metadata.title}"</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {options.map((opt) => (
            <div
              key={opt.id}
              onClick={() => setSelectedFormat(opt.id as any)}
              className={`p-3.5 rounded-lg border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                selectedFormat === opt.id
                  ? 'border-white bg-zinc-900 shadow-solid'
                  : 'border-border bg-card/60 hover:border-zinc-700'
              }`}
            >
              <div
                className={`p-2 rounded-md ${
                  selectedFormat === opt.id ? 'bg-white text-black' : 'bg-muted text-foreground'
                }`}
              >
                {opt.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground">{opt.title}</span>
                  {opt.badge && (
                    <span className="text-[10px] uppercase tracking-wider font-extrabold bg-white text-black px-1.5 py-0.2 rounded font-mono">
                      {opt.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{opt.desc}</p>
              </div>
            </div>
          ))}

          {/* PNG DPI Selector */}
          {selectedFormat === 'png' && (
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Image Resolution:</span>
              <div className="flex gap-1.5">
                {[
                  { scale: 1, label: '1x (Standard)' },
                  { scale: 2, label: '2x (Retina)' },
                  { scale: 4, label: '4x (Ultra HD)' },
                ].map((item) => (
                  <button
                    key={item.scale}
                    onClick={() => setPngScale(item.scale)}
                    className={`px-2.5 py-1 text-xs font-mono font-bold rounded border transition-colors cursor-pointer ${
                      pngScale === item.scale
                        ? 'bg-white text-black border-white'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            variant="monochrome"
            onClick={handleExecuteExport}
            disabled={isExporting}
            className="gap-2 min-w-[130px]"
          >
            {exportedSuccess ? (
              <>
                <Check className="w-4 h-4 text-black" strokeWidth={2.5} />
                <span>Exported!</span>
              </>
            ) : isExporting ? (
              <span>Rendering...</span>
            ) : (
              <>
                <Download className="w-4 h-4" strokeWidth={2.5} />
                <span>Export {selectedFormat.toUpperCase()}</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
