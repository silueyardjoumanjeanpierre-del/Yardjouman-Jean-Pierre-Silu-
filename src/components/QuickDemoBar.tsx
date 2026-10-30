import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA } from '../utils/formatters';
import {
  Zap,
  PlusCircle,
  Smartphone,
  CheckCircle2,
  BellRing,
  ArrowDownToLine,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Film,
  FileCheck2,
} from 'lucide-react';

export const QuickDemoBar: React.FC = () => {
  const {
    currentUser,
    tontines,
    createTontine,
    submitContributionPayment,
    distributeRoundPayout,
    performAdminWithdrawal,
    triggerAutomatedReminders,
    setActiveView,
    setSelectedTontineId,
    setIsGeminiModalOpen,
    setIsVeoModalOpen,
    setIsAuditModalOpen,
    setIsLiveMode,
    settings,
  } = useApp();

  const [isExpanded, setIsExpanded] = useState(true);
  const [lastActionNotice, setLastActionNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setLastActionNotice(msg);
    setTimeout(() => setLastActionNotice(null), 3500);
  };

  // 1. Create express tontine in 1 click
  const handleExpressCreate = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const newT = createTontine(
      {
        name: `Tontine Express Démo #${randomNum}`,
        category: 'Commerce & Stock Marchandise',
        description: 'Tontine de test créée en 1 clic pour démonstration rapide.',
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        creatorPhone: currentUser.phone,
        contributionAmount: 20000,
        frequency: 'mensuelle',
        participantsCount: 5,
        durationMonths: 5,
        rules: 'Règlement express sans délai pour test.',
        payoutStrategy: 'tirage_transparent',
        status: 'active',
        commissionRate: settings.commissionRate,
        isPublic: true,
        participants: [
          {
            id: `tp_1_${Date.now()}`,
            userId: currentUser.id,
            name: currentUser.name,
            phone: currentUser.phone,
            orderPosition: 1,
            payoutDate: 'Tour 1',
            hasReceivedPayout: false,
            contributionsPaidCount: 0,
            isCurrentTurn: true,
          },
          {
            id: `tp_2_${Date.now()}`,
            userId: 'user_kouassi',
            name: 'Jean-Marc Kouassi',
            phone: '+225 05 44 89 21 00',
            orderPosition: 2,
            payoutDate: 'Tour 2',
            hasReceivedPayout: false,
            contributionsPaidCount: 0,
            isCurrentTurn: false,
          },
        ],
        rounds: [],
        nextDueDate: '2026-11-05',
      },
      `TXN-EXPRESS-FEE-${Date.now()}`
    );

    setSelectedTontineId(newT.id);
    setActiveView('details_tontine');
    showToast(`⚡ Tontine Express créée ! Frais de 1 000 FCFA validés.`);
  };

  // 2. Pay current contribution in 1 click
  const handleExpressPay = () => {
    const activeT = tontines.find((t) => t.status === 'active');
    if (!activeT) {
      showToast('Aucune tontine active.');
      return;
    }

    submitContributionPayment(
      activeT.id,
      activeT.currentRound,
      'wave',
      currentUser.phone
    );

    setSelectedTontineId(activeT.id);
    setActiveView('details_tontine');
    showToast(`⚡ Cotisation de ${formatFCFA(activeT.contributionAmount)} payée en 1 clic via Wave !`);
  };

  // 3. Payout pot in 1 click
  const handleExpressPayout = () => {
    const activeT = tontines.find((t) => t.status === 'active');
    if (!activeT) {
      showToast('Aucune tontine active.');
      return;
    }

    distributeRoundPayout(activeT.id, activeT.currentRound);
    setSelectedTontineId(activeT.id);
    setActiveView('details_tontine');
    showToast(`⚡ Cagnotte du Tour ${activeT.currentRound} (${formatFCFA(activeT.netPayout)} nets) versée au bénéficiaire !`);
  };

  // 4. Trigger automated reminders in 1 click
  const handleExpressReminders = () => {
    const res = triggerAutomatedReminders();
    showToast(`⚡ ${res.count} messages automatiques (SMS & WhatsApp) envoyés aux membres !`);
  };

  // 5. Admin withdrawal in 1 click
  const handleExpressAdminWithdrawal = () => {
    const res = performAdminWithdrawal({
      amount: 10000,
      sourceType: 'total_disponible',
      destinationType: 'mobile_money_pro',
      destinationAccount: '+225 01 02 03 04 05',
      destinationEntity: 'Wave Business CI',
      pin: '2026',
    });

    if (res.success) {
      setActiveView('admin');
      showToast(`⚡ Retrait Admin de 10 000 FCFA exécuté vers Wave Business CI !`);
    } else {
      showToast(res.error || 'Erreur retrait.');
    }
  };

  return (
    <>
      {/* Toast alert */}
      {lastActionNotice && (
        <div className="fixed top-20 right-5 z-50 bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-neutral-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{lastActionNotice}</span>
        </div>
      )}

      {/* Floating Bottom Quick Bar */}
      <aside aria-label="Mode Démo Rapide" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-4xl w-[95%] sm:w-auto">
        <div className="bg-neutral-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-neutral-700 p-2 sm:p-2.5 transition-all">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 pl-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-black tracking-wider text-amber-400 uppercase font-mono">
                Démo Rapide
              </span>
            </div>

            {/* Quick 1-Click Action Buttons */}
            {isExpanded && (
              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
                <button
                  onClick={handleExpressCreate}
                  className="px-2.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-[11px] font-bold transition-colors flex items-center gap-1 whitespace-nowrap"
                  title="Créer une tontine instantanément avec frais payés"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Créer Tontine (1-Clic)</span>
                </button>

                <button
                  onClick={handleExpressPay}
                  className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-xl text-[11px] font-semibold border border-neutral-700 transition-colors flex items-center gap-1 whitespace-nowrap"
                  title="Payer la cotisation due immédiatement"
                >
                  <Smartphone className="w-3.5 h-3.5 text-orange-400" />
                  <span>Payer Cotisation (1-Clic)</span>
                </button>

                <button
                  onClick={handleExpressPayout}
                  className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-[11px] font-semibold transition-colors flex items-center gap-1 whitespace-nowrap"
                  title={`Verser la cagnotte au bénéficiaire en déduisant ${(settings.commissionRate * 100).toFixed(0)}% de commission`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Débloquer Cagnotte (1-Clic)</span>
                </button>

                <button
                  onClick={handleExpressReminders}
                  className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-xl text-[11px] font-semibold border border-neutral-700 transition-colors flex items-center gap-1 whitespace-nowrap"
                  title="Envoyer les SMS et WhatsApp de relance"
                >
                  <BellRing className="w-3.5 h-3.5 text-amber-400" />
                  <span>Envoyer Rappels SMS</span>
                </button>

                <button
                  onClick={handleExpressAdminWithdrawal}
                  className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-xl text-[11px] font-semibold border border-neutral-700 transition-colors flex items-center gap-1 whitespace-nowrap"
                  title="Retirer 10 000 FCFA de revenus administrateur"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Retirer 10k Admin</span>
                </button>

                <button
                  onClick={() => setIsGeminiModalOpen(true)}
                  className="px-2.5 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-[11px] font-extrabold transition-all flex items-center gap-1 whitespace-nowrap shadow-xs"
                  title="Ouvrir l'assistant intelligent IVOIRE-CONSEIL (Search, Maps, Micro)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>IA Gemini (1-Clic)</span>
                </button>

                <button
                  onClick={() => setIsVeoModalOpen(true)}
                  className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-xl text-[11px] font-semibold border border-neutral-700 transition-colors flex items-center gap-1 whitespace-nowrap"
                  title="Créer un spot vidéo promotionnel avec Veo 3"
                >
                  <Film className="w-3.5 h-3.5 text-orange-400" />
                  <span>Studio Veo 3</span>
                </button>

                <button
                  onClick={() => setIsAuditModalOpen(true)}
                  className="px-2.5 py-1.5 bg-[#075E54] hover:bg-[#064e46] text-white rounded-xl text-[11px] font-bold border border-[#25D366]/40 transition-colors flex items-center gap-1 whitespace-nowrap shadow-xs"
                  title="Consulter l'audit fintech, conformité UEMOA et diagnostic WhatsApp Business 05 86 80 19 59"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>Audit & WhatsApp</span>
                </button>

                <button
                  onClick={() => setIsLiveMode(true)}
                  className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[11px] font-black transition-colors flex items-center gap-1 whitespace-nowrap shadow-xs"
                  title="Masquer tous les outils de test et basculer en mode production réel"
                >
                  <span>Quitter Mode Démo &rarr;</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors ml-1"
              title={isExpanded ? 'Réduire la barre' : 'Agrandir la barre'}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
