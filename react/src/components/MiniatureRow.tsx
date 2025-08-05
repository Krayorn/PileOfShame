import React from 'react';
import type { Miniature, MiniatureStatus } from '../types/miniature';

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
    onEditFormChange
}: MiniatureRowProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onUpdate(miniature.id);
        }
    };

    const getStatusColor = (status: MiniatureStatus) => {
        switch (status) {
            case 'Painted':
                return 'bg-green-100 text-green-800';
            case 'Built':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <tr>
            {moveMode && (
                <td className="px-6 py-4 whitespace-nowrap">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectionToggle(miniature.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                </td>
            )}
            <td className="px-6 py-4 whitespace-nowrap">
                {isEditing ? (
                    <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => onEditFormChange({ ...editForm, name: e.target.value })}
                        onKeyDown={handleKeyDown}
                        className="w-full px-2 py-1 border rounded"
                    />
                ) : (
                    miniature.name
                )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {isEditing ? (
                    <input
                        type="number"
                        min="1"
                        value={editForm.count || ''}
                        onChange={(e) => onEditFormChange({ ...editForm, count: parseInt(e.target.value) })}
                        onKeyDown={handleKeyDown}
                        className="w-full px-2 py-1 border rounded"
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
                        className="w-full px-2 py-1 border rounded"
                    >
                        <option value="Gray">Gray</option>
                        <option value="Built">Built</option>
                        <option value="Painted">Painted</option>
                    </select>
                ) : (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(miniature.status)}`}>
                        {miniature.status.charAt(0).toUpperCase() + miniature.status.slice(1)}
                    </span>
                )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {isEditing ? (
                    <div className="space-x-2">
                        <button
                            onClick={() => onUpdate(miniature.id)}
                            className="text-green-600 hover:text-green-900"
                        >
                            Save
                        </button>
                        <button
                            onClick={onCancelEdit}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <div className="space-x-2">
                        <button
                            onClick={() => onEdit(miniature)}
                            className="text-blue-600 hover:text-blue-900"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => onDelete(miniature.id)}
                            className="text-red-600 hover:text-red-900"
                        >
                            Delete
                        </button>
                    </div>
                )}
            </td>
        </tr>
    );
} 