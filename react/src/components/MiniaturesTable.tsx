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
    onEditFormChange
}: MiniaturesTableProps) {
    if (miniatures.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 text-center text-gray-500">
                    No miniatures in this folder yet. Add some using the button above!
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {moveMode && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Select
                            </th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Count
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
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
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
} 