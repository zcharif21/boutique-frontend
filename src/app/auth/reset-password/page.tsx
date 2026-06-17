'use client';
import { useState, useEffect, Suspense } from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Lien invalide');
      router.push('/auth/login');
    }
  }, [token]);

  const handleSubmit = async () => {
    if (!form.password || form.password.length < 6)
      return toast.error('Mot de passe trop court (min 6 caractères)');
    if (form.password !== form.confirm)
      return toast.error('Les mots de passe ne correspondent pas');
    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', { token, password: form.password });
      setDone(true);
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lien expiré ou invalide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-pink-600 mb-6 text-sm">
          <ArrowLeft size={16} /> Retour
        </Link>

        {done ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Mot de passe mis à jour !</h2>
            <p className="text-gray-500 text-sm">Redirection vers la page de connexion...</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Nouveau mot de passe</h1>
            <p className="text-gray-500 text-sm mb-6">Choisissez un nouveau mot de passe pour votre compte.</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Nouveau mot de passe</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input className="input pl-9" type="password" placeholder="Min. 6 caractères"
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Confirmer</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input className="input pl-9" type="password" placeholder="Répétez le mot de passe"
                    value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} />
                </div>
              </div>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Chargement...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}