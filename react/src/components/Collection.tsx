import { useEffect, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import type { Miniature, MiniatureStatus } from '../types/miniature';
import { Folder } from '../types/folder';
import type { CollectionStatistics, FolderStatistics } from '../types/statistics';
import { SearchableSelect } from './SearchableSelect';

export function Collection() {
    const { folderId } = useParams();
    const navigate = useNavigate();
    const [folder, setFolder] = useState<Folder | null>(null);
    const [miniatures, setMiniatures] = useState<Miniature[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newMiniature, setNewMiniature] = useState({
        name: '',
        count: 1,
        status: 'Gray' as MiniatureStatus
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Miniature>>({});
    const [showAddFolderForm, setShowAddFolderForm] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [moveMode, setMoveMode] = useState(false);
    const [selectedMiniatures, setSelectedMiniatures] = useState<string[]>([]);
    const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
    const [allFolders, setAllFolders] = useState<{id: string, name: string}[]>([]);
    const [targetFolderId, setTargetFolderId] = useState<string>('');
    const [statistics, setStatistics] = useState<CollectionStatistics | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        const fetchCollection = async () => {
            try {
                const token = localStorage.getItem('token');
                const baseEndpoint = folderId 
                    ? `api/collections?folderId=${folderId}`
                    : 'api/collections';
                const statsEndpoint = folderId
                    ? `api/collections/stats?folderId=${folderId}`
                    : 'api/collections/stats';
                    
                const [collectionResponse, statsResponse] = await Promise.all([
                    fetch(import.meta.env.VITE_API_HOST + baseEndpoint, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }),
                    fetch(import.meta.env.VITE_API_HOST + statsEndpoint, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                ]);

                if (!collectionResponse.ok) {
                    throw new Error('Failed to fetch collection');
                }
                if (!statsResponse.ok) {
                    throw new Error('Failed to fetch statistics');
                }

                const [collectionData, statsData] = await Promise.all([
                    collectionResponse.json(),
                    statsResponse.json()
                ]);

                setFolder(collectionData);
                setMiniatures(collectionData.miniatures);
                setStatistics(statsData);
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
            
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(import.meta.env.VITE_API_HOST + 'api/collections/folders', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error('Failed to fetch folders');
                
                const data = await response.json();
                setAllFolders(data);
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

    const handleAddMiniature = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(import.meta.env.VITE_API_HOST + 'api/collections/miniatures', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newMiniature.name,
                    count: newMiniature.count,
                    status: newMiniature.status,
                    folderId: folderId || folder?.id
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add miniature');
            }

            const addedMiniature = await response.json();
            setMiniatures([...miniatures, addedMiniature]);
            setNewMiniature({
                name: '',
                count: newMiniature.count,
                status: newMiniature.status
            });
        } catch (err) {
            console.error('Failed to add miniature:', err);
            setError('Failed to add miniature. Please try again later.');
        }
    };

    const handleDeleteMiniature = async (miniatureId: string) => {
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(import.meta.env.VITE_API_HOST + `api/collections/miniatures/${miniatureId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete miniature');
            }

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
        const token = localStorage.getItem('token');
        
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
            const response = await fetch(import.meta.env.VITE_API_HOST + `api/collections/miniatures/${miniatureId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to update miniature');
            }

            const updatedMiniature = await response.json();
            setMiniatures(miniatures.map(m => 
                m.id === miniatureId ? updatedMiniature : m
            ));
            setEditingId(null);
            setEditForm({});
        } catch (err) {
            console.error('Failed to update miniature:', err);
            setError('Failed to update miniature. Please try again later.');
        }
    };

    const handleAddFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(import.meta.env.VITE_API_HOST + 'api/collections/folders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newFolderName,
                    folderId: folderId || folder?.id
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create folder');
            }

            const addedFolder = await response.json();
            setFolder(prev => prev ? {
                ...prev,
                folders: [...prev.folders, addedFolder]
            } : null);
            setNewFolderName('');
            setShowAddFolderForm(false);
        } catch (err) {
            console.error('Failed to create folder:', err);
            setError('Failed to create folder. Please try again later.');
        }
    };

    const handleDeleteFolder = async (folderId: string) => {
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(import.meta.env.VITE_API_HOST + `api/collections/folders/${folderId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete folder');
            }

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
        
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(import.meta.env.VITE_API_HOST + 'api/collections/miniatures', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    miniatureIds: selectedMiniatures,
                    folderIds: selectedFolders,
                    targetFolderId: targetFolderId
                })
            });

            if (!response.ok) throw new Error('Failed to move items');

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

    const calculatePaintedPercentage = (stats: FolderStatistics): number => {
        const total = stats.Built + stats.Gray + stats.Painted;
        return total === 0 ? 0 : Math.round((stats.Painted / total) * 100);
    };

    const calculateTotalMiniatures = (stats: FolderStatistics): number => {
        return stats.Built + stats.Gray + stats.Painted;
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
                                    ({calculatePaintedPercentage(statistics[folder.id])}% painted - {calculateTotalMiniatures(statistics[folder.id])} miniatures)
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
                                    <div className="flex items-center space-x-4">
                                        <SearchableSelect
                                            options={allFolders}
                                            value={targetFolderId}
                                            onChange={setTargetFolderId}
                                            placeholder="Search for target folder..."
                                            className="w-64"
                                        />
                                        <button
                                            onClick={handleMoveMiniatures}
                                            disabled={!targetFolderId || (selectedMiniatures.length === 0 && selectedFolders.length === 0)}
                                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                                        >
                                            Move Selected ({selectedMiniatures.length + selectedFolders.length})
                                        </button>
                                        <button
                                            onClick={() => {
                                                setMoveMode(false);
                                                setSelectedMiniatures([]);
                                                setSelectedFolders([]);
                                                setTargetFolderId('');
                                            }}
                                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>

                            {showAddFolderForm && (
                                <div className="mb-4 bg-white rounded-lg shadow p-6">
                                    <h3 className="text-lg font-bold mb-4">Create New Folder</h3>
                                    <form onSubmit={handleAddFolder} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Folder Name
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={newFolderName}
                                                onChange={(e) => setNewFolderName(e.target.value)}
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
                                                onClick={() => {
                                                    setShowAddFolderForm(false);
                                                    setNewFolderName('');
                                                }}
                                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {showAddForm && (
                                <div className="mb-4 bg-white rounded-lg shadow p-6">
                                    <h2 className="text-xl font-bold mb-4">Add New Miniature</h2>
                                    <form onSubmit={handleAddMiniature} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={newMiniature.name}
                                                onChange={(e) => setNewMiniature({
                                                    ...newMiniature,
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
                                                value={newMiniature.count}
                                                onChange={(e) => setNewMiniature({
                                                    ...newMiniature,
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
                                                value={newMiniature.status}
                                                onChange={(e) => setNewMiniature({
                                                    ...newMiniature,
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
                                                onClick={() => setShowAddForm(false)}
                                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {folder?.folders && folder.folders.length > 0 && (
                                <div className="space-y-2">
                                    {folder.folders.map(subfolder => (
                                        <div key={subfolder.id} className="relative">
                                            {moveMode ? (
                                                <div className="p-4 bg-white rounded-lg shadow">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedFolders.includes(subfolder.id)}
                                                            onChange={() => toggleFolderSelection(subfolder.id)}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                                                        />
                                                        <svg className="w-6 h-6 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                        </svg>
                                                        <span className="text-gray-700 font-medium">{subfolder.name}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                                                    <div className="flex items-center justify-between">
                                                        <Link
                                                            to={`/collection/${subfolder.id}`}
                                                            className="flex items-center flex-grow"
                                                        >
                                                            <svg className="w-6 h-6 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                            </svg>
                                                            <span className="text-gray-700 font-medium">{subfolder.name}</span>
                                                            {statistics && statistics[subfolder.id] && (
                                                                <span className="ml-2 text-sm text-gray-500">
                                                                    ({calculatePaintedPercentage(statistics[subfolder.id])}% painted - {calculateTotalMiniatures(statistics[subfolder.id])} miniatures)
                                                                </span>
                                                            )}
                                                        </Link>
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                if (confirm('Are you sure you want to delete this folder and all its contents?')) {
                                                                    handleDeleteFolder(subfolder.id);
                                                                }
                                                            }}
                                                            className="ml-2 text-red-600 hover:text-red-800"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            {miniatures.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    No miniatures in this folder yet. Add some using the button above!
                                </div>
                            ) : (
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
                                            <tr key={miniature.id}>
                                                {moveMode && (
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedMiniatures.includes(miniature.id)}
                                                            onChange={() => toggleMiniatureSelection(miniature.id)}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                        />
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {editingId === miniature.id ? (
                                                        <input
                                                            type="text"
                                                            value={editForm.name || ''}
                                                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    handleUpdateMiniature(miniature.id);
                                                                }
                                                            }}
                                                            className="w-full px-2 py-1 border rounded"
                                                        />
                                                    ) : (
                                                        miniature.name
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {editingId === miniature.id ? (
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={editForm.count || ''}
                                                            onChange={(e) => setEditForm({...editForm, count: parseInt(e.target.value)})}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    handleUpdateMiniature(miniature.id);
                                                                }
                                                            }}
                                                            className="w-full px-2 py-1 border rounded"
                                                        />
                                                    ) : (
                                                        miniature.count
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {editingId === miniature.id ? (
                                                        <select
                                                            value={editForm.status}
                                                            onChange={(e) => setEditForm({...editForm, status: e.target.value as MiniatureStatus})}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    handleUpdateMiniature(miniature.id);
                                                                }
                                                            }}
                                                            className="w-full px-2 py-1 border rounded"
                                                        >
                                                            <option value="Gray">Gray</option>
                                                            <option value="Built">Built</option>
                                                            <option value="Painted">Painted</option>
                                                        </select>
                                                    ) : (
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                            ${miniature.status === 'Painted' ? 'bg-green-100 text-green-800' : 
                                                              miniature.status === 'Built' ? 'bg-yellow-100 text-yellow-800' : 
                                                              'bg-gray-100 text-gray-800'}`}>
                                                            {miniature.status.charAt(0).toUpperCase() + miniature.status.slice(1)}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {editingId === miniature.id ? (
                                                        <div className="space-x-2">
                                                            <button
                                                                onClick={() => handleUpdateMiniature(miniature.id)}
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="text-gray-600 hover:text-gray-900"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="space-x-2">
                                                            <button
                                                                onClick={() => handleEdit(miniature)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteMiniature(miniature.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
} 