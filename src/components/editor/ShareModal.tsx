import React, { useState } from 'react';
import { PlnFileContent } from '@/types/board';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2, Copy, Check, QrCode, Globe, Shield } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  planContent: PlnFileContent;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, planContent }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const shareUrl = `${window.location.origin}/#plan=${planContent.metadata.id}`;
  const embedCode = `<iframe src="${shareUrl}" width="800" height="600" frameborder="0"></iframe>`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Share2 className="w-5 h-5 text-white" strokeWidth={2.5} />
            Share Plan
          </DialogTitle>
          <DialogDescription>
            Share <span className="font-bold text-foreground">"{planContent.metadata.title}"</span> with colleagues, classmates, or teams.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Share Link */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" strokeWidth={2.5} />
              Direct Workspace Link
            </label>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="font-mono text-xs text-muted-foreground select-all" />
              <Button variant="outline" size="sm" onClick={handleCopyLink} className="min-w-[85px]">
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-white" strokeWidth={2.5} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" strokeWidth={2.5} />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Embed Code */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5" strokeWidth={2.5} />
              Embed Snippet (iFrame)
            </label>
            <div className="flex gap-2">
              <Input value={embedCode} readOnly className="font-mono text-xs text-muted-foreground select-all" />
              <Button variant="outline" size="sm" onClick={handleCopyEmbed} className="min-w-[85px]">
                {copiedEmbed ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-white" strokeWidth={2.5} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" strokeWidth={2.5} />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950 flex items-start gap-2.5 text-xs text-zinc-400">
            <Shield className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" strokeWidth={2.5} />
            <div>
              <span className="font-bold text-zinc-200">100% Offline & Private:</span>
              <p className="mt-0.5 leading-relaxed">
                Plans are saved locally on your device. To share full files across devices without a network backend, use the <strong>.pln export</strong> file format.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="monochrome" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
