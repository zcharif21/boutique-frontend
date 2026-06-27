'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

type Lang = 'fr' | 'ar';

const translations = {
  fr: {
    // Navbar
    myOrders: 'Mes commandes',
    admin: 'Admin',
    logout: 'Déconnexion',
    // Home
    heroTitle: 'Votre boutique mode',
    heroSubtitle: 'pour toute la famille',
    heroDesc: 'Femme, Homme, Enfant et Nouveau-né — livraison partout en Algérie',
    heroBtn: 'Voir tous les articles',
    categories: 'Nos catégories',
    // Products
    all: 'Tous',
    search: 'Rechercher...',
    noProducts: 'Aucun produit trouvé',
    addToCart: 'Ajouter',
    outOfStock: 'Rupture de stock',
    inStock: 'En stock',
    lastOne: "Plus qu'un seul en stock !",
    // Cart
    myCart: 'Mon panier',
    cartEmpty: 'Votre panier est vide',
    seeProducts: 'Voir les articles',
    total: 'Total',
    deliveryInfo: 'Informations de livraison',
    address: 'Adresse complète *',
    phone: 'Téléphone *',
    notes: 'Notes (optionnel)',
    confirmOrder: 'Confirmer la commande',
    processing: 'Traitement...',
    // Auth
    login: 'Connexion',
    email: 'Email',
    password: 'Mot de passe',
    connect: 'Se connecter',
    noAccount: "Pas de compte ?",
    register: "S'inscrire",
    forgotPassword: 'Mot de passe oublié ?',
    // Profile
    myProfile: 'Mon profil',
    name: 'Nom',
    save: 'Enregistrer',
    // Orders
    myOrdersTitle: 'Mes commandes',
    orderNum: 'Commande',
    status: 'Statut',
    date: 'Date',
  },
  ar: {
    // Navbar
    myOrders: 'طلباتي',
    admin: 'الإدارة',
    logout: 'تسجيل الخروج',
    // Home
    heroTitle: 'متجرك للأزياء',
    heroSubtitle: 'للعائلة بأكملها',
    heroDesc: 'ملابس المرأة، الرجل، الأطفال والمواليد — توصيل إلى جميع أنحاء الجزائر',
    heroBtn: 'عرض جميع المنتجات',
    categories: 'فئاتنا',
    // Products
    all: 'الكل',
    search: 'بحث...',
    noProducts: 'لا توجد منتجات',
    addToCart: 'إضافة',
    outOfStock: 'نفدت الكمية',
    inStock: 'متوفر',
    lastOne: 'آخر قطعة !',
    // Cart
    myCart: 'سلة التسوق',
    cartEmpty: 'سلة التسوق فارغة',
    seeProducts: 'عرض المنتجات',
    total: 'المجموع',
    deliveryInfo: 'معلومات التوصيل',
    address: 'العنوان الكامل *',
    phone: 'الهاتف *',
    notes: 'ملاحظات (اختياري)',
    confirmOrder: 'تأكيد الطلب',
    processing: 'جارٍ المعالجة...',
    // Auth
    login: 'تسجيل الدخول',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    connect: 'تسجيل الدخول',
    noAccount: 'ليس لديك حساب؟',
    register: 'إنشاء حساب',
    forgotPassword: 'نسيت كلمة المرور؟',
    // Profile
    myProfile: 'ملفي الشخصي',
    name: 'الاسم',
    save: 'حفظ',
    // Orders
    myOrdersTitle: 'طلباتي',
    orderNum: 'طلب',
    status: 'الحالة',
    date: 'التاريخ',
  },
};

type TranslationKey = keyof typeof translations.fr;

const LanguageContext = createContext<{
  lang: Lang;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
}>({ lang: 'fr', toggleLang: () => {}, t: (k) => k });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('fr');

  const toggleLang = () => setLang(l => l === 'fr' ? 'ar' : 'fr');
  const t = (key: TranslationKey) => translations[lang][key] || translations.fr[key];

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);