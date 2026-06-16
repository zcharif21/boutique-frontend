'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Package, ShoppingBag, MapPin, Phone, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

const STATUS_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  confirmee:  'Confirmée',
  expediee:   'Expédiée',
  livree:     'Livrée',
  annulee:    'Annulée',
};

const STATUS_COLORS: Record<string, string> = {
  en_attente: 'bg-yellow-100 text-yellow-700',
  confirmee:  'bg-blue-100 text-blue-700',
  expediee:   'bg-purple-100 text-purple-700',
  livree:     'bg-green-100 text-green-700',
  annulee:    'bg-red-100 text-red-600',
};

const STATUS_STEPS = ['en_attente', 'confirmee', 'expediee', 'livree'];

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [orders, setOrders]     = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      api.get('/api/orders')
        .then(r => setOrders(r.data))
        .catch(() => {})
        .finally(() => setFetching(false));
    }
  }, [user]);

  if (loading || fetching) {
    return <div className="flex items-center justify-center min-h-screen text-gray-400">Chargement...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-400">
        <ShoppingBag size={56} className="mx-auto mb-4 opacity-40" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">Aucune commande</h2>
        <p className="text-sm mb-6">Vous n'avez pas encore passé de commande.</p>
        <Link href="/products" className="btn-primary inline-block">Voir les produits</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mes commandes</h1>

      <div className="space-y-4">
        {orders.map(order => {
          const isExpanded = expanded === order.id;
          const isCancelled = order.status === 'annulee';
          const stepIndex = STATUS_STEPS.indexOf(order.status);

          return (
            <div key={order.id} className="card overflow-hidden">
              {/* En-tête commande */}
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(isExpanded ? null : order.id)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <ShoppingBag size={18} className="text-pink-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">Commande #{order.id}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                  <span className="font-bold text-pink-600">{order.total?.toLocaleString('fr-DZ')} DA</span>
                  {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>

              {/* Détails dépliables */}
              {isExpanded && (
                <div className="border-t px-4 pb-5 pt-4 space-y-5">

                  {/* Barre de progression */}
                  {!isCancelled && (
                    <div className="mb-2">
                      <div className="flex justify-between mb-2">
                        {STATUS_STEPS.map((step, i) => (
                          <div key={step} className="flex flex-col items-center flex-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1
                              ${i <= stepIndex ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                              {i < stepIndex ? '✓' : i + 1}
                            </div>
                            <span className={`text-[10px] text-center leading-tight
                              ${i <= stepIndex ? 'text-pink-600 font-medium' : 'text-gray-400'}`}>
                              {STATUS_LABELS[step]}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="relative h-1.5 bg-gray-200 rounded-full mx-3">
                        <div
                          className="absolute h-1.5 bg-pink-500 rounded-full transition-all"
                          style={{ width: `${stepIndex >= 0 ? (stepIndex / (STATUS_STEPS.length - 1)) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Articles */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">🛍️ Articles</h3>
                    <div className="space-y-2">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                          {item.image_url ? (
                            <Image src={item.image_url} alt={item.name} width={48} height={48}
                              className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Package size={18} className="text-gray-400" />
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
                              <span className="inline-flex items-center bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                                x{item.quantity}
                              </span>
                            </div>
                          </div>
                          <p className="font-bold text-pink-600 text-sm whitespace-nowrap">
                            {(item.unit_price * item.quantity).toLocaleString('fr-DZ')} DA
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Infos livraison */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">📦 Livraison</h3>
                    {order.address && (
                      <p className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin size={14} className="text-pink-500 mt-0.5 flex-shrink-0" /> {order.address}
                      </p>
                    )}
                    {order.phone && (
                      <p className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} className="text-pink-500" /> {order.phone}
                      </p>
                    )}
                    {order.notes && (
                      <p className="flex items-start gap-2 text-sm text-gray-500 italic">
                        <FileText size={14} className="mt-0.5 flex-shrink-0" /> {order.notes}
                      </p>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center border-t pt-3">
                    <span className="text-sm text-gray-500">Total</span>
                    <span className="text-xl font-bold text-pink-600">{order.total?.toLocaleString('fr-DZ')} DA</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}