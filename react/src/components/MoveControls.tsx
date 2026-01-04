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
                className="px-4 py-2 border border-terminal-border bg-terminal-bg text-terminal-fg font-semibold uppercase tracking-wider rounded-sm shadow-terminal hover:shadow-terminal-glow hover:bg-terminal-bgLight disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                Move Selected ({selectedCount})
            </button>
            <button
                onClick={onCancel}
                className="px-4 py-2 border border-terminal-borderDim bg-terminal-bg text-terminal-fgDim font-semibold uppercase tracking-wider rounded-sm shadow-terminal hover:shadow-terminal-glow hover:bg-terminal-bgLight transition-all"
            >
                Cancel
            </button>
        </div>
    );
} 