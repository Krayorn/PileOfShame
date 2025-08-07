import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { Folder } from '../types/folder';
import type { FolderStatistics } from '../types/statistics';
import { collectionApi } from '../api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FolderItemProps {
    folder: Folder;
    statistics: FolderStatistics | null;
    moveMode: boolean;
    isSelected: boolean;
    onDelete: (folderId: string) => void;
    onSelectionToggle: (folderId: string) => void;
    onUpdate?: (folderId: string, folder: Folder) => void;
}

export function FolderItem({
    folder,
    statistics,
    moveMode,
    isSelected,
    onDelete,
    onSelectionToggle,
    onUpdate
}: FolderItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(folder.name);
    const [isUpdating, setIsUpdating] = useState(false);

    const calculatePaintedPercentage = (stats: FolderStatistics): number => {
        const total = stats.Built + stats.Gray + stats.Painted;
        return total === 0 ? 0 : Math.round((stats.Painted / total) * 100);
    };

    const calculateTotalMiniatures = (stats: FolderStatistics): number => {
        return stats.Built + stats.Gray + stats.Painted;
    };

    const handleDelete = () => {
        onDelete(folder.id);
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditName(folder.name);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditName(folder.name);
    };

    const handleSaveEdit = async () => {
        if (editName.trim() === '' || editName === folder.name) {
            handleCancelEdit();
            return;
        }

        setIsUpdating(true);
        try {
            const response = await collectionApi.updateFolder(folder.id, { name: editName.trim() });
            onUpdate?.(folder.id, response.data);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update folder:', error);
            setEditName(folder.name);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveEdit();
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    if (moveMode) {
        return (
            <div className="p-4 bg-white rounded-lg shadow">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectionToggle(folder.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                    />
                    <svg className="w-6 h-6 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <span className="text-gray-700 font-medium">{folder.name}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                {isEditing ? (
                    <div className="flex items-center flex-grow">
                        <svg className="w-6 h-6 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={handleKeyPress}
                            onBlur={handleSaveEdit}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                            disabled={isUpdating}
                        />
                        <div className="ml-2 flex space-x-1">
                            <button
                                onClick={handleSaveEdit}
                                disabled={isUpdating}
                                className="px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                            >
                                {isUpdating ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                disabled={isUpdating}
                                className="px-2 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <Link
                            to={`/collection/${folder.id}`}
                            className="flex items-center flex-grow"
                        >
                            <svg className="w-6 h-6 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            <span className="text-gray-700 font-medium">{folder.name}</span>
                            {statistics && (
                                <span className="ml-2 text-sm text-gray-500">
                                    ({calculatePaintedPercentage(statistics)}% painted - {calculateTotalMiniatures(statistics)} miniatures)
                                </span>
                            )}
                        </Link>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleEdit}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit folder name"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <AlertDialog>
                                <AlertDialogTrigger className="text-red-600 hover:text-red-800">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Folder</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete "{folder.name}" and all its contents? This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
} 