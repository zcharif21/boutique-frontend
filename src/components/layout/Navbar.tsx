'use client';
import Link from 'next/link';
import { ShoppingCart, User, Menu, X, LogOut, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';

const CATEGORIES = [
  { label: 'Femme',      slug: 'femme' },
  { label: 'Homme',      slug: 'homme' },
  { label: 'Enfant',     slug: 'enfant' },
  { label: 'Nouveau-né', slug: 'nouveau-ne' },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="text-2xl font-bold text-pink-600">
          Original Uk
        </Link>
        <nav className="hidden md:flex gap-6">
          {CATEGORIES.map(cat => (
            <Link key={cat.slug} href={`/products?category=${cat.slug}`}
              className="text-gray-600 dark:text-gray-300 hover:text-pink-600 transition-colors text-sm font-medium">
              {cat.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            {theme === 'dark'
              ? <Sun size={20} className="text-yellow-400" />
              : <Moon size={20} className="text-gray-600" />}
          </button>
          <Link href="/cart" className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <ShoppingCart size={22} className="text-gray-700 dark:text-gray-200" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <Link href="/admin" className="text-sm text-pink-600 font-medium hover:underline">Admin</Link>
              ) : (
                <Link href="/orders" className="text-sm text-gray-600 dark:text-gray-300 font-medium hover:text-pink-600">
                  Mes commandes
                </Link>
              )}
              <Link href="/profile" className="text-sm text-gray-500 dark:text-gray-300 hover:text-pink-600">
                {user.name}
              </Link>
              <button onClick={logout} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <LogOut size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          ) : (
            <Link href="/auth/login" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <User size={22} className="text-gray-700 dark:text-gray-200" />
            </Link>
          )}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} className="dark:text-gray-200" /> : <Menu size={22} className="dark:text-gray-200" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800 px-4 py-3 flex flex-col gap-3">
          {CATEGORIES.map(cat => (
            <Link key={cat.slug} href={`/products?category=${cat.slug}`}
              onClick={() => setMenuOpen(false)}
              className="text-gray-700 dark:text-gray-300 py-1 hover:text-pink-600">
              {cat.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}