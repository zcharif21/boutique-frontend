'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Search, ShoppingCart, Package } from 'lucide-react';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { label: 'Tous',       slug: '' },
  { label: 'Femme',      slug: 'femme' },
  { label: 'Homme',      slug: 'homme' },
  { label: 'Enfant',     slug: 'enfant' },
  { label: 'Nouveau-né', slug: 'nouveau-ne' },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (category) params.category = category;
      if (search)   params.search   = search;
      const res = await api.get('/api/products', { params });
      setProducts(res.data.products);
    } catch {
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat.slug} onClick={() => setCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${category === cat.slug ? 'bg-pink-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-pink-300'}`}>
              {cat.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 ml-auto">
          <input type="text" placeholder="Rechercher..." value={search}
            onChange={e => setSearch(e.target.value)} className="input w-64" />
          <button type="submit" className="btn-primary px-3"><Search size={18} /></button>
        </form>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="bg-gray-200 h-56" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-lg">Aucun produit trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map(product => (
            <div key={product.id} className="card group hover:shadow-md transition-shadow">
              <div className="relative h-56 bg-gray-100 overflow-hidden">
                {product.image_url ? (
                  <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400"><Package size={40} /></div>
                )}
                {product.stock_qty === 0 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-white text-gray-700 text-xs font-semibold px-2 py-1 rounded">Rupture de stock</span>
                  </div>
                )}
                <span className="absolute top-2 left-2 bg-white text-pink-600 text-xs font-medium px-2 py-0.5 rounded-full shadow-sm">{product.category_name}</span>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-gray-800 text-sm leading-tight line-clamp-2 mb-2">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-pink-600 font-bold">{product.price.toLocaleString('fr-DZ')} DA</span>
                  <button onClick={() => { addItem(product); toast.success('Ajouté au panier !'); }}
                    disabled={product.stock_qty === 0}
                    className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1">
                    <ShoppingCart size={14} /> Ajouter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Chargement...</div>}>
      <ProductsContent />
    </Suspense>
  );
}