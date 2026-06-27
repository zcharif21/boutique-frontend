'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LanguageContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { t, lang } = useLang();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/api/auth/register', { name: form.name, email: form.email, password: form.password });
      await login(form.email, form.password);
      toast.success(lang === 'ar' ? 'تم إنشاء الحساب !' : 'Compte créé !');
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || (lang === 'ar' ? 'حدث خطأ' : 'Erreur'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">{t('register')}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('name')}</label>
            <input type="text" required className="input"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
            <input type="email" required className="input"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('password')}</label>
            <input type="password" required className="input"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
            {loading ? '...' : t('register')}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
          {lang === 'ar' ? 'لديك حساب؟' : 'Déjà un compte ?'}{' '}
          <Link href="/auth/login" className="text-pink-600 font-medium hover:underline">
            {t('connect')}
          </Link>
        </p>
      </div>
    </div>
  );
}