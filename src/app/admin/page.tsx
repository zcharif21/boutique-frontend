'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Package, Save, X, ShoppingBag, Eye, MapPin, Phone, FileText, Users, Key, Search, Copy } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Product, Category } from '@/types';
import toast from 'react-hot-toast';

type Tab = 'products' | 'orders' | 'users';

const EMPTY_FORM = {
  name: '', description: '', price: '', stock_qty: '0', category_id: '', is_active: true,
};
const EMPTY_VARIANT = { size: '', color: '', stock_qty: '' };

const STATUS_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  confirmee: 'Confirmée',
  expediee: 'Expédiée',
  livree: 'Livrée',
  annulee: 'Annulée',
};
const STATUS_COLORS: Record<string, string> = {
  en_attente: 'bg-yellow-100 text-yellow-700',
  confirmee:  'bg-blue-100 text-blue-700',
  expediee:   'bg-purple-100 text-purple-700',
  livree:     'bg-green-100 text-green-700',
  annulee:    'bg-red-100 text-red-600',
};

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  const [tab, setTab]               = useState<Tab>('products');
  const [products, setProducts]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders]         = useState<any[]>([]);
  const [fetching, setFetching]     = useState(true);

  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<Product | null>(null);
  const [form, setForm]           = useState({ ...EMPTY_FORM });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [productImages, setProductImages] = useState<any[]>([]);
  const [uploadingImg, setUploadingImg]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const fileRef     = useRef<HTMLInputElement>(null);
  const extraImgRef = useRef<HTMLInputElement>(null);

  const [variants, setVariants]       = useState<any[]>([]);
  const [newVariant, setNewVariant]   = useState({ ...EMPTY_VARIANT });
  const [loadingVars, setLoadingVars] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const [users, setUsers]             = useState<any[]>([]);
  const [userSearch, setUserSearch]   = useState('');
  const [resettingId, setResettingId] = useState<number | null>(null);
  const [resetResult, setResetResult] = useState<{ name: string; password: string } | null>(null);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) router.push('/auth/login');
  }, [user, isAdmin, loading]);

  useEffect(() => {
    if (isAdmin) fetchAll();
  }, [isAdmin]);

  const fetchAll = async () => {
    setFetching(true);
    try {
      const [p, c, o, u] = await Promise.all([
        api.get('/api/products?limit=100'),
        api.get('/api/categories'),
        api.get('/api/orders'),
        api.get('/api/users'),
      ]);
      setProducts(p.data.products);
      setCategories(c.data);
      setOrders(o.data);
      setUsers(u.data);
    } catch { toast.error('Erreur chargement'); }
    finally { setFetching(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setVariants([]);
    setProductImages([]);
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
    loadProductImages(p.id);
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

  const loadProductImages = async (productId: number) => {
    try {
      const res = await api.get(`/api/products/${productId}/images`);
      setProductImages(res.data);
    } catch { setProductImages([]); }
  };

  const handleUploadExtraImage = async (file: File) => {
    if (!editing) return toast.error("Sauvegardez le produit d'abord");
    if (productImages.length >= 4) return toast.error('Maximum 4 photos supplémentaires');
    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('position', String(productImages.length));
      const res = await api.post(`/api/products/${editing.id}/images`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProductImages(prev => [...prev, res.data]);
      toast.success('Photo ajoutée');
    } catch { toast.error('Erreur upload'); }
    finally { setUploadingImg(false); }
  };

  const handleDeleteExtraImage = async (imgId: number) => {
    try {
      await api.delete(`/api/products/images/${imgId}`);
      setProductImages(prev => prev.filter(i => i.id !== imgId));
      toast.success('Photo supprimée');
    } catch { toast.error('Erreur suppression'); }
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
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder((o: any) => ({ ...o, status }));
    } catch { toast.error('Erreur'); }
  };

  const handleResetPassword = async (id: number, name: string) => {
    if (!confirm(`Réinitialiser le mot de passe de ${name} ?`)) return;
    setResettingId(id);
    try {
      const res = await api.put(`/api/users/${id}/reset-password`);
      setResetResult({ name: res.data.user.name, password: res.data.newPassword });
      toast.success('Nouveau mot de passe généré');
    } catch { toast.error('Erreur lors de la réinitialisation'); }
    finally { setResettingId(null); }
  };

  const isNew = (createdAt: string) =>
    Date.now() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (loading || fetching) {
    return <div className="flex items-center justify-center min-h-screen text-gray-400">Chargement...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* ─── MODAL DÉTAIL COMMANDE ─── */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h2 className="font-bold text-gray-800 text-lg">Commande #{selectedOrder.id}</h2>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[selectedOrder.status]}`}>
                  {STATUS_LABELS[selectedOrder.status]}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Infos client */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-gray-700 text-sm mb-3">👤 Client</h3>
                <p className="font-medium text-gray-800">{selectedOrder.client_name || '—'}</p>
                {selectedOrder.phone && (
                  <p className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={14} className="text-pink-500" /> {selectedOrder.phone}
                  </p>
                )}
                {selectedOrder.address && (
                  <p className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={14} className="text-pink-500" /> {selectedOrder.address}
                  </p>
                )}
                {selectedOrder.notes && (
                  <p className="flex items-center gap-2 text-sm text-gray-500 italic">
                    <FileText size={14} /> {selectedOrder.notes}
                  </p>
                )}
              </div>

              {/* Articles */}
              <div>
                <h3 className="font-semibold text-gray-700 text-sm mb-3">🛍️ Articles commandés</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.length > 0 ? selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 bg-white border rounded-xl p-3">
                      {item.image_url ? (
                        <Image src={item.image_url} alt={item.name} width={48} height={48}
                          className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package size={20} className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.color && (
                            <span className="inline-flex items-center gap-1 bg-pink-50 text-pink-600 text-xs font-medium px-2 py-0.5 rounded-full border border-pink-200">
                              🎨 {item.color}
                            </span>
                          )}
                          {item.size && (
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full border border-blue-200">
                              {/^\d+$/.test(item.size) ? '👟' : '📏'} {item.size}
                            </span>
                          )}
                          <span className="inline-flex items-center bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                            x{item.quantity}
                          </span>
                        </div>
                      </div>
                      <p className="font-bold text-pink-600 text-sm whitespace-nowrap">
                        {(item.unit_price * item.quantity).toLocaleString('fr-DZ')} DA
                      </p>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-400">Aucun article trouvé</p>
                  )}
                </div>
              </div>

              {/* Total + statut */}
              <div className="flex items-center justify-between border-t pt-4">
                <div>
                  <p className="text-xs text-gray-500">Total commande</p>
                  <p className="text-2xl font-bold text-pink-600">{selectedOrder.total?.toLocaleString('fr-DZ')} DA</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Changer statut</p>
                  <select value={selectedOrder.status}
                    onChange={e => handleStatus(selectedOrder.id, e.target.value)}
                    className="text-sm border rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-pink-300">
                    <option value="en_attente">En attente</option>
                    <option value="confirmee">Confirmée</option>
                    <option value="expediee">Expédiée</option>
                    <option value="livree">Livrée</option>
                    <option value="annulee">Annulée</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center">
                Passée le {new Date(selectedOrder.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── EN-TÊTE ─── */}
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
          <div className="card px-4 py-2 text-center">
            <div className="font-bold text-purple-600 text-lg">{users.length}</div>
            <div className="text-gray-500 text-xs">Utilisateurs</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b">
        {([['products', 'Produits & Stock', Package], ['orders', 'Commandes', ShoppingBag], ['users', 'Utilisateurs', Users]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors
              ${tab === key ? 'border-pink-600 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* ─── ONGLET PRODUITS ─── */}
      {tab === 'products' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={openCreate} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Ajouter un produit
            </button>
          </div>

          {showForm && (
            <div className="card p-6 mb-6 border-pink-200 border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">{editing ? 'Modifier le produit' : 'Nouveau produit'}</h2>
                <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-500" /></button>
              </div>

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
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Photo principale</label>
                  <input type="file" accept="image/*" ref={fileRef}
                    onChange={e => setImageFile(e.target.files?.[0] || null)}
                    className="text-sm text-gray-600 w-full" />
                </div>
                <div className="col-span-2 md:col-span-3">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
                  <textarea className="input resize-none" rows={2}
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>

                {editing && (
                  <div className="col-span-2 md:col-span-3 border-t pt-4">
                    <label className="text-xs font-medium text-gray-600 mb-2 block">
                      Photos supplémentaires ({productImages.length}/4)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {productImages.map(img => (
                        <div key={img.id} className="relative w-16 h-16 rounded-lg overflow-hidden border">
                          <Image src={img.image_url} alt="photo" width={64} height={64} className="object-cover w-full h-full" />
                          <button onClick={() => handleDeleteExtraImage(img.id)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-0.5">
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      {productImages.length < 4 && (
                        <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-pink-400">
                          {uploadingImg ? <span className="text-xs text-gray-400">...</span> : <Plus size={20} className="text-gray-400" />}
                          <input type="file" accept="image/*" className="hidden" ref={extraImgRef}
                            onChange={e => e.target.files?.[0] && handleUploadExtraImage(e.target.files[0])} />
                        </label>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Variantes */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Tailles & Couleurs (variantes)</h3>
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
                <div className="flex flex-wrap gap-2 items-end">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Couleur</label>
                    <input className="input w-28 text-sm" placeholder="ex: Rouge"
                      value={newVariant.color} onChange={e => setNewVariant(v => ({ ...v, color: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      {newVariant.size && /^\d+$/.test(newVariant.size) ? '👟 Pointure' : '📏 Taille'}
                    </label>
                    <input className="input w-20 text-sm" placeholder="ex: 38 ou S/M/L"
                      value={newVariant.size} onChange={e => setNewVariant(v => ({ ...v, size: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Stock</label>
                    <input type="number" className="input w-20 text-sm" placeholder="0"
                      value={newVariant.stock_qty} onChange={e => setNewVariant(v => ({ ...v, stock_qty: e.target.value }))} />
                  </div>
                  <button onClick={handleAddVariant} className="btn-primary text-sm flex items-center gap-1 h-10">
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
                            : <Package size={20} className="text-gray-400 m-auto mt-2.5" />}
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

      {/* ─── ONGLET COMMANDES ─── */}
      {tab === 'orders' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Client</th>
                <th className="px-4 py-3 text-left">Articles</th>
                <th className="px-4 py-3 text-left">Téléphone</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-center">Statut</th>
                <th className="px-4 py-3 text-center">Date</th>
                <th className="px-4 py-3 text-center">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-400">#{o.id}</td>
                  <td className="px-4 py-3 font-medium">{o.client_name || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {o.items?.map((item: any, idx: number) => (
                      <div key={idx} className="mb-0.5">
                        <span className="font-medium text-gray-800">{item.name}</span>
                        <span className="text-gray-500"> x{item.quantity}</span>
                        {item.color && <span className="ml-1 text-pink-500 font-medium">· {item.color}</span>}
                        {item.size && <span className="ml-1 text-blue-500 font-medium">· {item.size}</span>}
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{o.phone || '—'}</td>
                  <td className="px-4 py-3 text-right font-bold text-pink-600">
                    {o.total.toLocaleString('fr-DZ')} DA
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[o.status]}`}>
                      {STATUS_LABELS[o.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-400 text-xs">
                    {new Date(o.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => setSelectedOrder(o)}
                      className="p-1.5 hover:bg-pink-50 rounded text-pink-500 hover:text-pink-700">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── ONGLET UTILISATEURS ─── */}
      {tab === 'users' && (
        <>
          {resetResult && (
            <div className="card p-4 mb-4 bg-green-50 border border-green-200 flex items-center justify-between gap-3">
              <div className="text-sm text-green-800">
                Nouveau mot de passe pour <span className="font-semibold">{resetResult.name}</span> :{' '}
                <span className="font-mono font-bold">{resetResult.password}</span>
                <div className="text-xs text-green-600 mt-1">
                  Copie-le et envoie-le au client (WhatsApp/Insta) — il ne sera plus affiché après.
                </div>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(resetResult.password); toast.success('Copié !'); }}
                className="p-2 hover:bg-green-100 rounded-lg text-green-700 shrink-0">
                <Copy size={18} />
              </button>
            </div>
          )}

          <div className="flex justify-end mb-4">
            <div className="relative max-w-sm w-full">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input pl-9"
                placeholder="Chercher par nom ou email..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Nom</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-center">Rôle</th>
                  <th className="px-4 py-3 text-center">Inscrit le</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-400 text-xs">
                      {new Date(u.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleResetPassword(u.id, u.name)}
                        disabled={resettingId === u.id}
                        className="btn-secondary text-xs flex items-center gap-1 mx-auto disabled:opacity-50">
                        <Key size={14} />
                        {resettingId === u.id ? '...' : 'Réinitialiser'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm">Aucun utilisateur trouvé</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}