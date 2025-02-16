import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Miniature, MiniatureStatus } from '../types/miniature';

export function Collection() {
    const navigate = useNavigate();
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

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        const fetchCollection = async () => {
            try {
                const response = await fetch(import.meta.env.VITE_API_HOST + 'api/collections', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch collection');
                }

                const data = await response.json();
                setMiniatures(data);
            } catch (err) {
                console.error('Error fetching collection:', err);
                setError('Failed to load collection. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCollection();
    }, [navigate]);

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
                    status: newMiniature.status
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add miniature');
            }

            const addedMiniature = await response.json();
            setMiniatures([...miniatures, addedMiniature]);
            setNewMiniature({
                name: '',
                count: 1,
                status: 'Gray'
            });
            setShowAddForm(false);
        } catch (err) {
            console.error('Failed to add miniature:', err);
            // You might want to show an error message to the user here
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

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">My Miniatures Collection</h1>
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
                        <div className="mb-6">
                            {!showAddForm ? (
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Add New Miniature
                                </button>
                            ) : (
                                <div className="bg-white rounded-lg shadow p-6">
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
                        </div>

                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            {miniatures.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    No miniatures in your collection yet. Add some using the button above!
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
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
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {editingId === miniature.id ? (
                                                        <input
                                                            type="text"
                                                            value={editForm.name || ''}
                                                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
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