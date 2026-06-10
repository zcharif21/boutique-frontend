import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl font-bold text-pink-100 mb-2">404</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Page introuvable</h1>
      <p className="text-gray-500 mb-6">Cette page n'existe pas ou a été déplacée.</p>
      <Link href="/" className="btn-primary px-6 py-2">
        Retour à l'accueil
      </Link>
    </div>
  );
}
