import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { profileApi } from '../api';
import { TerminalPanel } from '../components/ui/terminal-panel';
import { TerminalInput } from '../components/ui/terminal-input';

export function Profile() {
    const [email, setEmail] = useState('');
    const [savedEmail, setSavedEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await profileApi.getMe();
                const currentEmail = response.data.email ?? '';
                setEmail(currentEmail);
                setSavedEmail(currentEmail);
            } catch {
                setError('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            const response = await profileApi.updateMe({ email: email || null });
            const updatedEmail = response.data.email ?? '';
            setEmail(updatedEmail);
            setSavedEmail(updatedEmail);
            setSuccess('Profile updated.');
        } catch {
            setError('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const hasChanges = email !== savedEmail;

    if (loading) {
        return (
            <div className="max-w-md mx-auto">
                <p className="text-terminal-fg-dim text-xs uppercase tracking-widest">Loading profile data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto space-y-6">
            <Link
                to="/collection"
                className="inline-flex items-center gap-1.5 text-terminal-fg-dim hover:text-terminal-fg transition-colors"
            >
                <ArrowLeft size={14} />
                <span>Back to collection</span>
            </Link>

            <TerminalPanel>
                <div className="space-y-6 p-6">
                    <div>
                        <h2 className="text-lg font-bold uppercase tracking-wider text-terminal-fg">
                            PROFILE
                        </h2>
                        <div className="text-terminal-fgDim text-xs uppercase tracking-widest font-semibold mt-1">
                            ACCOUNT SETTINGS
                        </div>
                    </div>

                    {error && (
                        <div className="bg-terminal-destructive/30 border-2 border-terminal-destructive text-terminal-destructive px-6 py-4">
                            <div className="flex items-center justify-center gap-3">
                                <span className="font-bold text-xl">⚠</span>
                                <span className="uppercase tracking-widest font-bold text-sm">{error}</span>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="bg-terminal-accent/10 border-2 border-terminal-accent text-terminal-accent px-6 py-4">
                            <div className="flex items-center justify-center gap-3">
                                <span className="uppercase tracking-widest font-bold text-sm">{success}</span>
                            </div>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-terminal-fg mb-2">
                                EMAIL:
                            </label>
                            <TerminalInput
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={saving || !hasChanges}
                                className="w-full py-3 px-4 border-l-4 border-terminal-border bg-terminal-bg text-terminal-fg font-bold uppercase tracking-widest hover:border-terminal-accent hover:bg-terminal-bgLight transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-terminal-border disabled:hover:bg-terminal-bg"
                            >
                                {saving ? 'UPDATING...' : 'UPDATE PROFILE'}
                            </button>
                        </div>
                    </form>
                </div>
            </TerminalPanel>
        </div>
    );
}
