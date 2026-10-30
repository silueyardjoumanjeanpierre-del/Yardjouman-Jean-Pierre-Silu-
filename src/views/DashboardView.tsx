import React from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA, formatDateTime } from '../utils/formatters';
import {
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowUpRight,
  Shield,
  Layers,
  Users,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { UserCagnotteEvolutionChart } from '../components/UserCagnotteEvolutionChart';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    tontines,
    transactions,
    setActiveView,
    setSelectedTontineId,
    setSelectedReceiptTxn,
    openPaymentModal,
    settings,
  } = useApp();

  // Filter user's tontines
  const myCreatedTontines = tontines.filter((t) => t.creatorId === currentUser.id);
  const myJoinedTontines = tontines.filter((t) =>
    t.participants.some((p) => p.userId === currentUser.id)
  );

  // Filter user transactions
  const myTransactions = transactions.filter((t) => t.userId === currentUser.id);

  // Calculate user total contributions paid
  const totalContributionsPaid = myTransactions
    .filter((t) => t.type === 'cotisation' && t.status === 'succes')
    .reduce((acc, t) => acc + t.amountGross, 0);

  // Calculate user total payouts received
  const totalPayoutsReceived = myTransactions
    .filter((t) => t.type === 'reception_cagnotte' && t.status === 'succes')
    .reduce((acc, t) => acc + t.amountNet, 0);

  // User's upcoming payout turns
  const upcomingTurns = myJoinedTontines.flatMap((t) => {
    const participant = t.participants.find((p) => p.userId === currentUser.id);
    if (!participant || participant.hasReceivedPayout) return [];
    return [
      {
        tontineId: t.id,
        tontineName: t.name,
        turnNumber: participant.orderPosition,
        currentRound: t.currentRound,
        isCurrent: participant.orderPosition === t.currentRound,
        netPayout: t.netPayout,
        grossPot: t.totalPot,
        commission: t.commissionAmount,
        dueDate: t.nextDueDate,
      },
    ];
  });

  // Quick deposit helper: find first active tontine for user
  const firstPendingTontine = myJoinedTontines.find((t) => t.status === 'en_cours') || myJoinedTontines[0];

  const handleQuickDeposit = () => {
    if (firstPendingTontine) {
      openPaymentModal({
        title: `Cotisation Tour ${firstPendingTontine.currentRound} : ${firstPendingTontine.name}`,
        amount: firstPendingTontine.contributionAmount,
        type: 'cotisation',
        tontineId: firstPendingTontine.id,
        roundNumber: firstPendingTontine.currentRound,
      });
    } else {
      setActiveView('catalogue');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Portefeuille Membre Actif
            </span>
            <span className="text-neutral-400">·</span>
            <span className="text-xs text-neutral-500 font-mono">{currentUser.phone}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mt-1 flex items-center gap-2">
            <Wallet className="w-7 h-7 text-emerald-600 inline-block" />
            <span>Mon Portefeuille & Cagnottes · {currentUser.name}</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Portefeuille digital sécurisé : solde d'épargne cumulée, cagnottes à percevoir et reçus Mobile Money.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleQuickDeposit}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            title="Faire un versement Mobile Money vers votre tontine"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Faire un Dépôt / Cotiser</span>
          </button>
          <button
            onClick={() => setActiveView('catalogue')}
            className="px-3.5 py-2.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Rejoindre un groupe</span>
          </button>
          <button
            onClick={() => setActiveView('creer_tontine')}
            className="px-3.5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Créer (1 000 F)</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs text-neutral-500 font-medium">Cotisations Versées</span>
            <span className="p-1.5 bg-neutral-100 text-neutral-700 rounded-lg">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 mt-3 tabular-nums">
            {formatFCFA(totalContributionsPaid)}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Épargne totale cumulée</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs text-neutral-500 font-medium">Cagnottes Reçues</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-3 tabular-nums">
            {formatFCFA(totalPayoutsReceived)}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Montant net encaissé</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs text-neutral-500 font-medium">Mes Tontines Actives</span>
            <span className="p-1.5 bg-orange-50 text-orange-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 mt-3 tabular-nums">
            {myJoinedTontines.length}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            {myCreatedTontines.length} créée(s) par vous
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs text-neutral-500 font-medium">Cagnotte en attente</span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-orange-600 mt-3 tabular-nums">
            {upcomingTurns.length > 0 ? formatFCFA(upcomingTurns[0].netPayout) : '0 FCFA'}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            Prochain tour #
            {upcomingTurns.length > 0 ? upcomingTurns[0].turnNumber : '-'}
          </p>
        </div>
      </div>

      {/* Visualisation de Données Recharts : Évolution des Cagnottes sur les 6 derniers mois */}
      <UserCagnotteEvolutionChart
        currentUser={currentUser}
        transactions={transactions}
        tontines={tontines}
      />

      {/* Main Grid: My Tontines vs Upcoming Payouts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: My Active Tontines */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900">
              Mes Groupes d'Épargne Actifs ({myJoinedTontines.length})
            </h2>
            <button
              onClick={() => setActiveView('catalogue')}
              className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
            >
              Voir tout le catalogue &rarr;
            </button>
          </div>

          {myJoinedTontines.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center space-y-3">
              <p className="text-xs text-neutral-500">
                Vous n'avez pas encore rejoint de tontine.
              </p>
              <button
                onClick={() => setActiveView('catalogue')}
                className="px-4 py-2 bg-orange-600 text-white text-xs font-semibold rounded-xl"
              >
                Découvrir les tontines disponibles
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myJoinedTontines.map((tontine) => {
                const myParticipant = tontine.participants.find(
                  (p) => p.userId === currentUser.id
                );
                return (
                  <div
                    key={tontine.id}
                    className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-neutral-300 transition-all shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-neutral-400">
                            {tontine.code}
                          </span>
                          <span className="text-neutral-300">·</span>
                          <span className="text-xs text-neutral-500">{tontine.category}</span>
                        </div>
                        <h3 className="text-base font-bold text-neutral-900 mt-0.5">
                          {tontine.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 capitalize">
                          {tontine.frequency}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedTontineId(tontine.id);
                            setActiveView('details_tontine');
                          }}
                          className="px-3.5 py-1.5 text-xs font-bold text-orange-600 hover:bg-orange-50 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <span>Détails</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar & Financials */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-neutral-50 p-3.5 rounded-xl border border-neutral-150">
                      <div>
                        <span className="text-neutral-500 block">Cotisation :</span>
                        <span className="font-bold text-neutral-900 font-mono">
                          {formatFCFA(tontine.contributionAmount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Cagnotte par tour :</span>
                        <span className="font-bold text-emerald-700 font-mono">
                          {formatFCFA(tontine.netPayout)} nets
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Votre position :</span>
                        <span className="font-bold text-neutral-900 font-mono">
                          Tour #{myParticipant?.orderPosition || '?'} / {tontine.participantsCount}
                        </span>
                      </div>
                    </div>

                    {/* Action strip */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-neutral-500">
                        Prochaine échéance :{' '}
                        <strong className="text-neutral-900 font-mono">
                          {tontine.nextDueDate}
                        </strong>
                      </span>
                      <button
                        onClick={() => {
                          openPaymentModal({
                            title: `Cotisation Tour ${tontine.currentRound} : ${tontine.name}`,
                            amount: tontine.contributionAmount,
                            type: 'cotisation',
                            tontineId: tontine.id,
                            roundNumber: tontine.currentRound,
                          });
                        }}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-semibold transition-colors flex items-center gap-1 text-[11px]"
                      >
                        <span>Payer ma cotisation</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Payouts & Recent Receipts */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upcoming Payout Notice Card */}
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-2xl p-5 shadow-lg border border-neutral-700 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Votre Prochaine Cagnotte</span>
            </div>
            {upcomingTurns.length > 0 ? (
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-neutral-400">
                    {upcomingTurns[0].tontineName}
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1 tabular-nums">
                    {formatFCFA(upcomingTurns[0].netPayout)}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    Cagnotte brute {formatFCFA(upcomingTurns[0].grossPot)} moins {(settings.commissionRate * 100).toFixed(0)}% de commission ({formatFCFA(upcomingTurns[0].commission)}).
                  </div>
                </div>
                <div className="pt-2 border-t border-neutral-700 text-xs text-neutral-300">
                  Attribué au <strong>Tour #{upcomingTurns[0].turnNumber}</strong>.
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-400">
                Vous avez déjà perçu vos cagnottes ou n'avez pas de tour en attente.
              </p>
            )}
          </div>

          {/* Recent Receipts List */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">
                Mes Dernières Transactions
              </h3>
              <button
                onClick={() => setActiveView('transactions')}
                className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
              >
                Historique &rarr;
              </button>
            </div>

            <div className="divide-y divide-neutral-100">
              {myTransactions.slice(0, 4).map((txn) => (
                <div
                  key={txn.id}
                  onClick={() => setSelectedReceiptTxn(txn)}
                  className="py-3 flex items-center justify-between hover:bg-neutral-50 -mx-2 px-2 rounded-lg cursor-pointer transition-colors text-xs"
                >
                  <div>
                    <div className="font-semibold text-neutral-900 truncate max-w-[160px]">
                      {txn.tontineName || 'Service IVOIRETONTINE'}
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      {txn.receiptNumber} · {txn.paymentMethod.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-mono font-bold tabular-nums ${
                        txn.type === 'reception_cagnotte'
                          ? 'text-emerald-600'
                          : 'text-neutral-900'
                      }`}
                    >
                      {txn.type === 'reception_cagnotte' ? '+' : '-'}
                      {formatFCFA(txn.amountNet)}
                    </div>
                    <span className="text-[10px] text-neutral-400 block">
                      Voir reçu
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
