import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  Bell,
  PlusCircle,
  Users,
  Wallet,
  Settings,
  ChevronDown,
  UserCheck,
  Menu,
  X,
  FileText,
  HelpCircle,
  Layers,
  Sparkles,
  Database,
  HeartPulse,
  Film,
  MessageCircle,
  FileCheck2,
  CheckCircle2,
  Calculator,
} from 'lucide-react';
import { WHATSAPP_BUSINESS_DISPLAY, getWhatsAppBusinessLink } from '../utils/whatsapp';

export const Header: React.FC = () => {
  const {
    currentUser,
    users,
    setCurrentUserById,
    activeView,
    setActiveView,
    notifications,
    settings,
    setIsGeminiModalOpen,
    setIsVeoModalOpen,
    setIsAuthModalOpen,
    setIsAuditModalOpen,
    setIsSimulatorModalOpen,
    isLiveMode,
    setIsLiveMode,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { id: 'accueil', label: 'Accueil' },
    { id: 'catalogue', label: 'Tontines' },
    { id: 'sante_biomedical', label: 'Santé & Bio' },
    { id: 'fonctionnement', label: 'Fonctionnement' },
    { id: 'assistance', label: 'Assistance & Litiges' },
    { id: 'cgu', label: 'Conformité' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      {/* Top Banner indicating Production / Sandbox & WhatsApp contact */}
      <div className="bg-neutral-900 text-white text-xs py-1.5 px-4 text-center flex flex-wrap items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-bold text-emerald-400">
          {isLiveMode ? 'Production Sécurisée CI & UEMOA' : 'Sandbox Démo UEMOA'}
        </span>
        <span className="text-neutral-500">·</span>
        <span className="text-neutral-300">
          Mobile Money (Wave, Orange, MTN, Moov) · Com : {(settings.commissionRate * 100).toFixed(0)}%
        </span>
        <span className="text-neutral-500">·</span>
        <a
          href={getWhatsAppBusinessLink('Bonjour IVOIRETONTINE, je vous contacte depuis la bannière officielle.')}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#25D366] hover:underline font-mono font-bold flex items-center gap-1"
        >
          <MessageCircle className="w-3 h-3 fill-[#25D366]" />
          <span>WhatsApp : {WHATSAPP_BUSINESS_DISPLAY}</span>
        </a>
        <span className="text-neutral-500">·</span>
        <button
          onClick={() => setIsAuditModalOpen(true)}
          className="text-orange-400 hover:text-orange-300 underline font-semibold cursor-pointer"
        >
          Audit de Sécurité
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setActiveView('accueil');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-emerald-600 flex items-center justify-center text-white shadow-sm shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <span className="font-extrabold text-lg tracking-wider">IT</span>
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-neutral-950 flex items-center gap-1">
                  IVOIRE<span className="text-orange-600">TONTINE</span>
                </span>
                <span className="block text-[10px] text-neutral-500 font-medium tracking-wider uppercase">
                  Épargne & Tontine Côte d'Ivoire
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (single line, clean typography) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-600">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`transition-colors whitespace-nowrap py-1 relative ${
                  activeView === item.id
                    ? 'text-orange-600 font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {item.label}
                {activeView === item.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-full" />
                )}
              </button>
            ))}

            {/* Interactive Tontine Simulator */}
            <button
              onClick={() => setIsSimulatorModalOpen(true)}
              className="transition-colors whitespace-nowrap py-1 flex items-center gap-1.5 text-neutral-600 hover:text-neutral-900"
              title="Calculer les gains, cagnottes et économies vs microcrédit"
            >
              <Calculator className="w-3.5 h-3.5 text-orange-600" />
              <span>Simulateur</span>
            </button>

            {/* Direct link to user wallet & dashboard */}
            <button
              onClick={() => setActiveView('dashboard')}
              className={`transition-colors whitespace-nowrap py-1 flex items-center gap-1.5 relative ${
                activeView === 'dashboard'
                  ? 'text-emerald-700 font-bold'
                  : 'text-neutral-600 hover:text-neutral-900 font-medium'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mon Portefeuille</span>
            </button>

            {/* Direct link to Admin & Revenue Withdrawals */}
            <button
              onClick={() => setActiveView('admin')}
              className={`transition-colors whitespace-nowrap py-1 flex items-center gap-1.5 ${
                activeView === 'admin'
                  ? 'text-orange-600 font-bold'
                  : 'text-neutral-700 hover:text-neutral-900 font-medium'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-orange-600" />
              <span>Administration</span>
              <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-1.5 py-0.5 rounded-full">
                Revenus & Retraits
              </span>
            </button>
          </nav>

          {/* Zone 3: Primary Action & Profile Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            {/* WhatsApp Business direct link */}
            <a
              href={getWhatsAppBusinessLink('Bonjour IVOIRETONTINE, je souhaite échanger avec un conseiller.')}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-bold transition-all shadow-xs"
              title={`WhatsApp Business : ${WHATSAPP_BUSINESS_DISPLAY}`}
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-[#25D366]" />
              <span className="font-mono">05 86 80 19 59</span>
            </a>

            {/* Create Tontine Button */}
            <button
              onClick={() => setActiveView('creer_tontine')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm transition-all whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Créer une tontine (1 000 F)</span>
            </button>

            {/* Gemini Chatbot Advisor Button */}
            <button
              onClick={() => setIsGeminiModalOpen(true)}
              className="px-2.5 py-1.5 text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              title="Discuter avec IVOIRE-CONSEIL Gemini (Search, Maps, Micro)"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span className="hidden md:inline">Conseiller IA</span>
            </button>

            {/* Veo 3 Video Studio Button */}
            <button
              onClick={() => setIsVeoModalOpen(true)}
              className="px-2.5 py-1.5 text-neutral-800 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs"
              title="Générer des spots vidéo promotionnels avec Veo 3"
            >
              <Film className="w-3.5 h-3.5 text-orange-600" />
              <span className="hidden lg:inline">Studio Veo 3</span>
            </button>

            {/* Google Sign-In & Firebase Auth Button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              title="Sécurité Firebase & Connexion Google (Firestore activé et provisionné)"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Firebase Actif</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => setActiveView('notifications')}
              className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-orange-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* User Account / Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 pl-2.5 pr-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0 border border-white shadow-xs">
                  {currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div className="hidden md:block">
                  <div className="text-xs font-bold text-neutral-900 truncate max-w-[130px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] flex items-center gap-1 font-semibold">
                    {currentUser.role === 'admin' ? (
                      <span className="text-orange-600 font-extrabold flex items-center gap-0.5">
                        <Shield className="w-2.5 h-2.5" />
                        Super Admin
                      </span>
                    ) : (
                      <span className="text-neutral-500">Participant</span>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {/* User Account Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-neutral-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Super Admin Identity Card */}
                  <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50/80 -mt-3 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-orange-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                        SY
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-neutral-900 truncate">
                            {currentUser.name}
                          </span>
                          <span className="text-[9px] bg-orange-100 text-orange-800 font-bold px-1.5 py-0.2 rounded font-mono">
                            ADMIN
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 font-mono truncate">
                          {currentUser.email}
                        </p>
                        <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp : {WHATSAPP_BUSINESS_DISPLAY}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Shortcuts */}
                  <div className="px-2 py-2 space-y-1">
                    <button
                      onClick={() => {
                        setActiveView('admin');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-orange-50 text-neutral-800 hover:text-orange-950 font-bold text-xs flex items-center gap-2 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-orange-600" />
                      <span>Espace Direction & Trésorerie Admin</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveView('dashboard');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-neutral-50 text-neutral-700 font-semibold text-xs flex items-center gap-2 transition-colors"
                    >
                      <Wallet className="w-4 h-4 text-emerald-600" />
                      <span>Mon Portefeuille & Cagnottes</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsAuditModalOpen(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-neutral-50 text-neutral-700 font-semibold text-xs flex items-center gap-2 transition-colors"
                    >
                      <FileCheck2 className="w-4 h-4 text-emerald-600" />
                      <span>Rapport d'Audit & Conformité</span>
                    </button>
                  </div>

                  {/* Mode Réel / Mode Démo Switcher */}
                  <div className="mx-3 my-2 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-neutral-900 block">
                          {isLiveMode ? 'Mode Production Réel' : 'Mode Démo Actif'}
                        </span>
                        <span className="text-[10px] text-neutral-500 block">
                          {isLiveMode ? 'Barre de test masquée' : 'Barre de test affichée'}
                        </span>
                      </div>
                      <button
                        onClick={() => setIsLiveMode(!isLiveMode)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                          isLiveMode
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-neutral-200 text-neutral-800 border-neutral-300'
                        }`}
                      >
                        {isLiveMode ? 'Passer en Démo' : 'Passer en Réel'}
                      </button>
                    </div>
                  </div>

                  {/* Switch to member accounts (optional testing) */}
                  <div className="px-3 pt-2 border-t border-neutral-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Tester en tant que membre :
                    </p>
                    <div className="space-y-1">
                      {users
                        .filter((u) => u.id !== currentUser.id)
                        .map((u) => (
                          <button
                            key={u.id}
                            onClick={() => {
                              setCurrentUserById(u.id);
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs hover:bg-neutral-50 flex items-center justify-between text-neutral-600 hover:text-neutral-900"
                          >
                            <span className="truncate">{u.name} ({u.city})</span>
                            <span className="text-[10px] text-neutral-400 font-mono">Simuler</span>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                activeView === item.id
                  ? 'bg-orange-50 text-orange-600 font-semibold'
                  : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {item.label}
            </button>
          ))}

          <button
            onClick={() => {
              setIsSimulatorModalOpen(true);
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-orange-700 bg-orange-50/60 hover:bg-orange-100 flex items-center gap-2"
          >
            <Calculator className="w-4 h-4 text-orange-600" />
            <span>Simulateur d'Épargne & Cagnottes</span>
          </button>

          <button
            onClick={() => {
              setActiveView('dashboard');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-2"
          >
            <Wallet className="w-4 h-4 text-emerald-600" />
            <span>Mon Portefeuille & Cagnottes</span>
          </button>

          <button
            onClick={() => {
              setActiveView('admin');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-neutral-900 bg-orange-50/80 hover:bg-orange-100/80 flex items-center justify-between border border-orange-200"
          >
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-600" />
              <span>Console Administration & Retraits</span>
            </span>
            <span className="text-[10px] bg-orange-600 text-white font-bold px-2 py-0.5 rounded-full">
              Revenus
            </span>
          </button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                setIsGeminiModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="py-2 px-3 text-center text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>Conseiller IA</span>
            </button>
            <button
              onClick={() => {
                setIsAuthModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="py-2 px-3 text-center text-xs font-semibold text-neutral-800 bg-neutral-100 border border-neutral-200 rounded-lg flex items-center justify-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Google Auth</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setActiveView('creer_tontine');
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-center text-xs font-semibold text-white bg-orange-600 rounded-lg shadow-sm"
            >
              + Créer une tontine (1 000 FCFA)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
