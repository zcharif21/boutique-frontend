'use client';
import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) return toast.error('Entrez votre email');
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
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

        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={32} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Email envoyé !</h2>
            <p className="text-gray-500 text-sm">
              Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.
            </p>
            <p className="text-gray-400 text-xs mt-3">Le lien expire dans 1 heure.</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Mot de passe oublié ?</h1>
            <p className="text-gray-500 text-sm mb-6">
              Entrez votre email et on vous envoie un lien pour réinitialiser votre mot de passe.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input className="input pl-9" type="email" placeholder="votre@email.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                </div>
              </div>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}