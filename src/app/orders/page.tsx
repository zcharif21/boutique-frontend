'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Order } from '@/types';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  en_attente: { label: 'En attente',  color: 'bg-yellow-100 text-yellow-700' },
  confirmee:  { label: 'Confirmée',   color: 'bg-blue-100 text-blue-700'   },
  expediee:   { label: 'Expédiée',    color: 'bg-purple-100 text-purple-700' },
  livree:     { label: 'Livrée',      color: 'bg-green-100 text-green-700'  },
  annulee:    { label: 'Annulée',     color: 'bg-red-100 text-red-600'      },
};

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders]   = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const res = await api.get('/api/orders');
        setOrders(res.data);
      } catch {
        toast.error('Erreur lors du chargement des commandes');
      } finally {
        setFetching(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (loading || fetching) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-5 animate-pulse h-20 bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mes commandes</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package size={48} className="mx-auto mb-3 opacity-40" />
          <p>Aucune commande pour l'instant</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const st = STATUS_LABEL[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600' };
            const isOpen = expanded === order.id;

            return (
              <div key={order.id} className="card overflow-hidden">
                {/* En-tête commande */}
                <button
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 font-mono text-sm">#{order.id}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${st.color}`}>
                      {st.label}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'long', year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-pink-600">
                      {Number(order.total).toLocaleString('fr-DZ')} DA
                    </span>
                    {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </button>

                {/* Détails (accordéon) */}
                {isOpen && (
                  <div className="border-t px-5 py-4 bg-gray-50 space-y-3">
                    {order.address && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Adresse :</span> {order.address}
                      </p>
                    )}
                    {order.phone && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Téléphone :</span> {order.phone}
                      </p>
                    )}
                    {order.items && order.items.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Articles :</p>
                        <div className="space-y-1">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm text-gray-600">
                              <span>{item.name || `Produit #${item.product_id}`} × {item.quantity}</span>
                              <span>{(Number(item.unit_price) * item.quantity).toLocaleString('fr-DZ')} DA</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
