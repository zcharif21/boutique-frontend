'use client';

import Link from 'next/link';
import { ShoppingCart, User, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

const CATEGORIES = [
  { label: 'Femme',      slug: 'femme' },
  { label: 'Homme',      slug: 'homme' },
  { label: 'Enfant',     slug: 'enfant' },
  { label: 'Nouveau-né', slug: 'nouveau-ne' },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-pink-600">
          Original Uk
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden md:flex gap-6">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="text-gray-600 hover:text-pink-600 transition-colors text-sm font-medium"
            >
              {cat.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">

          {/* Panier */}
          <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg">
            <ShoppingCart size={22} className="text-gray-700" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs
                             rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {count}
              </span>
            )}
          </Link>

          {/* Compte */}
          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link href="/admin" className="text-sm text-pink-600 font-medium hover:underline">
                  Admin
                </Link>
              )}
              <button onClick={logout} className="p-2 hover:bg-gray-100 rounded-lg" title="Déconnexion">
                <LogOut size={20} className="text-gray-600" />
              </button>
            </div>
          ) : (
            <Link href="/auth/login" className="p-2 hover:bg-gray-100 rounded-lg">
              <User size={22} className="text-gray-700" />
            </Link>
          )}

          {/* Menu mobile */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-3 flex flex-col gap-3">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              onClick={() => setMenuOpen(false)}
              className="text-gray-700 py-1 hover:text-pink-600"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
