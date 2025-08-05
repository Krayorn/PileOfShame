import { SearchableSelect } from './SearchableSelect';

interface MoveControlsProps {
    allFolders: { id: string; name: string }[];
    targetFolderId: string;
    selectedCount: number;
    onMove: () => void;
    onCancel: () => void;
    onTargetChange: (folderId: string) => void;
}

export function MoveControls({
    allFolders,
    targetFolderId,
    selectedCount,
    onMove,
    onCancel,
    onTargetChange
}: MoveControlsProps) {
    return (
        <div className="flex items-center space-x-4">
            <SearchableSelect
                options={allFolders}
                value={targetFolderId}
                onChange={onTargetChange}
                placeholder="Search for target folder..."
                className="w-64"
            />
            <button
                onClick={onMove}
                disabled={!targetFolderId || selectedCount === 0}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
                Move Selected ({selectedCount})
            </button>
            <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
                Cancel
            </button>
        </div>
    );
} 