import React, { useState } from 'react';
import { TerminalPanel } from './ui/terminal-panel';

interface AddFolderFormProps {
    onSubmit: (folderName: string) => void;
    onCancel: () => void;
}

export function AddFolderForm({ onSubmit, onCancel }: AddFolderFormProps) {
    const [folderName, setFolderName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(folderName);
        setFolderName('');
    };

    return (
        <TerminalPanel className="mb-4 animate-in slide-in-from-top-2 duration-300">
            <div className="p-6">
                <div className="mb-4">
                    <div className="text-terminal-fgDim text-xs uppercase tracking-widest font-semibold mb-1">
                        DATA ENTRY PROTOCOL
                    </div>
                    <h3 className="text-lg font-bold uppercase tracking-wider text-terminal-fg">
                        CREATE NEW FOLDER
                    </h3>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-terminal-fg mb-2">
                            FOLDER NAME:
                        </label>
                        <div className="flex items-center gap-2">
                            <span className="text-terminal-fg font-mono">{`>`}</span>
                            <input
                                type="text"
                                required
                                value={folderName}
                                onChange={(e) => setFolderName(e.target.value)}
                                className="flex-1 px-3 py-2 bg-terminal-bg border-l-4 border-terminal-border text-terminal-fg focus:outline-none focus:border-terminal-accent transition-all font-mono"
                                placeholder="ENTER_FOLDER_NAME"
                                autoFocus
                            />
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-terminal-borderDim">
                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                className="px-4 py-2 border-l-4 border-terminal-border bg-terminal-bg text-terminal-fg font-bold uppercase tracking-widest hover:border-terminal-accent hover:bg-terminal-bgLight transition-all text-sm"
                            >
                                → EXECUTE
                            </button>
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 border-l-4 border-terminal-borderDim bg-terminal-bg text-terminal-fgDim font-bold uppercase tracking-widest hover:border-terminal-fg hover:text-terminal-fg transition-all text-sm"
                            >
                                → ABORT
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </TerminalPanel>
    );
} 