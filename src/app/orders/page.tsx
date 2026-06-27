'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

const STATUS = {
  en_attente: { fr: 'En attente',  ar: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700' },
  confirmee:  { fr: 'Confirmée',   ar: 'مؤكد',         color: 'bg-blue-100 text-blue-700' },
  expediee:   { fr: 'Expédiée',    ar: 'تم الشحن',     color: 'bg-purple-100 text-purple-700' },
  livree:     { fr: 'Livrée',      ar: 'تم التسليم',   color: 'bg-green-100 text-green-700' },
  annulee:    { fr: 'Annulée',     ar: 'ملغى',         color: 'bg-red-100 text-red-700' },
};

const STEPS = [
  { key: 'en_attente', fr: 'En attente',  ar: 'قيد الانتظار' },
  { key: 'confirmee',  fr: 'Confirmée',   ar: 'مؤكد'         },
  { key: 'expediee',   fr: 'Expédiée',    ar: 'تم الشحن'     },
  { key: 'livree',     fr: 'Livrée',      ar: 'تم التسليم'   },
];

const stepIndex = (status: string) => STEPS.findIndex(s => s.key === status);

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
    if (user) fetchOrders();
  }, [user, loading]);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders');
      setOrders(res.data);
    } catch { setOrders([]); }
    finally { setLoadingOrders(false); }
  };

  if (loading || loadingOrders) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        {lang === 'ar' ? 'طلباتي' : 'Mes commandes'}
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package size={48} className="mx-auto mb-3 opacity-40" />
          <p className="text-lg mb-4">{lang === 'ar' ? 'لا توجد طلبات بعد' : 'Aucune commande pour l\'instant'}</p>
          <Link href="/products" className="btn-primary inline-block">
            {lang === 'ar' ? 'تسوق الآن' : 'Commencer mes achats'}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const s = STATUS[order.status as keyof typeof STATUS] || { fr: order.status, ar: order.status, color: 'bg-gray-100 text-gray-600' };
            const isOpen = expanded === order.id;
            const sIdx = stepIndex(order.status);

            return (
              <div key={order.id} className="card overflow-visible">
                <button className="w-full p-4 flex items-center justify-between text-left"
                  onClick={() => setExpanded(isOpen ? null : order.id)}>
                  <div className="flex items-center gap-3">
                    <Package size={20} className="text-pink-500 flex-shrink-0" />
                    <div>
                      <span className="font-mono text-xs text-gray-400">#{order.id}</span>
                      <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                        {order.items?.length} {lang === 'ar' ? 'منتج' : 'article(s)'} · {Number(order.total).toLocaleString('fr-DZ')} DA
                      </p>
                      <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${s.color}`}>
                      {lang === 'ar' ? s.ar : s.fr}
                    </span>
                    {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t dark:border-gray-700 px-4 pb-4 pt-3 space-y-4">
                    {/* Progress bar */}
                    {order.status !== 'annulee' && (
                      <div className="flex items-center gap-1">
                        {STEPS.map((step, i) => (
                          <div key={step.key} className="flex-1 flex flex-col items-center gap-1">
                            <div className={`w-full h-1.5 rounded-full ${i <= sIdx ? 'bg-pink-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                            <span className={`text-xs ${i <= sIdx ? 'text-pink-600 font-medium' : 'text-gray-400'}`}>
                              {lang === 'ar' ? step.ar : step.fr}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Articles */}
                    <div className="space-y-2">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div>
                            <span className="text-gray-800 dark:text-gray-200 font-medium">{item.name}</span>
                            <span className="text-gray-500"> ×{item.quantity}</span>
                            {item.color && <span className="text-pink-500 text-xs ml-1">· {item.color}</span>}
                            {item.size && <span className="text-blue-500 text-xs ml-1">· {item.size}</span>}
                          </div>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {(item.price * item.quantity).toLocaleString('fr-DZ')} DA
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between text-sm font-bold border-t dark:border-gray-700 pt-2">
                      <span className="text-gray-700 dark:text-gray-300">{lang === 'ar' ? 'المجموع' : 'Total'}</span>
                      <span className="text-pink-600">{Number(order.total).toLocaleString('fr-DZ')} DA</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}