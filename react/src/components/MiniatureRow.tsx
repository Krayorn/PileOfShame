import React from 'react';
import type { Miniature, MiniatureStatus } from '../types/miniature';
import { ImageUploadDialog } from './ImageUploadDialog';

interface MiniatureRowProps {
    miniature: Miniature;
    isEditing: boolean;
    editForm: Partial<Miniature>;
    moveMode: boolean;
    isSelected: boolean;
    onEdit: (miniature: Miniature) => void;
    onDelete: (miniatureId: string) => void;
    onUpdate: (miniatureId: string) => void;
    onCancelEdit: () => void;
    onSelectionToggle: (miniatureId: string) => void;
    onEditFormChange: (form: Partial<Miniature>) => void;
    onImageUpload: (miniatureId: string, files: FileList) => void;
}

export function MiniatureRow({
    miniature,
    isEditing,
    editForm,
    moveMode,
    isSelected,
    onEdit,
    onDelete,
    onUpdate,
    onCancelEdit,
    onSelectionToggle,
    onEditFormChange,
    onImageUpload
}: MiniatureRowProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onUpdate(miniature.id);
        }
    };

    const getStatusColor = (status: MiniatureStatus) => {
        switch (status) {
            case 'Painted':
                return 'bg-terminal-bg border border-terminal-painted text-terminal-painted';
            case 'Built':
                return 'bg-terminal-bg border border-terminal-built text-terminal-built';
            default:
                return 'bg-terminal-bg border border-terminal-gray text-terminal-gray';
        }
    };

    return (
        <tr className="hover:bg-terminal-bg transition-colors">
            {moveMode && (
                <td className="px-6 py-4 whitespace-nowrap">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectionToggle(miniature.id)}
                        className="h-4 w-4 text-terminal-fg focus:ring-terminal-border border-terminal-border rounded bg-terminal-bg"
                    />
                </td>
            )}
            <td className="px-6 py-4 whitespace-nowrap text-terminal-fg font-semibold">
                {isEditing ? (
                    <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => onEditFormChange({ ...editForm, name: e.target.value })}
                        onKeyDown={handleKeyDown}
                        className="w-full px-2 py-1 border border-terminal-border bg-terminal-bg text-terminal-fg rounded-sm focus:outline-none focus:ring-2 focus:ring-terminal-border focus:shadow-terminal"
                    />
                ) : (
                    miniature.name
                )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-terminal-fg">
                {isEditing ? (
                    <input
                        type="number"
                        min="1"
                        value={editForm.count || ''}
                        onChange={(e) => onEditFormChange({ ...editForm, count: parseInt(e.target.value) })}
                        onKeyDown={handleKeyDown}
                        className="w-full px-2 py-1 border border-terminal-border bg-terminal-bg text-terminal-fg rounded-sm focus:outline-none focus:ring-2 focus:ring-terminal-border focus:shadow-terminal"
                    />
                ) : (
                    miniature.count
                )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {isEditing ? (
                    <select
                        value={editForm.status}
                        onChange={(e) => onEditFormChange({ ...editForm, status: e.target.value as MiniatureStatus })}
                        onKeyDown={handleKeyDown}
                        className="w-full px-2 py-1 border border-terminal-border bg-terminal-bg text-terminal-fg rounded-sm focus:outline-none focus:ring-2 focus:ring-terminal-border focus:shadow-terminal"
                    >
                        <option value="Gray">Gray</option>
                        <option value="Built">Built</option>
                        <option value="Painted">Painted</option>
                    </select>
                ) : (
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold uppercase tracking-wider rounded-sm ${getStatusColor(miniature.status)}`}>
                        {miniature.status.charAt(0).toUpperCase() + miniature.status.slice(1)}
                    </span>
                )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {isEditing ? (
                    <div className="space-x-2">
                        <button
                            onClick={() => onUpdate(miniature.id)}
                            className="text-terminal-fg hover:text-terminal-accent transition-colors font-semibold uppercase tracking-wider text-sm"
                        >
                            Save
                        </button>
                        <button
                            onClick={onCancelEdit}
                            className="text-terminal-fgDim hover:text-terminal-fg transition-colors font-semibold uppercase tracking-wider text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <div className="space-x-2">
                        <ImageUploadDialog 
                            miniatureId={miniature.id} 
                            onUpload={onImageUpload}
                        />
                        <button
                            onClick={() => onEdit(miniature)}
                            className="text-terminal-fg hover:text-terminal-accent transition-colors font-semibold uppercase tracking-wider text-sm"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => onDelete(miniature.id)}
                            className="text-terminal-destructive hover:text-terminal-destructive/80 transition-colors font-semibold uppercase tracking-wider text-sm"
                        >
                            Delete
                        </button>
                    </div>
                )}
            </td>
        </tr>
    );
} 