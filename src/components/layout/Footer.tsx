'use client';
import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';

const LINKS = [
  { fr: 'Femme',      ar: 'المرأة',   href: '/products?category=femme'      },
  { fr: 'Homme',      ar: 'الرجل',    href: '/products?category=homme'      },
  { fr: 'Enfant',     ar: 'الأطفال',  href: '/products?category=enfant'     },
  { fr: 'Nouveau-né', ar: 'المواليد', href: '/products?category=nouveau-ne' },
];

export default function Footer() {
  const { lang } = useLang();

  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <span className="text-white text-xl font-bold tracking-wide">Original UK</span>
          <p className="mt-2 text-sm leading-relaxed">
            {lang === 'ar' ? 'ملابس لكل العائلة.' : 'Vêtements pour toute la famille.'}<br />
            {lang === 'ar' ? 'توصيل إلى جميع أنحاء الجزائر.' : 'Livraison partout en Algérie.'}
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">
            {lang === 'ar' ? 'الفئات' : 'Catégories'}
          </h4>
          <ul className="space-y-2 text-sm">
            {LINKS.map(l => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-pink-400 transition-colors">
                  {lang === 'ar' ? l.ar : l.fr}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">
            {lang === 'ar' ? 'تواصل معنا' : 'Contact'}
          </h4>
          <ul className="space-y-2 text-sm">
            <li>{lang === 'ar' ? 'الجزائر' : 'Algérie'}</li>
            <li>+213 XX XX XX XX</li>
            <li>contact@originaluk.dz</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center py-4 text-xs">
        © {new Date().getFullYear()} Original UK — {lang === 'ar' ? 'جميع الحقوق محفوظة' : 'Tous droits réservés'}
      </div>
    </footer>
  );
}