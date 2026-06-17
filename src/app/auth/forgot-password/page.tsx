'use client';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const whatsappNumber = '213554139502'; // ← mets ton numéro ici (format international sans +)
  const message = encodeURIComponent("Bonjour, j'ai oublié mon mot de passe pour Original UK.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md text-center">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-pink-600 mb-6 text-sm">
          <ArrowLeft size={16} /> Retour
        </Link>

        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle size={32} className="text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-3">Mot de passe oublié ?</h1>
        <p className="text-gray-500 text-sm mb-6">
          Contactez-nous sur WhatsApp, on réinitialisera votre mot de passe rapidement.
        </p>

        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
          className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base">
          <MessageCircle size={20} />
          Contacter sur WhatsApp
        </a>

        <p className="text-xs text-gray-400 mt-4">
          Disponible tous les jours de 9h à 21h
        </p>
      </div>
    </div>
  );
}