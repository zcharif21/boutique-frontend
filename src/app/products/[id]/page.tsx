'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, ArrowLeft, Package, Minus, Plus } from 'lucide-react';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useLang } from '@/context/LanguageContext';
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
  const router = useRouter();
  const { addItem } = useCart();
  const { t, lang } = useLang();

  const [product, setProduct]   = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading]   = useState(true);
  const [qty, setQty]           = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize]   = useState<string | null>(null);
  const [extraImages, setExtraImages]     = useState<any[]>([]);
  const [activeImage, setActiveImage]     = useState<string | null>(null);

  const isNew = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [prodRes, varRes, imgRes] = await Promise.all([
          api.get(`/api/products/${id}`),
          api.get(`/api/products/${id}/variants`),
          api.get(`/api/products/${id}/images`),
        ]);
        setProduct(prodRes.data);
        setVariants(varRes.data);
        setExtraImages(imgRes.data);
        setActiveImage(prodRes.data.image_url);
      } catch {
        toast.error(lang === 'ar' ? 'المنتج غير موجود' : 'Produit introuvable');
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
          <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-96" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const hasVariants = variants.length > 0;
  const colors = Array.from(new Set(variants.filter(v => v.color).map(v => v.color as string)));
  const sizes  = Array.from(new Set(variants.filter(v => v.size).map(v => v.size as string)));

  const getVariantStock = () => {
    if (!hasVariants) return product.stock_qty;
    if (!selectedColor && !selectedSize) return product.stock_qty;
    const match = variants.find(v =>
      (!selectedColor || v.color === selectedColor) &&
      (!selectedSize  || v.size  === selectedSize)
    );
    return match ? match.stock_qty : product.stock_qty;
  };

  const availableStock = getVariantStock();

  const handleAddToCart = () => {
    if (hasVariants) {
      if (colors.length > 0 && !selectedColor)
        return toast.error(lang === 'ar' ? 'يرجى اختيار اللون' : 'Veuillez choisir une couleur');
      if (sizes.length > 0 && !selectedSize)
        return toast.error(lang === 'ar' ? 'يرجى اختيار المقاس' : 'Veuillez choisir une taille');
      if (availableStock === 0)
        return toast.error(lang === 'ar' ? 'الكمية غير كافية' : 'Stock insuffisant');
    }
    addItem(product, qty, selectedColor, selectedSize);
    toast.success(lang === 'ar' ? `أضيف "${product.name}" إلى السلة !` : `${qty}x "${product.name}" ajouté au panier !`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-pink-600 mb-6 text-sm">
        <ArrowLeft size={16} /> {lang === 'ar' ? 'رجوع' : 'Retour aux produits'}
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image + miniatures */}
        <div className="flex flex-col gap-3">
          <div className="relative h-96 md:h-[480px] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
            {activeImage ? (
              <Image src={activeImage} alt={product.name} fill className="object-cover" priority />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <Package size={64} />
              </div>
            )}
            <span className="absolute top-3 left-3 bg-white text-pink-600 text-xs font-semibold px-3 py-1 rounded-full shadow">
              {product.category_name}
            </span>
            {product.created_at && isNew(product.created_at) && (
              <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                {lang === 'ar' ? '✨ جديد' : '✨ Nouveau'}
              </span>
            )}
          </div>

          {extraImages.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setActiveImage(product.image_url ?? null)}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                  ${activeImage === product.image_url ? 'border-pink-600' : 'border-gray-200'}`}>
                {product.image_url && (
                  <Image src={product.image_url} alt="main" width={64} height={64} className="object-cover w-full h-full" />
                )}
              </button>
              {extraImages.map(img => (
                <button key={img.id} onClick={() => setActiveImage(img.image_url)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                    ${activeImage === img.image_url ? 'border-pink-600' : 'border-gray-200'}`}>
                  <Image src={img.image_url} alt="photo" width={64} height={64} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="flex flex-col justify-center space-y-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">{product.name}</h1>
            {product.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">{product.description}</p>
            )}
          </div>

          <div className="text-3xl font-bold text-pink-600">
            {product.price.toLocaleString('fr-DZ')} DA
          </div>

          {/* Couleurs */}
          {colors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {lang === 'ar' ? 'اللون' : 'Couleur'} :
                {selectedColor && <span className="text-pink-600 ml-1">{selectedColor}</span>}
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

          {/* Tailles */}
          {sizes.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {sizes[0]?.match(/^\d+$/)
                  ? (lang === 'ar' ? '👟 المقاس' : '👟 Pointure')
                  : (lang === 'ar' ? '📏 المقاس' : '📏 Taille')} :
                {selectedSize && <span className="text-pink-600 ml-1">{selectedSize}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => {
                  const variant = variants.find(v =>
                    v.size === size && (colors.length === 0 || v.color === selectedColor)
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

          {/* Stock */}
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${
              availableStock === 0 ? 'bg-red-500' :
              availableStock === 1 ? 'bg-orange-400' : 'bg-green-500'
            }`} />
            <span className="text-gray-600 dark:text-gray-400">
              {availableStock === 0
                ? t('outOfStock')
                : availableStock === 1
                  ? t('lastOne')
                  : t('inStock')}
            </span>
          </div>

          {/* Quantité */}
          {availableStock > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {lang === 'ar' ? 'الكمية' : 'Quantité'} :
              </span>
              <div className="flex items-center gap-3 border dark:border-gray-600 rounded-lg px-3 py-2 w-fit">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-gray-500 hover:text-pink-600">
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-semibold dark:text-gray-200">{qty}</span>
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
            {availableStock === 0
              ? t('outOfStock')
              : (lang === 'ar' ? 'إضافة إلى السلة' : 'Ajouter au panier')}
          </button>

          <div className="border-t dark:border-gray-700 pt-4 text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>🚚 {lang === 'ar' ? 'توصيل إلى جميع أنحاء الجزائر' : 'Livraison partout en Algérie'}</p>
            <p>💳 {lang === 'ar' ? 'الدفع عند الاستلام' : 'Paiement à la livraison'}</p>
            <p>↩️ {lang === 'ar' ? 'إرجاع خلال 7 أيام' : 'Retour sous 7 jours'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}