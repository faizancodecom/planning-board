import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, Info } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info' | 'warning';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-zinc-950 border-2 border-zinc-800 rounded-2xl p-6 shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                variant === 'danger'
                  ? 'bg-red-950/60 border-red-800/60 text-red-400'
                  : variant === 'warning'
                  ? 'bg-amber-950/60 border-amber-800/60 text-amber-400'
                  : 'bg-blue-950/60 border-blue-800/60 text-sky-400'
              }`}
            >
              {variant === 'danger' ? (
                <Trash2 className="w-5 h-5" strokeWidth={2.5} />
              ) : variant === 'warning' ? (
                <AlertTriangle className="w-5 h-5" strokeWidth={2.5} />
              ) : (
                <Info className="w-5 h-5" strokeWidth={2.5} />
              )}
            </div>

            <div>
              <DialogTitle className="text-base font-bold text-white leading-snug">
                {title}
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0 pt-4 mt-2 border-t border-zinc-800/80">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200"
          >
            {cancelText}
          </Button>

          <Button
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`font-bold gap-1.5 shadow-md ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                : variant === 'warning'
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
            }`}
          >
            <span>{confirmText}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
