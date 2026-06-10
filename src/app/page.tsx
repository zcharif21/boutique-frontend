import Link from 'next/link';
import { ShoppingBag, Truck, Shield, RefreshCw } from 'lucide-react';

const CATEGORIES = [
  { label: 'Femme',      slug: 'femme',      emoji: '👗', bg: 'bg-pink-50',   border: 'border-pink-200' },
  { label: 'Homme',      slug: 'homme',      emoji: '👔', bg: 'bg-blue-50',   border: 'border-blue-200' },
  { label: 'Enfant',     slug: 'enfant',     emoji: '🧒', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  { label: 'Nouveau-né', slug: 'nouveau-ne', emoji: '👶', bg: 'bg-green-50',  border: 'border-green-200' },
];

const FEATURES = [
  { icon: Truck,      title: 'Livraison Algérie',   desc: 'Wilayat principales couvertes' },
  { icon: Shield,     title: 'Paiement sécurisé',   desc: 'Paiement à la livraison' },
  { icon: RefreshCw,  title: 'Retour facile',        desc: '7 jours pour changer d\'avis' },
  { icon: ShoppingBag,title: 'Qualité garantie',     desc: 'Articles vérifiés' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-pink-50 to-pink-100 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Votre boutique mode<br />
            <span className="text-pink-600">pour toute la famille</span>
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Femme, Homme, Enfant et Nouveau-né — livraison partout en Algérie
          </p>
          <Link href="/products" className="btn-primary text-lg px-8 py-3 inline-block">
            Voir tous les articles
          </Link>
        </div>
      </section>

      {/* Catégories */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
          Nos catégories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className={`card ${cat.bg} border ${cat.border} p-6 text-center
                         hover:shadow-md transition-shadow group`}
            >
              <div className="text-5xl mb-3">{cat.emoji}</div>
              <h3 className="font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">
                {cat.label}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Avantages */}
      <section className="bg-white py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12
                              bg-pink-50 rounded-xl mb-3">
                <Icon size={24} className="text-pink-600" />
              </div>
              <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>
              <p className="text-gray-500 text-xs mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
