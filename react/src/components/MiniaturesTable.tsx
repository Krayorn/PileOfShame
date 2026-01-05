import React from 'react';
import type { Miniature } from '../types/miniature';
import { MiniatureRow } from './MiniatureRow';

interface MiniaturesTableProps {
    miniatures: Miniature[];
    moveMode: boolean;
    editingId: string | null;
    editForm: Partial<Miniature>;
    selectedMiniatures: string[];
    onEdit: (miniature: Miniature) => void;
    onDelete: (miniatureId: string) => void;
    onUpdate: (miniatureId: string) => void;
    onCancelEdit: () => void;
    onSelectionToggle: (miniatureId: string) => void;
    onEditFormChange: (form: Partial<Miniature>) => void;
    onImageUpload: (miniatureId: string, files: FileList) => void;
}

export function MiniaturesTable({
    miniatures,
    moveMode,
    editingId,
    editForm,
    selectedMiniatures,
    onEdit,
    onDelete,
    onUpdate,
    onCancelEdit,
    onSelectionToggle,
    onEditFormChange,
    onImageUpload
}: MiniaturesTableProps) {
    if (miniatures.length === 0) {
        return (
            <div className="bg-terminal-bgLight border border-terminal-border rounded-sm overflow-hidden">
                <div className="p-6 text-center text-terminal-fgDim uppercase tracking-wider">
                    No miniatures in this folder yet. Add some using the button above!
                </div>
            </div>
        );
    }

    return (
        <div className="bg-terminal-bgLight border border-terminal-border rounded-sm overflow-hidden">
            <table className="min-w-full divide-y divide-terminal-border">
                <thead className="bg-terminal-bg">
                    <tr>
                        {moveMode && (
                            <th className="px-6 py-3 text-left text-xs font-bold text-terminal-fg uppercase tracking-wider border-b border-terminal-border">
                                Select
                            </th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-bold text-terminal-fg uppercase tracking-wider border-b border-terminal-border">
                            Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-terminal-fg uppercase tracking-wider border-b border-terminal-border">
                            Count
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-terminal-fg uppercase tracking-wider border-b border-terminal-border">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-terminal-fg uppercase tracking-wider border-b border-terminal-border">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-terminal-bgLight divide-y divide-terminal-border">
                    {miniatures.map((miniature) => (
                        <MiniatureRow
                            key={miniature.id}
                            miniature={miniature}
                            isEditing={editingId === miniature.id}
                            editForm={editForm}
                            moveMode={moveMode}
                            isSelected={selectedMiniatures.includes(miniature.id)}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onUpdate={onUpdate}
                            onCancelEdit={onCancelEdit}
                            onSelectionToggle={onSelectionToggle}
                            onEditFormChange={onEditFormChange}
                            onImageUpload={onImageUpload}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
} 