'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LanguageContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { t, lang } = useLang();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(form.email, form.password);
      toast.success(lang === 'ar' ? 'مرحباً !' : 'Bienvenue !');
      router.push('/');
    } catch (err: any) {
      toast.error(lang === 'ar' ? 'البريد أو كلمة المرور غير صحيحة' : 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">{t('login')}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? '...' : t('connect')}
          </button>
        </form>
        <p className="text-center text-sm mt-3">
          <Link href="/auth/forgot-password" className="text-gray-500 hover:text-pink-600">
            {t('forgotPassword')}
          </Link>
        </p>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
          {t('noAccount')}{' '}
          <Link href="/auth/register" className="text-pink-600 font-medium hover:underline">
            {t('register')}
          </Link>
        </p>
      </div>
    </div>
  );
}