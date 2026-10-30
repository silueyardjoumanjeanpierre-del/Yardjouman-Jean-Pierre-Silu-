import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA, formatDateTime } from '../utils/formatters';
import {
  ArrowLeft,
  Share2,
  Users,
  Calendar,
  Wallet,
  CheckCircle2,
  Clock,
  Shield,
  Smartphone,
  Copy,
  Check,
  ArrowUpRight,
  Sparkles,
  BellRing,
  Send,
  MessageCircle,
} from 'lucide-react';
import { getWhatsAppShareLink, formatTontineInviteMessage, WHATSAPP_BUSINESS_DISPLAY } from '../utils/whatsapp';

export const TontineDetailView: React.FC = () => {
  const {
    selectedTontineId,
    tontines,
    currentUser,
    setActiveView,
    openPaymentModal,
    distributeRoundPayout,
    joinTontine,
    triggerAutomatedReminders,
  } = useApp();

  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'participants' | 'tours' | 'regles'>('participants');
  const [reminderDispatchedNotice, setReminderDispatchedNotice] = useState<string | null>(null);

  const tontine = tontines.find((t) => t.id === selectedTontineId);

  if (!tontine) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-sm text-neutral-500">Tontine introuvable ou sélection invalide.</p>
        <button
          onClick={() => setActiveView('catalogue')}
          className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-xl"
        >
          Retour au catalogue
        </button>
      </div>
    );
  }

  const isMember = tontine.participants.some((p) => p.userId === currentUser.id);
  const isCreator = tontine.creatorId === currentUser.id;
  const isFull = tontine.participants.length >= tontine.participantsCount;

  // Current active round
  const currentRoundData = tontine.rounds.find((r) => r.roundNumber === tontine.currentRound);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(tontine.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePayMyContribution = () => {
    openPaymentModal({
      title: `Cotisation Tour ${tontine.currentRound} : ${tontine.name}`,
      amount: tontine.contributionAmount,
      type: 'cotisation',
      tontineId: tontine.id,
      roundNumber: tontine.currentRound,
    });
  };

  const handleReleasePayout = () => {
    if (window.confirm(`Confirmez-vous le déblocage et versement de la cagnotte du Tour ${tontine.currentRound} (${formatFCFA(tontine.netPayout)} nets) au bénéficiaire ?`)) {
      distributeRoundPayout(tontine.id, tontine.currentRound);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button and Share Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveView('catalogue')}
          className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux tontines</span>
        </button>

        <div className="flex items-center gap-2">
          <a
            href={getWhatsAppShareLink(formatTontineInviteMessage(tontine))}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
            title="Inviter directement des membres sur WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white" />
            <span>Inviter sur WhatsApp</span>
          </a>

          <button
            onClick={handleCopyCode}
            className="px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Code {tontine.code} copié !</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Copier Code ({tontine.code})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-extrabold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200">
                {tontine.code}
              </span>
              <span className="text-neutral-300">·</span>
              <span className="text-xs text-neutral-500">{tontine.category}</span>
              <span className="text-neutral-300">·</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Frais d'ouverture 1 000 F acquittés
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              {tontine.name}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl leading-relaxed">
              {tontine.description || 'Groupe d’épargne rotative solidaire en Côte d’Ivoire.'}
            </p>
          </div>

          {/* Status Badge & CTA */}
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-neutral-900 text-white">
              {tontine.status === 'active'
                ? `Active · Tour ${tontine.currentRound} / ${tontine.participantsCount}`
                : tontine.status === 'en_attente_participants'
                ? `En attente (${tontine.participants.length}/${tontine.participantsCount})`
                : 'Terminée'}
            </span>

            {/* If user is not member and not full */}
            {!isMember && !isFull && (
              <button
                onClick={() => joinTontine(tontine.id)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow transition-colors"
              >
                Rejoindre cette tontine
              </button>
            )}

            {isMember && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl flex items-center gap-1 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Vous participez à cette tontine</span>
              </span>
            )}
          </div>
        </div>

        {/* Financial Transparency Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-neutral-150">
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-150">
            <span className="text-[11px] text-neutral-500 block">Cotisation individuelle</span>
            <span className="text-lg font-bold font-mono text-neutral-900 mt-0.5 block tabular-nums">
              {formatFCFA(tontine.contributionAmount)}
            </span>
            <span className="text-[10px] text-neutral-400 capitalize">{tontine.frequency}</span>
          </div>

          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-150">
            <span className="text-[11px] text-neutral-500 block">Cagnotte brute collectée</span>
            <span className="text-lg font-bold font-mono text-neutral-900 mt-0.5 block tabular-nums">
              {formatFCFA(tontine.totalPot)}
            </span>
            <span className="text-[10px] text-neutral-400">
              {tontine.participantsCount} membres
            </span>
          </div>

          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-150">
            <span className="text-[11px] text-neutral-500 block">Commission plateforme ({(tontine.commissionRate * 100).toFixed(0)}%)</span>
            <span className="text-lg font-bold font-mono text-orange-600 mt-0.5 block tabular-nums">
              - {formatFCFA(tontine.commissionAmount)}
            </span>
            <span className="text-[10px] text-neutral-400">Déduite au versement</span>
          </div>

          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
            <span className="text-[11px] text-emerald-800 font-semibold block">
              Net versé au bénéficiaire
            </span>
            <span className="text-xl font-extrabold font-mono text-emerald-700 mt-0.5 block tabular-nums">
              {formatFCFA(tontine.netPayout)}
            </span>
            <span className="text-[10px] text-emerald-800/80">Via Mobile Money instantané</span>
          </div>
        </div>

        {/* Current Round Callout */}
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                Tour en Cours : Tour #{tontine.currentRound}
              </span>
              <span className="text-neutral-500">·</span>
              <span className="text-xs text-neutral-300 font-mono">
                Échéance : {tontine.nextDueDate}
              </span>
            </div>
            <p className="text-xs text-neutral-300">
              Bénéficiaire désigné :{' '}
              <strong className="text-white">
                {currentRoundData?.beneficiaryName || 'Tirage au sort en cours'}
              </strong>{' '}
              ({formatFCFA(tontine.netPayout)} nets).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {isMember && (
              <button
                onClick={handlePayMyContribution}
                className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
              >
                <Smartphone className="w-4 h-4" />
                <span>Payer ma cotisation ({formatFCFA(tontine.contributionAmount)})</span>
              </button>
            )}

            {/* Automated Reminder trigger button */}
            <button
              onClick={() => {
                const res = triggerAutomatedReminders(tontine.id);
                setReminderDispatchedNotice(
                  `Envoi automatique réussi : ${res.count} messages de relance (SMS & WhatsApp) transmis aux membres ayant une cotisation en attente pour le Tour ${tontine.currentRound}.`
                );
                setTimeout(() => setReminderDispatchedNotice(null), 5000);
              }}
              className="px-3.5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700 transition-colors flex items-center gap-1.5"
              title="Envoyer les messages automatiques SMS et push aux membres pour le jour de cotisation"
            >
              <BellRing className="w-4 h-4 text-orange-400" />
              <span>Diffuser Rappel Jour J</span>
            </button>

            {(isCreator || currentUser.role === 'admin') && currentRoundData?.status === 'en_cours' && (
              <button
                onClick={handleReleasePayout}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Débloquer la Cagnotte</span>
              </button>
            )}
          </div>
        </div>

        {/* Feedback message when reminders triggered */}
        {reminderDispatchedNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{reminderDispatchedNotice}</span>
          </div>
        )}
      </div>

      {/* Tabs: Participants vs Tours vs Règles */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-200 pb-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('participants')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'participants'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Participants & Ordre ({tontine.participants.length}/{tontine.participantsCount})
          </button>
          <button
            onClick={() => setActiveTab('tours')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'tours'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Calendrier des Tours ({tontine.rounds.length})
          </button>
          <button
            onClick={() => setActiveTab('regles')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'regles'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Règlement & Pénalités
          </button>
        </div>

        {/* TAB 1: PARTICIPANTS */}
        {activeTab === 'participants' && (
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-900">
                Attribution des positions :{' '}
                <strong className="capitalize text-orange-600">
                  {tontine.payoutStrategy.replace(/_/g, ' ')}
                </strong>
              </span>
              <span className="text-neutral-500">
                Créateur : {tontine.creatorName} ({tontine.creatorPhone})
              </span>
            </div>

            <div className="divide-y divide-neutral-150 text-xs">
              {tontine.participants.map((p) => {
                const isMe = p.userId === currentUser.id;
                return (
                  <div
                    key={p.id}
                    className={`p-4 flex items-center justify-between transition-colors ${
                      isMe ? 'bg-orange-50/50' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-mono font-bold text-xs">
                        #{p.orderPosition}
                      </div>
                      <div>
                        <div className="font-bold text-neutral-900 flex items-center gap-2">
                          <span>{p.name}</span>
                          {isMe && (
                            <span className="text-[10px] text-orange-600 bg-orange-100 px-1.5 py-0.2 rounded font-semibold">
                              Vous
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-500 font-mono">{p.phone}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-400 block">Cotisations payées :</span>
                        <span className="font-mono font-bold text-neutral-800">
                          {p.contributionsPaidCount} / {tontine.participantsCount}
                        </span>
                      </div>

                      <div>
                        {p.hasReceivedPayout ? (
                          <span className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 rounded-full border border-emerald-300">
                            Cagnotte Perçue ✓
                          </span>
                        ) : p.orderPosition === tontine.currentRound ? (
                          <span className="px-2.5 py-1 text-[11px] font-semibold text-orange-800 bg-orange-100 rounded-full border border-orange-300 animate-pulse">
                            Tour Actif
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-[11px] font-medium text-neutral-500 bg-neutral-100 rounded-full">
                            Tour #{p.orderPosition}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: CALENDRIER DES TOURS */}
        {activeTab === 'tours' && (
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-neutral-200">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Calendrier des Échéances et Versements
              </h3>
            </div>

            <div className="divide-y divide-neutral-150 text-xs">
              {tontine.rounds.map((round) => (
                <div
                  key={round.roundNumber}
                  className="p-4 flex items-center justify-between hover:bg-neutral-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center font-mono font-bold">
                      T{round.roundNumber}
                    </span>
                    <div>
                      <div className="font-bold text-neutral-900">
                        Bénéficiaire : {round.beneficiaryName}
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        Date d'échéance : {round.dueDate}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-400 block">Montant net :</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {formatFCFA(round.netPaid)}
                      </span>
                    </div>

                    <div>
                      {round.status === 'verse' ? (
                        <span className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                          Versé ✓
                        </span>
                      ) : round.status === 'en_cours' ? (
                        <span className="px-2.5 py-1 text-[11px] font-semibold text-orange-700 bg-orange-50 rounded-full border border-orange-200">
                          En cours
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[11px] text-neutral-500 bg-neutral-100 rounded-full">
                          À venir
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: REGLES */}
        {activeTab === 'regles' && (
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4 text-xs text-neutral-700 leading-relaxed">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
              Charte & Conditions Spécifiques de ce Groupe
            </h3>
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 whitespace-pre-wrap font-sans">
              {tontine.rules}
            </div>

            <div className="pt-2 text-[11px] text-neutral-500 space-y-1">
              <p>
                <strong>Garantie IVOIRETONTINE :</strong> En cas de litige persistant, vous pouvez ouvrir un dossier de médiation depuis notre Centre d'Assistance.
              </p>
              <p>
                La commission de {(tontine.commissionRate * 100).toFixed(0)}% retenue à chaque versement couvre la sécurisation informatique, le support et l'accès à la plateforme.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
