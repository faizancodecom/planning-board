import React, { useState, useRef } from 'react';
import { PlnFileContent } from '@/types/board';
import { readPlnFileFromBlob } from '@/lib/pln-file';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileCode2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface ImportPlnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (content: PlnFileContent) => void;
}

export const ImportPlnDialog: React.FC<ImportPlnDialogProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<PlnFileContent | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setErrorMessage(null);
    setParsedPreview(null);

    try {
      const content = await readPlnFileFromBlob(file);
      setParsedPreview(content);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid .pln file format.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (parsedPreview) {
      onImportSuccess(parsedPreview);
      setParsedPreview(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Upload className="w-5 h-5 text-white" strokeWidth={2.5} />
            Import .pln File
          </DialogTitle>
          <DialogDescription>
            Restore or share a complete planning board with all vector paths, notes, and charts intact.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Dropzone Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px] ${
              isDragging
                ? 'border-white bg-zinc-900 scale-102'
                : parsedPreview
                ? 'border-emerald-500/80 bg-zinc-950'
                : 'border-zinc-700 bg-zinc-950/60 hover:bg-zinc-900 hover:border-zinc-500'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pln,.json"
              className="hidden"
            />

            {parsedPreview ? (
              <div className="space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" strokeWidth={2.5} />
                <div>
                  <h4 className="font-bold text-sm text-white">{parsedPreview.metadata.title}</h4>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    {parsedPreview.elements.length} elements • Version {parsedPreview.version}
                  </p>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full inline-block">
                  ✓ Valid .pln format ready to load
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center mx-auto text-zinc-300">
                  <FileCode2 className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    Drag and drop your <span className="font-mono text-zinc-300">.pln</span> file here
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1">or click to browse from your computer</p>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-lg border border-red-900/60 bg-red-950/30 text-red-300 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" strokeWidth={2.5} />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="monochrome"
            onClick={handleConfirmImport}
            disabled={!parsedPreview}
            className="gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-black" strokeWidth={2.5} />
            <span>Load Workspace</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
