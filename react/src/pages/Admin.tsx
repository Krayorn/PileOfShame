import { useEffect, useState } from 'react';
import axios from 'axios';
import { adminApi } from '../api';
import { TerminalPanel } from '../components/ui/terminal-panel';

interface UserStatistics {
  id: string;
  username: string;
  isAdmin: boolean;
  foldersCount: number;
  miniaturesCount: number;
  picturesCount: number;
}

export function Admin() {
  const [users, setUsers] = useState<UserStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await adminApi.getUsers();
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        if (axios.isAxiosError(err) && err.response?.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else {
          setError('Failed to load users. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <TerminalPanel className="mt-12">
        <div className="p-4">
          <p className="text-green-400">Loading admin panel...</p>
        </div>
      </TerminalPanel>
    );
  }

  if (error) {
    return (
      <TerminalPanel className="mt-12">
        <div className="p-4">
          <p className="text-red-400">{error}</p>
        </div>
      </TerminalPanel>
    );
  }

  return (
    <TerminalPanel className="mt-12" >
      <div className="p-4">
        <h1 className="text-2xl font-bold text-green-400 mb-6">Admin Panel</h1>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-600">
            <thead>
              <tr className="bg-gray-800">
                <th className="border border-gray-600 px-4 py-2 text-left text-green-400">Username</th>
                <th className="border border-gray-600 px-4 py-2 text-left text-green-400">Admin</th>
                <th className="border border-gray-600 px-4 py-2 text-right text-green-400">Folders</th>
                <th className="border border-gray-600 px-4 py-2 text-right text-green-400">Miniatures</th>
                <th className="border border-gray-600 px-4 py-2 text-right text-green-400">Pictures</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800">
                  <td className="border border-gray-600 px-4 py-2">{user.username}</td>
                  <td className="border border-gray-600 px-4 py-2">
                    {user.isAdmin ? (
                      <span className="text-yellow-400">Yes</span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </td>
                  <td className="border border-gray-600 px-4 py-2 text-right">{user.foldersCount}</td>
                  <td className="border border-gray-600 px-4 py-2 text-right">{user.miniaturesCount}</td>
                  <td className="border border-gray-600 px-4 py-2 text-right">{user.picturesCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <p className="mt-4 text-gray-400">No users found.</p>
        )}
      </div>
    </TerminalPanel>
  );
}
