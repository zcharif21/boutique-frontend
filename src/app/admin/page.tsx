'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Package, Save, X, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Product, Category, Order } from '@/types';
import toast from 'react-hot-toast';

type Tab = 'products' | 'orders';

const EMPTY_FORM = {
  name: '', description: '', price: '', stock_qty: '0', category_id: '', is_active: true,
};

const EMPTY_VARIANT = { size: '', color: '', stock_qty: '' };

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('products');
  const [products, setProducts]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders]         = useState<Order[]>([]);
  const [fetching, setFetching]     = useState(true);

  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<Product | null>(null);
  const [form, setForm]           = useState({ ...EMPTY_FORM });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving]       = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Variantes
  const [variants, setVariants]         = useState<any[]>([]);
  const [newVariant, setNewVariant]     = useState({ ...EMPTY_VARIANT });
  const [loadingVars, setLoadingVars]   = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) router.push('/auth/login');
  }, [user, isAdmin, loading]);

  useEffect(() => {
    if (isAdmin) fetchAll();
  }, [isAdmin]);

  const fetchAll = async () => {
    setFetching(true);
    try {
      const [p, c, o] = await Promise.all([
        api.get('/api/products?limit=100'),
        api.get('/api/categories'),
        api.get('/api/orders'),
      ]);
      setProducts(p.data.products);
      setCategories(c.data);
      setOrders(o.data);
    } catch { toast.error('Erreur chargement'); }
    finally { setFetching(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setVariants([]);
    setNewVariant({ ...EMPTY_VARIANT });
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description || '', price: String(p.price),
      stock_qty: String(p.stock_qty), category_id: String(p.category_id || ''),
      is_active: p.is_active,
    });
    setNewVariant({ ...EMPTY_VARIANT });
    loadVariants(p.id);
    setShowForm(true);
  };

  const loadVariants = async (productId: number) => {
    setLoadingVars(true);
    try {
      const res = await api.get(`/api/products/${productId}/variants`);
      setVariants(res.data);
    } catch { setVariants([]); }
    finally { setLoadingVars(false); }
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return toast.error('Nom et prix requis');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (imageFile) fd.append('image', imageFile);

      let savedProduct: any;
      if (editing) {
        const res = await api.put(`/api/products/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        savedProduct = res.data;
        toast.success('Produit modifié');
      } else {
        const res = await api.post('/api/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        savedProduct = res.data;
        toast.success('Produit ajouté');
      }

      // Sauvegarder les variantes en attente (pour nouveau produit)
      if (!editing && variants.length > 0) {
        const pid = savedProduct.id || savedProduct.product?.id;
        if (pid) {
          for (const v of variants) {
            await api.post(`/api/products/${pid}/variants`, v);
          }
        }
      }

      setShowForm(false);
      fetchAll();
    } catch { toast.error('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  const handleAddVariant = async () => {
    if (!newVariant.size && !newVariant.color) return toast.error('Taille ou couleur requise');
    if (newVariant.stock_qty === '') return toast.error('Stock requis');

    if (editing) {
      // Produit existant → sauvegarder directement
      try {
        const res = await api.post(`/api/products/${editing.id}/variants`, {
          size: newVariant.size || null,
          color: newVariant.color || null,
          stock_qty: parseInt(newVariant.stock_qty),
        });
        setVariants(prev => [...prev, res.data]);
        setNewVariant({ ...EMPTY_VARIANT });
        toast.success('Variante ajoutée');
      } catch { toast.error('Erreur ajout variante'); }
    } else {
      // Nouveau produit → stocker localement
      setVariants(prev => [...prev, { ...newVariant, stock_qty: parseInt(newVariant.stock_qty), id: Date.now() }]);
      setNewVariant({ ...EMPTY_VARIANT });
    }
  };

  const handleDeleteVariant = async (variantId: number) => {
    if (editing) {
      try {
        await api.delete(`/api/products/variants/${variantId}`);
        setVariants(prev => prev.filter(v => v.id !== variantId));
        toast.success('Variante supprimée');
      } catch { toast.error('Erreur suppression'); }
    } else {
      setVariants(prev => prev.filter(v => v.id !== variantId));
    }
  };

  const handleUpdateVariantStock = async (variantId: number, qty: number) => {
    try {
      await api.patch(`/api/products/variants/${variantId}`, { stock_qty: qty });
      setVariants(prev => prev.map(v => v.id === variantId ? { ...v, stock_qty: qty } : v));
    } catch { toast.error('Erreur mise à jour'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      toast.success('Produit supprimé');
      fetchAll();
    } catch { toast.error('Erreur suppression'); }
  };

  const handleStockChange = async (id: number, qty: number) => {
    try {
      await api.patch(`/api/products/${id}/stock`, { stock_qty: qty });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock_qty: qty } : p));
    } catch { toast.error('Erreur mise à jour stock'); }
  };

  const handleStatus = async (orderId: number, status: string) => {
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status });
      toast.success('Statut mis à jour');
      fetchAll();
    } catch { toast.error('Erreur'); }
  };

  const isNew = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  };

  if (loading || fetching) {
    return <div className="flex items-center justify-center min-h-screen text-gray-400">Chargement...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Administration</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestion stock & commandes</p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="card px-4 py-2 text-center">
            <div className="font-bold text-pink-600 text-lg">{products.length}</div>
            <div className="text-gray-500 text-xs">Produits</div>
          </div>
          <div className="card px-4 py-2 text-center">
            <div className="font-bold text-blue-600 text-lg">{orders.length}</div>
            <div className="text-gray-500 text-xs">Commandes</div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 mb-6 border-b">
        {([['products','Produits & Stock',Package], ['orders','Commandes',ShoppingBag]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors
              ${tab === key ? 'border-pink-600 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* ─── TAB PRODUITS ─── */}
      {tab === 'products' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={openCreate} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Ajouter un produit
            </button>
          </div>

          {/* Formulaire */}
          {showForm && (
            <div className="card p-6 mb-6 border-pink-200 border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">
                  {editing ? 'Modifier le produit' : 'Nouveau produit'}
                </h2>
                <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-500" /></button>
              </div>

              {/* Champs produit */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Nom *</label>
                  <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Prix (DA) *</label>
                  <input type="number" className="input" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Stock général</label>
                  <input type="number" className="input" value={form.stock_qty} onChange={e => setForm(f => ({ ...f, stock_qty: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Catégorie</label>
                  <select className="input" value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                    <option value="">-- Choisir --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Photo</label>
                  <input type="file" accept="image/*" ref={fileRef}
                    onChange={e => setImageFile(e.target.files?.[0] || null)}
                    className="text-sm text-gray-600 w-full" />
                </div>
                <div className="col-span-2 md:col-span-3">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
                  <textarea className="input resize-none" rows={2}
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              </div>

              {/* Section Variantes */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Tailles & Couleurs (variantes)</h3>

                {/* Liste variantes existantes */}
                {loadingVars ? (
                  <p className="text-xs text-gray-400 mb-3">Chargement variantes...</p>
                ) : variants.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {variants.map(v => (
                      <div key={v.id} className="flex items-center gap-2 bg-gray-50 border rounded-lg px-3 py-2 text-sm">
                        {v.color && <span className="font-medium text-gray-700">{v.color}</span>}
                        {v.color && v.size && <span className="text-gray-400">/</span>}
                        {v.size && <span className="font-medium text-gray-700">{v.size}</span>}
                        <span className="text-gray-400 text-xs">—</span>
                        {editing ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleUpdateVariantStock(v.id, Math.max(0, v.stock_qty - 1))}
                              className="w-5 h-5 border rounded-full text-xs flex items-center justify-center hover:bg-gray-200">−</button>
                            <span className={`w-8 text-center text-xs font-bold ${v.stock_qty === 0 ? 'text-red-500' : 'text-green-600'}`}>
                              {v.stock_qty}
                            </span>
                            <button onClick={() => handleUpdateVariantStock(v.id, v.stock_qty + 1)}
                              className="w-5 h-5 border rounded-full text-xs flex items-center justify-center hover:bg-gray-200">+</button>
                          </div>
                        ) : (
                          <span className="text-xs text-green-600 font-bold">{v.stock_qty}</span>
                        )}
                        <button onClick={() => handleDeleteVariant(v.id)} className="text-red-400 hover:text-red-600">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 mb-3">Aucune variante — le stock général sera utilisé.</p>
                )}

                {/* Ajouter une variante */}
                <div className="flex flex-wrap gap-2 items-end">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Couleur</label>
                    <input className="input w-28 text-sm" placeholder="ex: Rouge"
                      value={newVariant.color} onChange={e => setNewVariant(v => ({ ...v, color: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      {newVariant.size && /^\d+$/.test(newVariant.size) ? '👟 Pointure' : '📏 Taille'} </label>
                    <input className="input w-20 text-sm" placeholder="ex: 38 ou S/M/L"
                      value={newVariant.size} onChange={e => setNewVariant(v => ({ ...v, size: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Stock</label>
                    <input type="number" className="input w-20 text-sm" placeholder="0"
                      value={newVariant.stock_qty} onChange={e => setNewVariant(v => ({ ...v, stock_qty: e.target.value }))} />
                  </div>
                  <button onClick={handleAddVariant}
                    className="btn-primary text-sm flex items-center gap-1 h-10">
                    <Plus size={14} /> Ajouter
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                  <Save size={16} /> {saving ? 'Sauvegarde...' : 'Enregistrer'}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
              </div>
            </div>
          )}

          {/* Tableau produits */}
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Produit</th>
                  <th className="px-4 py-3 text-left">Catégorie</th>
                  <th className="px-4 py-3 text-right">Prix</th>
                  <th className="px-4 py-3 text-center">Stock</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {p.image_url
                            ? <Image src={p.image_url} alt={p.name} width={40} height={40} className="object-cover w-full h-full" />
                            : <Package size={20} className="text-gray-400 m-auto mt-2.5" />
                          }
                          {p.created_at && isNew(p.created_at) && (
                            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[9px] font-bold px-1 rounded">NEW</span>
                          )}
                        </div>
                        <span className="font-medium text-gray-800">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.category_name || '—'}</td>
                    <td className="px-4 py-3 text-right font-medium text-pink-600">
                      {p.price.toLocaleString('fr-DZ')} DA
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleStockChange(p.id, Math.max(0, p.stock_qty - 1))}
                          className="w-6 h-6 border rounded-full text-xs flex items-center justify-center hover:bg-gray-100">−</button>
                        <span className={`w-12 text-center font-bold text-sm
                          ${p.stock_qty === 0 ? 'text-red-500' : p.stock_qty < 5 ? 'text-orange-500' : 'text-green-600'}`}>
                          {p.stock_qty}
                        </span>
                        <button onClick={() => handleStockChange(p.id, p.stock_qty + 1)}
                          className="w-6 h-6 border rounded-full text-xs flex items-center justify-center hover:bg-gray-100">+</button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-gray-100 rounded text-blue-600">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-gray-100 rounded text-red-500">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ─── TAB COMMANDES ─── */}
      {tab === 'orders' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Client</th>
                <th className="px-4 py-3 text-left">Téléphone</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-center">Statut</th>
                <th className="px-4 py-3 text-center">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-400">#{o.id}</td>
                  <td className="px-4 py-3 font-medium">{o.client_name || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{o.phone || '—'}</td>
                  <td className="px-4 py-3 text-right font-bold text-pink-600">
                    {o.total.toLocaleString('fr-DZ')} DA
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select value={o.status} onChange={e => handleStatus(o.id, e.target.value)}
                      className="text-xs border rounded px-2 py-1 bg-white">
                      <option value="en_attente">En attente</option>
                      <option value="confirmee">Confirmée</option>
                      <option value="expediee">Expédiée</option>
                      <option value="livree">Livrée</option>
                      <option value="annulee">Annulée</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-400 text-xs">
                    {new Date(o.created_at).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}