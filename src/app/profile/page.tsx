'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Save, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
    if (user) setForm(f => ({ ...f, name: user.name || '', email: user.email || '' }));
  }, [user, loading]);

  const handleSave = async () => {
    if (form.password && form.password !== form.confirm) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      setSaving(true);
      await api.put('/api/users/me', {
        name: form.name,
        email: form.email,
        ...(form.password ? { password: form.password } : {}),
      });
      toast.success('Profil mis à jour ✅');
      setForm(f => ({ ...f, password: '', confirm: '' }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-400">Chargement...</div>;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link href="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-pink-600 mb-6 text-sm">
        <ArrowLeft size={16} /> Retour
      </Link>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mon profil</h1>

      <div className="card p-6 space-y-4">
        {/* Nom */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Nom</label>
          <div className="relative">
            <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Votre nom"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" type="email" placeholder="Votre email"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
        </div>

        <hr className="border-gray-100" />
        <p className="text-xs text-gray-400">Laisser vide pour ne pas changer le mot de passe</p>

        {/* Nouveau mot de passe */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Nouveau mot de passe</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" type="password" placeholder="Nouveau mot de passe"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
        </div>

        {/* Confirmer */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Confirmer le mot de passe</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" type="password" placeholder="Confirmer"
              value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} />
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

      {/* Stats commandes */}
      <div className="mt-4 card p-4 flex items-center justify-between">
        <span className="text-sm text-gray-600">Mes commandes</span>
        <Link href="/orders" className="text-pink-600 text-sm font-medium hover:underline">Voir →</Link>
      </div>
    </div>
  );
}