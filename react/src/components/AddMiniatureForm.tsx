import React, { useState } from 'react';
import type { MiniatureStatus } from '../types/miniature';

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

    return (
        <div className="mb-4 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Add New Miniature</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Name
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({
                            ...formData,
                            name: e.target.value
                        })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Count
                    </label>
                    <input
                        type="number"
                        min="1"
                        required
                        value={formData.count}
                        onChange={(e) => setFormData({
                            ...formData,
                            count: parseInt(e.target.value)
                        })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Status
                    </label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({
                            ...formData,
                            status: e.target.value as MiniatureStatus
                        })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="Gray">Gray</option>
                        <option value="Built">Built</option>
                        <option value="Painted">Painted</option>
                    </select>
                </div>
                <div className="flex space-x-4">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Add Miniature
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
} 