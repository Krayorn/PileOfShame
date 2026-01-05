import React, { useState } from 'react';
import type { MiniatureStatus } from '../types/miniature';
import { TerminalPanel } from './ui/terminal-panel';

interface AddMiniatureFormProps {
    onSubmit: (miniature: { name: string; count: number; status: MiniatureStatus }) => void;
    onCancel: () => void;
}

export function AddMiniatureForm({ onSubmit, onCancel }: AddMiniatureFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        count: 1,
        status: 'Gray' as MiniatureStatus
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        // Reset form
        setFormData({
            name: '',
            count: formData.count,
            status: formData.status
        });
    };

    const getStatusLabel = (status: MiniatureStatus): string => {
        switch (status) {
            case 'Gray': return 'GRAY [UNPAINTED]';
            case 'Built': return 'BUILT [ASSEMBLED]';
            case 'Painted': return 'PAINTED [COMPLETE]';
            default: return status;
        }
    };

    return (
        <TerminalPanel className="mb-4 animate-in slide-in-from-top-2 duration-300">
            <div className="p-6">
                <div className="mb-4">
                    <div className="text-terminal-fgDim text-xs uppercase tracking-widest font-semibold mb-1">
                        DATA ENTRY PROTOCOL
                    </div>
                    <h2 className="text-lg font-bold uppercase tracking-wider text-terminal-fg">
                        REGISTER NEW MINIATURE
                    </h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-terminal-fg mb-2">
                            DESIGNATION:
                        </label>
                        <div className="flex items-center gap-2">
                            <span className="text-terminal-fg font-mono">{`>`}</span>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    name: e.target.value
                                })}
                                className="flex-1 px-3 py-2 bg-terminal-bg border-l-4 border-terminal-border text-terminal-fg focus:outline-none focus:border-terminal-accent transition-all font-mono"
                                placeholder="ENTER_DESIGNATION"
                                autoFocus
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-terminal-fg mb-2">
                            QUANTITY:
                        </label>
                        <div className="flex items-center gap-2">
                            <span className="text-terminal-fg font-mono">{`>`}</span>
                            <input
                                type="number"
                                min="1"
                                required
                                value={formData.count}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    count: parseInt(e.target.value) || 1
                                })}
                                className="flex-1 px-3 py-2 bg-terminal-bg border-l-4 border-terminal-border text-terminal-fg focus:outline-none focus:border-terminal-accent transition-all font-mono"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-terminal-fg mb-2">
                            STATUS:
                        </label>
                        <div className="flex items-center gap-2">
                            <span className="text-terminal-fg font-mono">{`>`}</span>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    status: e.target.value as MiniatureStatus
                                })}
                                className="flex-1 px-3 py-2 bg-terminal-bg border-l-4 border-terminal-border text-terminal-fg focus:outline-none focus:border-terminal-accent transition-all font-mono uppercase"
                            >
                                <option value="Gray">GRAY [UNPAINTED]</option>
                                <option value="Built">BUILT [ASSEMBLED]</option>
                                <option value="Painted">PAINTED [COMPLETE]</option>
                            </select>
                        </div>
                        <div className="mt-2 text-terminal-fgDim text-xs uppercase tracking-wider font-semibold">
                            CURRENT: {getStatusLabel(formData.status)}
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