import Link from 'next/link';

const LINKS = [
  { label: 'Femme',      href: '/products?category=femme'      },
  { label: 'Homme',      href: '/products?category=homme'      },
  { label: 'Enfant',     href: '/products?category=enfant'     },
  { label: 'Nouveau-né', href: '/products?category=nouveau-ne' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo + description */}
        <div>
          <span className="text-white text-xl font-bold">MaBoutique</span>
          <p className="mt-2 text-sm leading-relaxed">
            Vêtements pour toute la famille.<br />
            Livraison partout en Algérie.
          </p>
        </div>

        {/* Catégories */}
        <div>
          <h4 className="text-white font-semibold mb-3">Catégories</h4>
          <ul className="space-y-2 text-sm">
            {LINKS.map(l => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-pink-400 transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li>📍 Algérie</li>
            <li>📞 +213 XX XX XX XX</li>
            <li>✉️ contact@maboutique.dz</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 text-center py-4 text-xs">
        © {new Date().getFullYear()} MaBoutique — Tous droits réservés
      </div>
    </footer>
  );
}
