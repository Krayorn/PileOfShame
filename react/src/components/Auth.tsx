import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api';

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

        // if (mode === 'register' && password !== confirmPassword) {
        //     setError('Passwords do not match');
        //     return;
        // }

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
        <div className="min-h-screen flex items-center justify-center bg-terminal-bg p-4">
            <div className="max-w-md w-full space-y-8 p-8 bg-terminal-bgLight border border-terminal-border rounded-sm shadow-terminal-glow">
                <h2 className="text-center text-3xl font-bold uppercase tracking-wider text-terminal-fg">
                    {mode === 'login' ? 'Sign In' : 'Register'}
                </h2>
                
                {error && (
                    <div className="bg-terminal-bg border border-terminal-destructive text-terminal-destructive px-4 py-3 rounded-sm shadow-terminal">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-semibold uppercase tracking-wider text-terminal-fg mb-2">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                required
                                className="mt-1 block w-full px-3 py-2 bg-terminal-bg border border-terminal-border text-terminal-fg rounded-sm focus:outline-none focus:ring-2 focus:ring-terminal-border focus:shadow-terminal"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold uppercase tracking-wider text-terminal-fg mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                className="mt-1 block w-full px-3 py-2 bg-terminal-bg border border-terminal-border text-terminal-fg rounded-sm focus:outline-none focus:ring-2 focus:ring-terminal-border focus:shadow-terminal"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {mode === 'register' && (
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold uppercase tracking-wider text-terminal-fg mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    className="mt-1 block w-full px-3 py-2 bg-terminal-bg border border-terminal-border text-terminal-fg rounded-sm focus:outline-none focus:ring-2 focus:ring-terminal-border focus:shadow-terminal"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 px-4 border border-terminal-border bg-terminal-bg text-terminal-fg font-semibold uppercase tracking-wider rounded-sm shadow-terminal hover:shadow-terminal-glow hover:bg-terminal-bgLight transition-all"
                    >
                        {mode === 'login' ? 'Sign In' : 'Register'}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <button
                        className="text-terminal-fg hover:text-terminal-accent transition-colors uppercase tracking-wider text-sm font-semibold"
                        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                    >
                        {mode === 'login' 
                            ? "Don't have an account? Register" 
                            : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
} 