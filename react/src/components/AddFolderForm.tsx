import React, { useState } from 'react';

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
        <div className="mb-4 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4">Create New Folder</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Folder Name
                    </label>
                    <input
                        type="text"
                        required
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Enter folder name"
                    />
                </div>
                <div className="flex space-x-4">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Create Folder
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