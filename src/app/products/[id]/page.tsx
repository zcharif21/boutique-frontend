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

interface Variant {
  id: number;
  size: string | null;
  color: string | null;
  stock_qty: number;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router  = useRouter();
  const { addItem } = useCart();

  const [product, setProduct]   = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading]   = useState(true);
  const [qty, setQty]           = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize]   = useState<string | null>(null);

  const isNew = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [prodRes, varRes] = await Promise.all([
          api.get(`/api/products/${id}`),
          api.get(`/api/products/${id}/variants`),
        ]);
        setProduct(prodRes.data);
        setVariants(varRes.data);
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
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const hasVariants = variants.length > 0;
  const colors  = Array.from(new Set(variants.filter(v => v.color).map(v => v.color as string)));
  const sizes   = Array.from(new Set(variants.filter(v => v.size).map(v => v.size as string)));
  
// Stock disponible selon sélection
  const getVariantStock = () => {
    if (!hasVariants) return product.stock_qty;
    const match = variants.find(v =>
      (colors.length === 0 || v.color === selectedColor) &&
      (sizes.length  === 0 || v.size  === selectedSize)
    );
    return match ? match.stock_qty : 0;
  };

  const availableStock = getVariantStock();

  const handleAddToCart = () => {
    if (hasVariants) {
      if (colors.length > 0 && !selectedColor) return toast.error('Veuillez choisir une couleur');
      if (sizes.length  > 0 && !selectedSize)  return toast.error('Veuillez choisir une taille');
      if (availableStock === 0) return toast.error('Stock insuffisant pour cette variante');
    }
    addItem(product, qty);
    toast.success(`${qty}x "${product.name}" ajouté au panier !`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-pink-600 mb-6 text-sm">
        <ArrowLeft size={16} /> Retour aux produits
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative h-96 md:h-[480px] bg-gray-100 rounded-2xl overflow-hidden">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="object-cover" priority />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <Package size={64} />
            </div>
          )}

          {/* Badge catégorie */}
          <span className="absolute top-3 left-3 bg-white text-pink-600 text-xs font-semibold px-3 py-1 rounded-full shadow">
            {product.category_name}
          </span>

          {/* Badge NOUVEAU */}
          {product.created_at && isNew(product.created_at) && (
            <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
               Nouveau
            </span>
          )}

          {/* Rupture de stock */}
          {availableStock === 0 && !hasVariants && (
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

          {/* Couleurs */}
          {colors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Couleur : {selectedColor && <span className="text-pink-600">{selectedColor}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map(color => (
                  <button key={color} onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all
                      ${selectedColor === color
                        ? 'border-pink-600 bg-pink-50 text-pink-600'
                        : 'border-gray-300 text-gray-600 hover:border-pink-400'}`}>
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tailles / Pointures */}
          {sizes.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                {sizes[0]?.match(/^\d+$/) ? '👟 Pointure' : '📏 Taille'} :
                {selectedSize && <span className="text-pink-600 ml-1">{selectedSize}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => {
                  const variant = variants.find(v =>
                    v.size === size &&
                    (colors.length === 0 || v.color === selectedColor)
                  );
                  const inStock = variant ? variant.stock_qty > 0 : false;
                  return (
                    <button key={size} onClick={() => inStock && setSelectedSize(size)}
                      disabled={!inStock}
                      className={`w-12 h-12 rounded-lg border text-sm font-semibold transition-all
                        ${selectedSize === size
                          ? 'border-pink-600 bg-pink-50 text-pink-600'
                          : inStock
                            ? 'border-gray-300 text-gray-700 hover:border-pink-400'
                            : 'border-gray-200 text-gray-300 line-through cursor-not-allowed'}`}>
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock indicator */}
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${
              availableStock === 0 ? 'bg-red-500' :
              availableStock < 5  ? 'bg-orange-400' : 'bg-green-500'
            }`} />
            <span className="text-gray-600">
              {availableStock === 0
                ? 'Rupture de stock'
                : availableStock === 1
                  ? 'Plus qu\'un seul en stock !'
                  : 'En stock'}
            </span>
          </div>

          {/* Quantité */}
          {availableStock > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Quantité :</span>
              <div className="flex items-center gap-3 border rounded-lg px-3 py-2 w-fit">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-gray-500 hover:text-pink-600">
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty(q => Math.min(availableStock, q + 1))} className="text-gray-500 hover:text-pink-600">
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Bouton panier */}
          <button onClick={handleAddToCart} disabled={availableStock === 0}
            className="btn-primary flex items-center justify-center gap-3 py-4 text-base">
            <ShoppingCart size={20} />
            {availableStock === 0 ? 'Indisponible' : 'Ajouter au panier'}
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