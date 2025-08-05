import { useEffect, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import type { Miniature, MiniatureStatus } from '../types/miniature';
import { Folder } from '../types/folder';
import type { CollectionStatistics } from '../types/statistics';
import { MiniaturesTable } from './MiniaturesTable';
import { AddMiniatureForm } from './AddMiniatureForm';
import { AddFolderForm } from './AddFolderForm';
import { FolderItem } from './FolderItem';
import { MoveControls } from './MoveControls';
import { collectionApi } from '../api';

export function Collection() {
    const { folderId } = useParams();
    const navigate = useNavigate();
    const [folder, setFolder] = useState<Folder | null>(null);
    const [miniatures, setMiniatures] = useState<Miniature[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Miniature>>({});
    const [showAddFolderForm, setShowAddFolderForm] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [moveMode, setMoveMode] = useState(false);
    const [selectedMiniatures, setSelectedMiniatures] = useState<string[]>([]);
    const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
    const [allFolders, setAllFolders] = useState<{id: string, name: string}[]>([]);
    const [targetFolderId, setTargetFolderId] = useState<string>('');
    const [statistics, setStatistics] = useState<CollectionStatistics | null>(null);

    useEffect(() => {
        const fetchCollection = async () => {
            try {
                const [collectionResponse, statsResponse] = await Promise.all([
                    collectionApi.getCollection(folderId),
                    collectionApi.getStatistics(folderId)
                ]);

                setFolder(collectionResponse.data);
                setMiniatures(collectionResponse.data.miniatures);
                setStatistics(statsResponse.data);
            } catch (err) {
                console.error('Error fetching collection:', err);
                setError('Failed to load collection. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCollection();
    }, [navigate, folderId]);

    useEffect(() => {
        const fetchAllFolders = async () => {
            if (!moveMode) return;
            
            try {
                const response = await collectionApi.getAllFolders();
                setAllFolders(response.data);
            } catch (err) {
                console.error('Failed to fetch folders:', err);
                setError('Failed to load folders for move operation.');
            }
        };

        fetchAllFolders();
    }, [moveMode, folderId]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleAddMiniature = async (miniatureData: { name: string; count: number; status: MiniatureStatus }) => {
        try {
            const response = await collectionApi.createMiniature({
                name: miniatureData.name,
                count: miniatureData.count,
                status: miniatureData.status,
                    folderId: folderId || folder?.id
            });

            setMiniatures([...miniatures, response.data]);
        } catch (err) {
            console.error('Failed to add miniature:', err);
            setError('Failed to add miniature. Please try again later.');
        }
    };

    const handleDeleteMiniature = async (miniatureId: string) => {
        try {
            await collectionApi.deleteMiniature(miniatureId);
            setMiniatures(miniatures.filter(m => m.id !== miniatureId));
        } catch (err) {
            console.error('Failed to delete miniature:', err);
            setError('Failed to delete miniature. Please try again later.');
        }
    };

    const handleEdit = (miniature: Miniature) => {
        setEditingId(miniature.id);
        setEditForm({
            name: miniature.name,
            count: miniature.count,
            status: miniature.status
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleUpdateMiniature = async (miniatureId: string) => {
        // Only include changed fields in the payload
        const payload: Partial<Miniature> = {};
        const currentMiniature = miniatures.find(m => m.id === miniatureId);
        
        if (!currentMiniature) return;
        
        if (editForm.name && editForm.name !== currentMiniature.name) {
            payload.name = editForm.name;
        }
        if (editForm.count && editForm.count !== currentMiniature.count) {
            payload.count = editForm.count;
        }
        if (editForm.status && editForm.status !== currentMiniature.status) {
            payload.status = editForm.status;
        }

        // If nothing changed, just cancel edit
        if (Object.keys(payload).length === 0) {
            handleCancelEdit();
            return;
        }

        try {
            const response = await collectionApi.updateMiniature(miniatureId, payload);
            setMiniatures(miniatures.map(m => 
                m.id === miniatureId ? response.data : m
            ));
            setEditingId(null);
            setEditForm({});
        } catch (err) {
            console.error('Failed to update miniature:', err);
            setError('Failed to update miniature. Please try again later.');
        }
    };

    const handleAddFolder = async (folderName: string) => {
        try {
            const response = await collectionApi.createFolder({
                name: folderName,
                    folderId: folderId || folder?.id
            });

            setFolder(prev => prev ? {
                ...prev,
                folders: [...prev.folders, response.data]
            } : null);
        } catch (err) {
            console.error('Failed to create folder:', err);
            setError('Failed to create folder. Please try again later.');
        }
    };

    const handleDeleteFolder = async (folderId: string) => {
        try {
            await collectionApi.deleteFolder(folderId);
            // Remove the deleted folder from state
            setFolder(prev => prev ? {
                ...prev,
                folders: prev.folders.filter(f => f.id !== folderId)
            } : null);
        } catch (err) {
            console.error('Failed to delete folder:', err);
            setError('Failed to delete folder. Please try again later.');
        }
    };

    const handleMoveMiniatures = async () => {
        if (!targetFolderId || (selectedMiniatures.length === 0 && selectedFolders.length === 0)) return;
        
        try {
            await collectionApi.moveItems({
                    miniatureIds: selectedMiniatures,
                    folderIds: selectedFolders,
                    targetFolderId: targetFolderId
            });

            // Remove moved miniatures from the current list
            setMiniatures(miniatures.filter(m => !selectedMiniatures.includes(m.id)));
            
            // Remove moved folders from the current list
            setFolder(prev => prev ? {
                ...prev,
                folders: prev.folders.filter(f => !selectedFolders.includes(f.id))
            } : null);
            
            // Reset move mode
            setMoveMode(false);
            setSelectedMiniatures([]);
            setSelectedFolders([]);
            setTargetFolderId('');
        } catch (err) {
            console.error('Failed to move items:', err);
            setError('Failed to move items. Please try again.');
        }
    };

    const toggleMiniatureSelection = (miniatureId: string) => {
        setSelectedMiniatures(prev => 
            prev.includes(miniatureId) 
                ? prev.filter(id => id !== miniatureId)
                : [...prev, miniatureId]
        );
    };

    const toggleFolderSelection = (folderId: string) => {
        setSelectedFolders(prev => 
            prev.includes(folderId) 
                ? prev.filter(id => id !== folderId)
                : [...prev, folderId]
        );
    };



    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center">
                            {folder?.name || 'My Collection'}
                            {statistics && folder?.id && statistics[folder.id] && (
                                <span className="ml-4 text-lg font-normal text-gray-600">
                                    ({Math.round((statistics[folder.id].Painted / (statistics[folder.id].Built + statistics[folder.id].Gray + statistics[folder.id].Painted)) * 100)}% painted - {statistics[folder.id].Built + statistics[folder.id].Gray + statistics[folder.id].Painted} miniatures)
                                </span>
                            )}
                        </h1>
                        {folderId && folder?.parent?.id && (
                            <Link 
                                to={`/collection/${folder.parent.id}`} 
                                className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                                ← Back to {folder.parent.name}
                            </Link>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>

                {error && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading collection...</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => setShowAddFolderForm(true)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Add New Folder
                                    </button>
                                    <button
                                        onClick={() => setShowAddForm(true)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Add New Miniature
                                    </button>
                                    {(miniatures.length > 0 || (folder?.folders && folder.folders.length > 0)) && !moveMode && (
                                        <button
                                            onClick={() => setMoveMode(true)}
                                            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                                        >
                                            Move Items
                                        </button>
                                    )}
                                </div>
                                {moveMode && (
                                    <MoveControls
                                        allFolders={allFolders}
                                        targetFolderId={targetFolderId}
                                        selectedCount={selectedMiniatures.length + selectedFolders.length}
                                        onMove={handleMoveMiniatures}
                                        onCancel={() => {
                                                setMoveMode(false);
                                                setSelectedMiniatures([]);
                                                setSelectedFolders([]);
                                                setTargetFolderId('');
                                            }}
                                        onTargetChange={setTargetFolderId}
                                    />
                                )}
                            </div>

                            {showAddFolderForm && (
                                <AddFolderForm
                                    onSubmit={handleAddFolder}
                                    onCancel={() => setShowAddFolderForm(false)}
                                />
                            )}

                            {showAddForm && (
                                <AddMiniatureForm
                                    onSubmit={handleAddMiniature}
                                    onCancel={() => setShowAddForm(false)}
                                />
                            )}

                            {folder?.folders && folder.folders.length > 0 && (
                                <div className="space-y-2">
                                    {folder.folders.map(subfolder => (
                                        <FolderItem
                                            key={subfolder.id}
                                            folder={subfolder}
                                            statistics={statistics ? statistics[subfolder.id] : null}
                                            moveMode={moveMode}
                                            isSelected={selectedFolders.includes(subfolder.id)}
                                            onDelete={handleDeleteFolder}
                                            onSelectionToggle={toggleFolderSelection}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <MiniaturesTable
                            miniatures={miniatures}
                            moveMode={moveMode}
                            editingId={editingId}
                            editForm={editForm}
                            selectedMiniatures={selectedMiniatures}
                            onEdit={handleEdit}
                            onDelete={handleDeleteMiniature}
                            onUpdate={handleUpdateMiniature}
                            onCancelEdit={handleCancelEdit}
                            onSelectionToggle={toggleMiniatureSelection}
                            onEditFormChange={setEditForm}
                        />
                    </>
                )}
            </div>
        </div>
    );
} 