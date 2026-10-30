import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA } from '../utils/formatters';
import {
  BellRing,
  Smartphone,
  MessageSquare,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
  Send,
} from 'lucide-react';

export const ContributionDayReminderBanner: React.FC = () => {
  const {
    activeDueToast,
    dismissDueToast,
    openPaymentModal,
    triggerAutomatedReminders,
    currentUser,
    automatedReminders,
  } = useApp();

  const [isSmsPreviewOpen, setIsSmsPreviewOpen] = useState(false);
  const [dispatchNotificationMsg, setDispatchNotificationMsg] = useState('');

  if (!activeDueToast || !activeDueToast.isOpen) {
    return null;
  }

  const { tontine, amount, roundNumber } = activeDueToast;

  const handlePayNow = () => {
    openPaymentModal({
      title: `Cotisation Tour ${roundNumber} : ${tontine.name}`,
      amount: amount,
      type: 'cotisation',
      tontineId: tontine.id,
      roundNumber: roundNumber,
      onSuccess: () => {
        dismissDueToast();
      },
    });
  };

  const handleManualTriggerTest = () => {
    const res = triggerAutomatedReminders(tontine.id);
    setDispatchNotificationMsg(
      `${res.count} messages automatiques (SMS & WhatsApp) viennent d'être diffusés aux membres de "${tontine.name}" pour le Tour ${roundNumber}.`
    );
    setTimeout(() => setDispatchNotificationMsg(''), 5000);
  };

  return (
    <>
      {/* Top Floating Alert Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white shadow-xl border-b border-orange-500/30 sticky top-16 z-30 animate-in slide-in-from-top-4 duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Left: Message info */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 text-white animate-bounce">
                <BellRing className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white text-orange-700 px-2 py-0.5 rounded-full font-mono">
                    Message Automatique du Jour J
                  </span>
                  <span className="text-xs text-orange-100 hidden md:inline">
                    · Échéance aujourd’hui ({tontine.nextDueDate})
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-white">
                  Bonjour {currentUser.name}, c'est le jour de cotisation pour « {tontine.name} » !
                </p>
                <p className="text-[11px] text-orange-100">
                  Montant à régler : <strong className="text-white font-mono">{formatFCFA(amount)}</strong> (Tour {roundNumber}). Un SMS & WhatsApp ont été envoyés à votre numéro.
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={() => setIsSmsPreviewOpen(true)}
                className="px-3 py-1.5 bg-black/25 hover:bg-black/40 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                title="Voir le SMS et WhatsApp automatique"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Voir message SMS/WhatsApp</span>
              </button>

              <button
                onClick={handlePayNow}
                className="px-4 py-1.5 bg-white text-orange-700 hover:bg-orange-50 text-xs font-extrabold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>Régler ma cotisation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={dismissDueToast}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-1"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation feedback when manual trigger dispatched */}
      {dispatchNotificationMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-neutral-700 text-xs flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{dispatchNotificationMsg}</span>
        </div>
      )}

      {/* Modal: Visual Preview of Simulated Carrier SMS & WhatsApp */}
      {isSmsPreviewOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-neutral-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-sm">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">
                    Messages Automatiques Diffusés
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Expéditeur : IVOIRETONTINE · Envoi le jour de chaque échéance
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSmsPreviewOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* SMS Simulator Card */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-orange-600" />
                    <span>Aperçu SMS Téléphone (Opérateurs CI)</span>
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    Délivré ✓
                  </span>
                </div>

                <div className="bg-neutral-100 rounded-2xl p-4 border border-neutral-200 space-y-2">
                  <div className="flex justify-between text-[11px] text-neutral-500 font-mono">
                    <span>De : IVOIRETONTINE</span>
                    <span>À : {currentUser.phone}</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl shadow-xs border border-neutral-200/80 text-xs text-neutral-800 leading-relaxed font-sans">
                    « IVOIRETONTINE : Bonjour <strong>{currentUser.name}</strong>, aujourd'hui est le jour de cotisation pour "<strong>{tontine.name}</strong>" (Tour {roundNumber}). Montant : <strong>{formatFCFA(amount)}</strong>. Merci de régler votre tour via Wave ou Orange Money en cliquant sur votre lien sécurisé. »
                  </div>
                  <div className="text-[10px] text-neutral-400 text-right">
                    Horodatage d’envoi automatique : Aujourd'hui à 08h00 GMT
                  </div>
                </div>
              </div>

              {/* WhatsApp Simulator Card */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Aperçu Notification WhatsApp Entreprise</span>
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    Délivré ✓
                  </span>
                </div>

                <div className="bg-[#EFEAE2] rounded-2xl p-4 border border-neutral-300/80 space-y-2">
                  <div className="bg-white p-3.5 rounded-xl shadow-xs border border-neutral-200 text-xs text-neutral-800 leading-relaxed">
                    <p className="font-bold text-emerald-800">🔔 Rappel Automatique de Cotisation</p>
                    <p className="mt-1">
                      Bonjour <strong>{currentUser.name}</strong>,<br />
                      Nous vous informons qu'aujourd'hui est le jour officiel de versement pour votre groupe <strong>{tontine.name}</strong>.
                    </p>
                    <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px]">
                      <div>💰 Montant à payer : <strong>{formatFCFA(amount)}</strong></div>
                      <div>📅 Échéance : {tontine.nextDueDate}</div>
                      <div>👥 Bénéficiaire du tour : Jean-Marc Kouassi</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions in modal */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleManualTriggerTest}
                  className="w-1/2 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Tester Ré-envoi SMS</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsSmsPreviewOpen(false);
                    handlePayNow();
                  }}
                  className="w-1/2 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Payer ma cotisation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
