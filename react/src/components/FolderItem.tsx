import { Link } from 'react-router-dom';
import type { Folder } from '../types/folder';
import type { FolderStatistics } from '../types/statistics';
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
}

export function FolderItem({
    folder,
    statistics,
    moveMode,
    isSelected,
    onDelete,
    onSelectionToggle
}: FolderItemProps) {
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
                <AlertDialog>
                    <AlertDialogTrigger className="ml-2 text-red-600 hover:text-red-800">
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
        </div>
    );
} 