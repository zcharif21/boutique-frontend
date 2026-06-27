'use client';
import Link from 'next/link';
import { ShoppingBag, Truck, Shield, RefreshCw } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

const CATEGORIES = [
  { fr: 'Femme',      ar: 'المرأة',   slug: 'femme',      img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80' },
  { fr: 'Homme',      ar: 'الرجل',    slug: 'homme',      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' },
  { fr: 'Enfant',     ar: 'الأطفال',  slug: 'enfant',     img: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=400&q=80' },
  { fr: 'Nouveau-né', ar: 'المواليد', slug: 'nouveau-ne', img: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&q=80' },
];

export default function HomePage() {
  const { t, lang } = useLang();

  const FEATURES = [
    { icon: Truck,       title: lang === 'ar' ? 'توصيل عبر الجزائر'  : 'Livraison Algérie',  desc: lang === 'ar' ? 'تغطية الولايات الرئيسية' : 'Wilayat principales couvertes' },
    { icon: Shield,      title: lang === 'ar' ? 'دفع آمن'             : 'Paiement sécurisé',  desc: lang === 'ar' ? 'الدفع عند الاستلام'      : 'Paiement à la livraison'       },
    { icon: RefreshCw,   title: lang === 'ar' ? 'إرجاع سهل'           : 'Retour facile',      desc: lang === 'ar' ? '7 أيام لتغيير رأيك'      : "7 jours pour changer d'avis"  },
    { icon: ShoppingBag, title: lang === 'ar' ? 'جودة مضمونة'         : 'Qualité garantie',   desc: lang === 'ar' ? 'منتجات موثوقة'           : 'Articles vérifiés'             },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gray-900 text-white overflow-hidden" style={{ minHeight: '520px' }}>
        <img
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400&q=80"
          alt="Original UK Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative max-w-4xl mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            {t('heroTitle')}<br />
            <span className="text-pink-400">{t('heroSubtitle')}</span>
          </h1>
          <p className="text-gray-300 text-lg mb-8">{t('heroDesc')}</p>
          <Link href="/products" className="btn-primary text-lg px-8 py-3 inline-block">
            {t('heroBtn')}
          </Link>
        </div>
      </section>

      {/* Catégories */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
          {t('categories')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map(cat => (
            <Link key={cat.slug} href={`/products?category=${cat.slug}`}
              className="card overflow-hidden group hover:shadow-md transition-shadow">
              <div className="relative h-48 overflow-hidden">
                <img src={cat.img} alt={lang === 'ar' ? cat.ar : cat.fr}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/30 flex items-end p-3">
                  <h3 className="text-white font-bold text-lg">
                    {lang === 'ar' ? cat.ar : cat.fr}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Avantages */}
      <section className="bg-white dark:bg-gray-800 py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-50 dark:bg-pink-900/30 rounded-xl mb-3">
                <Icon size={24} className="text-pink-600" />
              </div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{title}</h4>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}