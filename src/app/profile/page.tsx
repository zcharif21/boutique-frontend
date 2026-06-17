'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Save, ArrowLeft, Package, ShoppingBag } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  en_attente: { label: 'En attente',  color: 'bg-yellow-100 text-yellow-700' },
  confirmee:  { label: 'Confirmée',   color: 'bg-blue-100 text-blue-700' },
  expediee:   { label: 'Expédiée',    color: 'bg-purple-100 text-purple-700' },
  livree:     { label: 'Livrée',      color: 'bg-green-100 text-green-700' },
  annulee:    { label: 'Annulée',     color: 'bg-red-100 text-red-700' },
};

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
    if (user) {
      setForm(f => ({ ...f, name: user.name || '', email: user.email || '' }));
      fetchOrders();
    }
  }, [user, loading]);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders');
      setOrders(res.data.slice(0, 5));
    } catch { setOrders([]); }
    finally { setLoadingOrders(false); }
  };

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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-pink-600 mb-6 text-sm">
        <ArrowLeft size={16} /> Retour
      </Link>

      {/* Header profil */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center">
          <User size={28} className="text-pink-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{user?.name}</h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="card p-6 space-y-4 mb-6">
        <h2 className="font-semibold text-gray-700 flex items-center gap-2">
          <User size={16} /> Modifier mon profil
        </h2>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Nom</label>
          <div className="relative">
            <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" type="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
        </div>

        <hr className="border-gray-100" />
        <p className="text-xs text-gray-400">Laisser vide pour ne pas changer le mot de passe</p>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Nouveau mot de passe</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" type="password" placeholder="Nouveau mot de passe"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Confirmer</label>
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

      {/* Historique commandes */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700 flex items-center gap-2">
            <ShoppingBag size={16} /> Mes dernières commandes
          </h2>
          <Link href="/orders" className="text-pink-600 text-sm hover:underline">Voir tout →</Link>
        </div>

        {loadingOrders ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Package size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Aucune commande pour l'instant</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => {
              const s = STATUS_LABEL[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600' };
              return (
                <div key={order.id} className="border rounded-xl p-3 hover:border-pink-200 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-gray-400">#{order.id}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-1 space-y-0.5">
                    {order.items?.slice(0, 2).map((item: any, idx: number) => (
                      <div key={idx}>
                        {item.name} x{item.quantity}
                        {item.color && <span className="text-pink-500"> · {item.color}</span>}
                        {item.size && <span className="text-blue-500"> · {item.size}</span>}
                      </div>
                    ))}
                    {order.items?.length > 2 && (
                      <div className="text-gray-400">+{order.items.length - 2} autre(s)</div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-pink-600 text-sm">
                      {Number(order.total).toLocaleString('fr-DZ')} DA
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}