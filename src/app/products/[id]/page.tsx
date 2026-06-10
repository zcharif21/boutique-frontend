'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, ArrowLeft, Package, Minus, Plus } from 'lucide-react';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router  = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/api/products/${id}`);
        setProduct(res.data);
      } catch {
        toast.error('Produit introuvable');
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-8 animate-pulse">
          <div className="bg-gray-200 rounded-xl h-96" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const handleAddToCart = () => {
    addItem(product, qty);
    toast.success(`${qty}x "${product.name}" ajouté au panier !`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Retour */}
      <Link href="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-pink-600 mb-6 text-sm">
        <ArrowLeft size={16} /> Retour aux produits
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative h-96 md:h-[480px] bg-gray-100 rounded-2xl overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <Package size={64} />
            </div>
          )}

          {/* Badge catégorie */}
          <span className="absolute top-3 left-3 bg-white text-pink-600 text-xs font-semibold px-3 py-1 rounded-full shadow">
            {product.category_name}
          </span>

          {/* Rupture de stock */}
          {product.stock_qty === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-800 font-semibold px-4 py-2 rounded-lg text-sm">
                Rupture de stock
              </span>
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="flex flex-col justify-center space-y-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
            {product.description && (
              <p className="text-gray-600 mt-3 leading-relaxed">{product.description}</p>
            )}
          </div>

          {/* Prix */}
          <div className="text-3xl font-bold text-pink-600">
            {product.price.toLocaleString('fr-DZ')} DA
          </div>

          {/* Stock indicator */}
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${
              product.stock_qty === 0 ? 'bg-red-500' :
              product.stock_qty < 5  ? 'bg-orange-400' : 'bg-green-500'
            }`} />
            <span className="text-gray-600">
              {product.stock_qty === 0
                ? 'Rupture de stock'
                : product.stock_qty < 5
                  ? `Plus que ${product.stock_qty} en stock !`
                  : 'En stock'}
            </span>
          </div>

          {/* Sélecteur quantité */}
          {product.stock_qty > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Quantité :</span>
              <div className="flex items-center gap-3 border rounded-lg px-3 py-2 w-fit">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="text-gray-500 hover:text-pink-600"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-semibold">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(product.stock_qty, q + 1))}
                  className="text-gray-500 hover:text-pink-600"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Bouton panier */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock_qty === 0}
            className="btn-primary flex items-center justify-center gap-3 py-4 text-base"
          >
            <ShoppingCart size={20} />
            {product.stock_qty === 0 ? 'Indisponible' : 'Ajouter au panier'}
          </button>

          {/* Infos livraison */}
          <div className="border-t pt-4 text-sm text-gray-500 space-y-1">
            <p>🚚 Livraison partout en Algérie</p>
            <p>💳 Paiement à la livraison</p>
            <p>↩️ Retour sous 7 jours</p>
          </div>
        </div>
      </div>
    </div>
  );
}
