
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon, ExclamationCircleIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if there's a session or if we are in recovery mode
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            // If No session and no recovery token in URL, redirect or show error
            // Actually, Supabase JS might not have processed the fragment yet
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                console.log('Password recovery mode active');
            }
            if (event === 'SIGNED_OUT') {
                navigate('/login');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) throw updateError;

            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error al actualizar la contraseña.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full mix-blend-multiply filter opacity-70 animate-blob"></div>
                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 sm:p-12 relative z-10 text-center">
                    <div className="inline-flex items-center justify-center bg-emerald-100 p-4 rounded-full mb-6">
                        <CheckCircleIcon className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-4">¡Contraseña Actualizada!</h2>
                    <p className="text-slate-500 mb-8">
                        Tu contraseña ha sido cambiada exitosamente. Serás redirigido al panel en unos segundos...
                    </p>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 animate-[progress_3s_linear]"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full mix-blend-multiply filter opacity-70 animate-blob"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-500/10 blur-[100px] rounded-full mix-blend-multiply filter opacity-70 animate-blob animation-delay-2000"></div>

            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 sm:p-12 relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center bg-slate-900 p-3 rounded-2xl mb-6 shadow-lg shadow-slate-200">
                        <LockClosedIcon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Nueva Contraseña</h2>
                    <p className="text-slate-500">
                        Ingresa tu nueva contraseña para acceder a tu cuenta
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium animate-shake">
                        <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Contraseña Nueva</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400 font-medium"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Confirmar Contraseña</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400 font-medium"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 focus:ring-4 focus:ring-slate-900/20 transition-all shadow-xl shadow-slate-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Actualizando...</span>
                            </>
                        ) : (
                            <>
                                <span>Cambiar Contraseña</span>
                                <SparklesIcon className="w-5 h-5 opacity-50" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
