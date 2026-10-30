/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PaymentGatewayModal } from './components/PaymentGatewayModal';
import { ReceiptModal } from './components/ReceiptModal';
import { ContributionDayReminderBanner } from './components/ContributionDayReminderBanner';
import { QuickDemoBar } from './components/QuickDemoBar';
import { GeminiAdvisorModal } from './components/GeminiAdvisorModal';
import { VeoVideoStudioModal } from './components/VeoVideoStudioModal';
import { FirebaseAuthModal } from './components/FirebaseAuthModal';
import { HomeView } from './views/HomeView';
import { DashboardView } from './views/DashboardView';
import { CreateTontineView } from './views/CreateTontineView';
import { TontinesListView } from './views/TontinesListView';
import { TontineDetailView } from './views/TontineDetailView';
import { TransactionsView } from './views/TransactionsView';
import { NotificationsView } from './views/NotificationsView';
import { SupportView } from './views/SupportView';
import { HowItWorksView } from './views/HowItWorksView';
import { TermsPrivacyView } from './views/TermsPrivacyView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { BioscienceMutualView } from './views/BioscienceMutualView';
import { Sparkles, MessageSquare, Film } from 'lucide-react';

import { WhatsAppBusinessWidget } from './components/WhatsAppBusinessWidget';
import { FintechAuditModal } from './components/FintechAuditModal';
import { TontineSimulatorModal } from './components/TontineSimulatorModal';
import { MerchantCredentialsModal } from './components/MerchantCredentialsModal';
import { TreasuryStatementModal } from './components/TreasuryStatementModal';

const MainContent: React.FC = () => {
  const { activeView } = useApp();

  return (
    <main className="min-h-[calc(100vh-140px)]">
      {activeView === 'accueil' && <HomeView />}
      {activeView === 'dashboard' && <DashboardView />}
      {activeView === 'creer_tontine' && <CreateTontineView />}
      {activeView === 'catalogue' && <TontinesListView />}
      {activeView === 'details_tontine' && <TontineDetailView />}
      {activeView === 'transactions' && <TransactionsView />}
      {activeView === 'notifications' && <NotificationsView />}
      {activeView === 'assistance' && <SupportView />}
      {activeView === 'fonctionnement' && <HowItWorksView />}
      {activeView === 'cgu' && <TermsPrivacyView />}
      {activeView === 'admin' && <AdminDashboardView />}
      {activeView === 'sante_biomedical' && <BioscienceMutualView />}
    </main>
  );
};

const AppShell: React.FC = () => {
  const {
    isGeminiModalOpen,
    setIsGeminiModalOpen,
    isVeoModalOpen,
    setIsVeoModalOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isAuditModalOpen,
    setIsAuditModalOpen,
    isSimulatorModalOpen,
    setIsSimulatorModalOpen,
    isTreasuryStatementModalOpen,
    setIsTreasuryStatementModalOpen,
    isMerchantModalOpen,
    setIsMerchantModalOpen,
    isLiveMode,
  } = useApp();

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-between text-neutral-900 selection:bg-orange-500 selection:text-white relative">
      <Header />
      <ContributionDayReminderBanner />
      <MainContent />
      <Footer />

      {/* Floating Action Buttons Launcher: Gemini Advisor & Veo 3 Video Studio */}
      <aside aria-label="Outils IA et Vidéo" className="fixed bottom-22 right-5 z-30 flex flex-col gap-2.5 items-end">
        {/* Veo 3 Studio Button */}
        <button
          onClick={() => setIsVeoModalOpen(true)}
          className="group relative flex items-center gap-2 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 border border-neutral-700"
          title="Créer un spot vidéo promotionnel avec Veo 3"
        >
          <Film className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-bold tracking-wide">
            Studio Veo 3
          </span>
          <span className="text-[10px] bg-orange-500/20 text-orange-400 font-mono px-1.5 py-0.5 rounded-full font-bold">
            Vidéo
          </span>
        </button>

        {/* Gemini Advisor Button */}
        <button
          onClick={() => setIsGeminiModalOpen(true)}
          className="group relative flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95"
          title="Discuter avec IVOIRE-CONSEIL propulsé par Gemini (Search, Maps, Micro)"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 text-amber-200 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <span className="text-xs font-extrabold tracking-wide">
            Conseiller Gemini
          </span>
          <span className="text-[10px] bg-black/20 text-white font-mono px-1.5 py-0.5 rounded-full font-bold">
            Search & Maps
          </span>
        </button>
      </aside>

      {/* Official WhatsApp Business Floating Widget (05 86 80 19 59) */}
      <WhatsAppBusinessWidget />

      <PaymentGatewayModal />
      <ReceiptModal />
      <GeminiAdvisorModal
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
      />
      <VeoVideoStudioModal
        isOpen={isVeoModalOpen}
        onClose={() => setIsVeoModalOpen(false)}
      />
      <FirebaseAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      <FintechAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
      <TontineSimulatorModal
        isOpen={isSimulatorModalOpen}
        onClose={() => setIsSimulatorModalOpen(false)}
      />
      <MerchantCredentialsModal
        isOpen={isMerchantModalOpen}
        onClose={() => setIsMerchantModalOpen(false)}
      />
      <TreasuryStatementModal
        isOpen={isTreasuryStatementModalOpen}
        onClose={() => setIsTreasuryStatementModalOpen(false)}
      />
      {!isLiveMode && <QuickDemoBar />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
