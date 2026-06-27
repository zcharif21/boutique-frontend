'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingCart, Package } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LanguageContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, total } = useCart();
  const { user } = useAuth();
  const { t, lang } = useLang();
  const router = useRouter();

  const [form, setForm] = useState({ address: '', phone: '', notes: '' });
  const [ordering, setOrdering] = useState(false);

  const handleOrder = async () => {
    if (!user) {
      toast.error(lang === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Connectez-vous pour passer une commande');
      router.push('/auth/login');
      return;
    }
    if (!form.address || !form.phone) {
      toast.error(lang === 'ar' ? 'العنوان والهاتف مطلوبان' : 'Adresse et téléphone requis');
      return;
    }
    try {
      setOrdering(true);
      await api.post('/api/orders', {
        items: items.map(i => ({
          product_id: i.product.id,
          quantity: i.quantity,
          color: i.selectedColor || null,
          size: i.selectedSize || null,
        })),
        ...form,
      });
      clearCart();
      toast.success(lang === 'ar' ? 'تم تأكيد طلبك 🎉' : 'Commande passée avec succès ! 🎉');
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || (lang === 'ar' ? 'حدث خطأ' : 'Erreur lors de la commande'));
    } finally {
      setOrdering(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-400">
        <ShoppingCart size={56} className="mx-auto mb-4 opacity-40" />
        <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">{t('cartEmpty')}</h2>
        <Link href="/products" className="btn-primary inline-block mt-4">
          {t('seeProducts')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">{t('myCart')}</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          {items.map((item) => {
            const { product, quantity } = item;
            return (
              <div key={`${product.id}-${item.selectedColor}-${item.selectedSize}`} className="card flex gap-4 p-4">
                <div className="relative w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package size={24} className="text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 dark:text-gray-100 text-sm">{product.name}</h3>
                  {(item.selectedColor || item.selectedSize) && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.selectedColor && <span>🎨 {item.selectedColor}</span>}
                      {item.selectedColor && item.selectedSize && <span> · </span>}
                      {item.selectedSize && <span>📏 {item.selectedSize}</span>}
                    </p>
                  )}
                  <p className="text-pink-600 font-bold mt-1">
                    {(product.price * quantity).toLocaleString('fr-DZ')} DA
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateQty(product.id, quantity - 1, item.selectedColor, item.selectedSize)}
                      className="w-7 h-7 border rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium dark:text-gray-200">{quantity}</span>
                    <button onClick={() => updateQty(product.id, Math.min(quantity + 1, product.stock_qty), item.selectedColor, item.selectedSize)}
                      className="w-7 h-7 border rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Plus size={12} />
                    </button>
                    <button onClick={() => removeItem(product.id, item.selectedColor, item.selectedSize)}
                      className="ml-auto text-red-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">{t('total')}</h2>
            <div className="text-2xl font-bold text-pink-600 mb-4">
              {total.toLocaleString('fr-DZ')} DA
            </div>

            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">{t('deliveryInfo')}</h3>
            <div className="space-y-3">
              <input className="input" placeholder={t('address')}
                value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              <input className="input" placeholder={t('phone')}
                value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              <textarea className="input resize-none" rows={2} placeholder={t('notes')}
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>

            <button onClick={handleOrder} disabled={ordering} className="btn-primary w-full mt-4 py-3">
              {ordering ? t('processing') : t('confirmOrder')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}