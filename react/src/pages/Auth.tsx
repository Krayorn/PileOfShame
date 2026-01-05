import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import { TerminalPanel } from '../components/ui/terminal-panel';
import { TerminalInput } from '../components/ui/terminal-input';

type AuthMode = 'login' | 'register';

export function Auth() {
    const navigate = useNavigate();
    const [mode, setMode] = useState<AuthMode>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/collection');
        }
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (mode === 'login') {
                const response = await authApi.login({ username, password });
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    navigate('/collection');
                }
            } else {
                await authApi.register({ username, password });
                // After successful registration, switch to login mode
                setMode('login');
                setPassword('');
                setConfirmPassword('');
            }
        } catch (err) {
            setError('Authentication failed. Please try again.');
        }
    };

    return (
        <div className="flex items-center justify-center bg-terminal-bg p-4">
            <TerminalPanel className="max-w-md w-full">
                <div className='space-y-8 p-8' >
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold uppercase tracking-wider text-terminal-fg mb-2">
                            {mode === 'login' ? 'SIGN IN' : 'REGISTER'}
                        </h2>
                        <div className="text-terminal-fgDim text-xs uppercase tracking-widest font-semibold">
                            {mode === 'login' ? 'RESTRICTED DATA' : 'NEW USER INITIALIZATION'}
                        </div>
                    </div>
                    
                    {error && (
                        <div className="bg-terminal-destructive/30 border-2 border-terminal-destructive text-terminal-destructive px-6 py-4 relative">
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-terminal-destructive font-bold text-xl">⚠</span>
                                <span className="uppercase tracking-widest font-bold text-sm">{error}</span>
                            </div>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="username" className="block text-xs font-bold uppercase tracking-widest text-terminal-fg mb-2">
                                    USERNAME:
                                </label>
                                <TerminalInput
                                    id="username"
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-terminal-fg mb-2">
                                    PASSWORD:
                                </label>
                                <TerminalInput
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            {mode === 'register' && (
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-widest text-terminal-fg mb-2">
                                        CONFIRM PASSWORD:
                                    </label>
                                    <TerminalInput
                                        id="confirmPassword"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full py-3 px-4 border-l-4 border-terminal-border bg-terminal-bg text-terminal-fg font-bold uppercase tracking-widest hover:border-terminal-accent hover:bg-terminal-bgLight transition-all text-sm"
                            >
                                {mode === 'login' ? 'ACCESS SYSTEM' : 'REGISTER'}
                            </button>
                        </div>
                    </form>

                    <div className="text-center">
                        <button
                            className="text-terminal-fgDim hover:text-terminal-accent transition-colors uppercase tracking-widest text-xs font-semibold"
                            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                        >
                            {mode === 'login' 
                                ? "→ SWITCH TO REGISTRATION PROTOCOL" 
                                : "→ RETURN TO LOGIN PROTOCOL"}
                        </button>
                    </div>
                </div>
            </TerminalPanel>
        </div>
    );
}

