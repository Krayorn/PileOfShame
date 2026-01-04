import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from './ui/dialog';

interface ImageUploadDialogProps {
  miniatureId: string;
  onUpload: (miniatureId: string, files: FileList) => void;
}

export function ImageUploadDialog({ miniatureId, onUpload }: ImageUploadDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(files);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles) {
      setIsUploading(true);
      try {
        await onUpload(miniatureId, selectedFiles);
        setSelectedFiles(null);
        setIsOpen(false);
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleCancel = () => {
    setSelectedFiles(null);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Upload className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Images</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Select the images you want to upload for this miniature.
        </DialogDescription>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="image-upload" className="text-sm font-semibold uppercase tracking-wider text-terminal-fg">
              Select Images
            </label>
            <input
              id="image-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border border-terminal-border bg-terminal-bg text-terminal-fg rounded-sm focus:outline-none focus:ring-2 focus:ring-terminal-border focus:shadow-terminal file:mr-4 file:py-1 file:px-2 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:uppercase file:tracking-wider file:bg-terminal-bgLight file:text-terminal-fg file:border file:border-terminal-border file:cursor-pointer hover:file:bg-terminal-bg"
            />
          </div>
          {selectedFiles && (
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-terminal-fg">Selected Files:</label>
              <div className="max-h-32 overflow-y-auto space-y-1 border border-terminal-border rounded-sm p-2 bg-terminal-bg">
                {Array.from(selectedFiles).map((file, index) => (
                  <div key={index} className="flex items-center justify-between text-sm text-terminal-fgDim">
                    <span className="font-semibold">{file.name}</span>
                    <span className="text-xs">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFiles || selectedFiles.length === 0 || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
