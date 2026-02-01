
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { ChartBarIcon, SparklesIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isResetMode, setIsResetMode] = useState(false);
    const navigate = useNavigate();

    const getErrorMessage = (err: any) => {
        const message = err.message || '';
        if (message.includes('Invalid login credentials')) return 'Credenciales inválidas. Revisa tu correo y contraseña.';
        if (message.includes('Email not confirmed')) return 'Por favor confirma tu correo electrónico antes de iniciar sesión.';
        if (message.includes('User not found')) return 'No se encontró ningún usuario con este correo.';
        if (message.includes('Password is too short')) return 'La contraseña es demasiado corta.';
        if (message.includes('rate limit')) return 'Demasiados intentos. Por favor intenta más tarde.';
        return 'Ocurrió un error. Por favor intenta de nuevo.';
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            navigate('/dashboard');
        } catch (err: any) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/login`,
            });

            if (resetError) throw resetError;

            setSuccessMessage('Se ha enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada.');
            setTimeout(() => {
                setIsResetMode(false);
                setSuccessMessage(null);
            }, 5000);
        } catch (err: any) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full mix-blend-multiply filter opacity-70 animate-blob"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full mix-blend-multiply filter opacity-70 animate-blob animation-delay-2000"></div>

            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 sm:p-12 relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center bg-slate-900 p-3 rounded-2xl mb-6 shadow-lg shadow-slate-200">
                        <ChartBarIcon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
                        {isResetMode ? 'Recuperar Cuenta' : 'Bienvenido'}
                    </h2>
                    <p className="text-slate-500">
                        {isResetMode
                            ? 'Ingresa tu correo para enviarte instrucciones'
                            : 'Ingresa a tu panel de control Ads Hub Pro'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium animate-shake">
                        <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-6 bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium">
                        <SparklesIcon className="w-5 h-5 flex-shrink-0" />
                        {successMessage}
                    </div>
                )}

                <form onSubmit={isResetMode ? handleResetPassword : handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Correo Electrónico</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400 font-medium"
                            placeholder="tu@correo.com"
                        />
                    </div>

                    {!isResetMode && (
                        <div>
                            <div className="flex justify-between items-center mb-2 ml-1">
                                <label className="block text-sm font-bold text-slate-700">Contraseña</label>
                                <button
                                    type="button"
                                    onClick={() => setIsResetMode(true)}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 outline-none"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400 font-medium"
                                placeholder="••••••••"
                            />
                        </div>
                    )}

                    <div className="space-y-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 focus:ring-4 focus:ring-slate-900/20 transition-all shadow-xl shadow-slate-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>{isResetMode ? 'Enviando...' : 'Iniciando...'}</span>
                                </>
                            ) : (
                                <>
                                    <span>{isResetMode ? 'Enviar Instrucciones' : 'Iniciar Sesión'}</span>
                                    <SparklesIcon className="w-5 h-5 opacity-50" />
                                </>
                            )}
                        </button>

                        {isResetMode && (
                            <button
                                type="button"
                                onClick={() => setIsResetMode(false)}
                                className="w-full py-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                Volver al inicio de sesión
                            </button>
                        )}
                    </div>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                    <Link to="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                        ← Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    );
}
