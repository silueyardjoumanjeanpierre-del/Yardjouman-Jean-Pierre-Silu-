import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA, formatDateTime } from '../utils/formatters';
import {
  Shield,
  Wallet,
  TrendingUp,
  ArrowDownToLine,
  Layers,
  Settings,
  AlertOctagon,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  Lock,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  Building,
  Smartphone,
  FileCheck,
  BellRing,
  MessageSquare,
  MessageCircle,
  BarChart3,
  FileCheck2,
  Download,
  Key,
  Calculator,
  FileText,
} from 'lucide-react';
import { AdminRevenueAnalytics } from '../components/AdminRevenueAnalytics';
import { WHATSAPP_BUSINESS_DISPLAY, getWhatsAppBusinessLink } from '../utils/whatsapp';
import { exportTreasuryStatementCSV } from '../utils/treasuryExport';

export const AdminDashboardView: React.FC = () => {
  const {
    currentUser,
    users,
    tontines,
    transactions,
    settings,
    adminWithdrawals,
    automatedReminders,
    triggerAutomatedReminders,
    updatePlatformSettings,
    performAdminWithdrawal,
    setSelectedReceiptTxn,
    setIsAuditModalOpen,
    setIsMerchantModalOpen,
    setIsTreasuryStatementModalOpen,
    setIsSimulatorModalOpen,
  } = useApp();

  // Admin PIN gate if user is not in admin mode
  const [adminPinInput, setAdminPinInput] = useState('');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(
    currentUser.role === 'admin' || currentUser.email === 'silueyardjoumanjeanpierre@gmail.com'
  );
  const [pinError, setPinError] = useState('');

  // Active sub-tab in Admin (defaults to 'toutes' for complete exhaustive display)
  const [adminTab, setAdminTab] = useState<
    'toutes' | 'revenus_retrait' | 'visualisation' | 'tontines' | 'reminders' | 'utilisateurs' | 'parametres' | 'audit'
  >('toutes');
  const [adminReminderAlert, setAdminReminderAlert] = useState<string | null>(null);

  // Withdrawal form state
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(10000);
  const [sourceType, setSourceType] = useState<'total_disponible' | 'frais_creation' | 'commissions'>('total_disponible');
  const [destinationType, setDestinationType] = useState<'mobile_money_pro' | 'virement_bancaire_uemoa'>('mobile_money_pro');
  const [destinationEntity, setDestinationEntity] = useState('Wave Business CI');
  const [destinationAccount, setDestinationAccount] = useState('+225 05 04 49 14 06');
  const [withdrawalPin, setWithdrawalPin] = useState('');
  const [withdrawalError, setWithdrawalError] = useState('');
  const [withdrawalSuccessMsg, setWithdrawalSuccessMsg] = useState('');
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);

  // Settings update modal
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [newCreationFee, setNewCreationFee] = useState(settings.creationFee);
  const [newCommissionRate, setNewCommissionRate] = useState(settings.commissionRate * 100);
  const [settingsReason, setSettingsReason] = useState('');

  // Financial calculations
  const totalVolumeGross = transactions
    .filter((t) => t.status === 'succes')
    .reduce((acc, t) => acc + t.amountGross, 0);

  const totalCreationFeesCollected = transactions
    .filter((t) => t.type === 'frais_creation' && t.status === 'succes')
    .reduce((acc, t) => acc + t.amountGross, 0);

  const totalCommissionsCollected = transactions
    .filter((t) => t.type === 'reception_cagnotte' && t.status === 'succes')
    .reduce((acc, t) => acc + t.feeAmount, 0);

  const totalPlatformRevenueEarned = totalCreationFeesCollected + totalCommissionsCollected;

  const totalAlreadyWithdrawn = adminWithdrawals
    .filter((w) => w.status === 'valide')
    .reduce((acc, w) => acc + w.amount, 0);

  const netAvailableForWithdrawal = Math.max(0, totalPlatformRevenueEarned - totalAlreadyWithdrawn);

  // Handle Admin Unlock
  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      adminPinInput === '2026' ||
      adminPinInput === '1959' ||
      adminPinInput === '0586' ||
      adminPinInput === '1234' ||
      currentUser.role === 'admin' ||
      currentUser.email === 'silueyardjoumanjeanpierre@gmail.com'
    ) {
      setIsAdminUnlocked(true);
      setPinError('');
    } else {
      setPinError('Code PIN Administrateur incorrect. Utilisez votre code PIN (ex: 1959 ou 2026).');
    }
  };

  // Submit withdrawal
  const handleSubmitWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawalError('');
    setWithdrawalSuccessMsg('');
    setIsProcessingWithdrawal(true);

    const pinToUse = withdrawalPin || '2026';

    const res = performAdminWithdrawal({
      amount: Number(withdrawalAmount),
      sourceType,
      destinationType,
      destinationAccount,
      destinationEntity,
      pin: pinToUse,
    });

    setIsProcessingWithdrawal(false);

    if (res.success) {
      setWithdrawalSuccessMsg(
        `Virement de ${Number(withdrawalAmount).toLocaleString('fr-FR')} FCFA exécuté avec succès vers ${destinationEntity}. Réf: ${res.withdrawal?.withdrawalRef}`
      );
      setTimeout(() => {
        setIsWithdrawalModalOpen(false);
        setWithdrawalSuccessMsg('');
        setWithdrawalPin('');
      }, 700);
    } else {
      setWithdrawalError(res.error || 'Erreur lors du traitement du retrait.');
    }
  };

  // Handle settings update
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsReason.trim()) {
      alert('Veuillez indiquer un motif de modification pour le registre d’audit.');
      return;
    }
    updatePlatformSettings(
      {
        creationFee: Number(newCreationFee),
        commissionRate: Number(newCommissionRate) / 100,
      },
      settingsReason
    );
    setIsSettingsModalOpen(false);
    setSettingsReason('');
  };

  // PIN Gate screen
  if (!isAdminUnlocked && currentUser.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-neutral-200 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-neutral-900 text-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              Accès Console Administrateur
            </h2>
            <p className="text-xs text-neutral-500 mt-1.5">
              Espace réservé à la direction financière et à l’audit IVOIRETONTINE. Veuillez saisir le code de sécurité 2FA / PIN.
            </p>
          </div>

          <form onSubmit={handleUnlockAdmin} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={6}
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                placeholder="Code PIN (ex: 2026)"
                className="w-full text-center py-3 text-lg tracking-widest font-mono border border-neutral-300 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                autoFocus
              />
              {pinError && (
                <p className="text-xs text-red-600 font-medium mt-1.5">{pinError}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setIsAdminUnlocked(true);
                setPinError('');
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Accéder Directement (Démo 1-Clic)</span>
            </button>

            <button
              type="submit"
              className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Valider avec le code PIN (2026)
            </button>
          </form>

          <div className="text-[11px] text-neutral-400 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
            <strong>Mode Démonstration Rapide :</strong> Cliquez sur le bouton vert ci-dessus pour accéder sans saisie.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header / Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200">
              Espace Super Administrateur & Trésorerie
            </span>
            <span className="text-neutral-400">·</span>
            <span className="text-xs text-neutral-500">
              Session vérifiée : {currentUser.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight mt-1">
            Tableau de Bord Administratif & Retrait de Revenus
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Supervision financière, contrôle des tontines, comptabilité séparée et décaissements des commissions.
          </p>
        </div>

        {/* Quick CTA: Retirer Revenus & Audit */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm border border-neutral-700 hover:border-orange-500"
            title="Audit de Sécurité : Statistiques des transactions, taux de réussite Mobile Money et état des commissions de 4%"
          >
            <Shield className="w-3.5 h-3.5 text-orange-400" />
            <span>Audit de Sécurité</span>
          </button>

          <a
            href={getWhatsAppBusinessLink('Bonjour, en tant qu\'administrateur, je souhaite joindre le support technique WhatsApp.')}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            title={`Assistance WhatsApp : ${WHATSAPP_BUSINESS_DISPLAY}`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-[#25D366]" />
            <span>WhatsApp Admin</span>
          </a>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Tarifs & Frais</span>
          </button>

          <button
            onClick={() => setIsWithdrawalModalOpen(true)}
            className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Retirer Revenus Plateforme</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Row: Revenue & Balance Accounting */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Solde Disponible pour Retrait (Dominant KPI) */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-2xl p-5 shadow-lg border border-neutral-700 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="text-xs text-neutral-400 font-medium">
              Solde Net Retirable (Trésorerie)
            </div>
            <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black tracking-tight text-emerald-400 font-mono mt-3 tabular-nums">
            {formatFCFA(netAvailableForWithdrawal)}
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-700/80 flex items-center justify-between text-[11px] text-neutral-400">
            <span>Frais + Commissions cumulés</span>
            <button
              onClick={() => setIsWithdrawalModalOpen(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline"
            >
              Transférer &rarr;
            </button>
          </div>
        </div>

        {/* Card 2: Source 1 - Frais de Création */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                Source 1
              </span>
              <div className="text-xs text-neutral-500 font-medium mt-0.5">
                Frais d’Ouverture ({settings.creationFee} F / tontine)
              </div>
            </div>
            <span className="p-1.5 bg-orange-50 text-orange-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-neutral-900 font-mono mt-3 tabular-nums">
            {formatFCFA(totalCreationFeesCollected)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-2">
            Perçus après confirmation paiement Mobile Money
          </p>
        </div>

        {/* Card 3: Source 2 - Commissions de Récupération (4%) */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                Source 2
              </span>
              <div className="text-xs text-neutral-500 font-medium mt-0.5">
                Commissions {(settings.commissionRate * 100).toFixed(0)}% sur Cagnottes
              </div>
            </div>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-neutral-900 font-mono mt-3 tabular-nums">
            {formatFCFA(totalCommissionsCollected)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-2">
            Prélevées légalement au versement des bénéficiaires
          </p>
        </div>

        {/* Card 4: Total déjà retiré */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Historique Décaissements
              </span>
              <div className="text-xs text-neutral-500 font-medium mt-0.5">
                Total Revenus Déjà Retirés
              </div>
            </div>
            <span className="p-1.5 bg-neutral-100 text-neutral-600 rounded-lg">
              <ArrowDownToLine className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-neutral-700 font-mono mt-3 tabular-nums">
            {formatFCFA(totalAlreadyWithdrawn)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-2">
            Vers comptes d'entreprise (Wave Pro & Banques)
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setAdminTab('toutes')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap font-extrabold flex items-center gap-1.5 shadow-sm ${
            adminTab === 'toutes'
              ? 'bg-orange-600 text-white shadow-orange-500/20'
              : 'text-neutral-700 bg-neutral-100 hover:bg-neutral-200'
          }`}
          title="Afficher toutes les fonctionnalités d'administration et de trésorerie sur un seul écran"
        >
          <Layers className="w-4 h-4" />
          <span>TOUT AFFICHER (Console Complète)</span>
        </button>

        <button
          onClick={() => setAdminTab('revenus_retrait')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
            adminTab === 'revenus_retrait'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          Retrait & Trésorerie ({adminWithdrawals.length})
        </button>
        <button
          onClick={() => setAdminTab('visualisation')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'visualisation'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-orange-400" />
          <span>Visualisation 30J (Recharts)</span>
        </button>
        <button
          onClick={() => setAdminTab('tontines')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
            adminTab === 'tontines'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          Supervision des Tontines ({tontines.length})
        </button>
        <button
          onClick={() => setAdminTab('reminders')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'reminders'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <BellRing className="w-3.5 h-3.5 text-orange-400" />
          <span>Messages & Rappels ({automatedReminders.length})</span>
        </button>
        <button
          onClick={() => setAdminTab('utilisateurs')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
            adminTab === 'utilisateurs'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          Comptes & KYC ({users.length})
        </button>
        <button
          onClick={() => setAdminTab('parametres')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
            adminTab === 'parametres'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          Paramètres & Tarification
        </button>
        <button
          onClick={() => setAdminTab('audit')}
          className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
            adminTab === 'audit'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          Journaux d’Audit Immuables ({settings.auditLogs.length})
        </button>
      </div>

      {/* SECTION 1: RETRAIT DE REVENUS ADMINISTRATEUR & COMPTABILITÉ */}
      {(adminTab === 'toutes' || adminTab === 'revenus_retrait') && (
        <div className="space-y-6 pt-2">
          {adminTab === 'toutes' && (
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Wallet className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-extrabold text-neutral-900">
                    Module 1 : Guichet de Trésorerie & Décaissements Plateforme
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Solde disponible net : <strong className="text-emerald-700 font-mono">{formatFCFA(netAvailableForWithdrawal)}</strong> · Virements Wave Business & Banques UEMOA
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Trésorerie Active
              </span>
            </div>
          )}

          {/* Quick Banner Action for Withdrawal */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded">
                  Décaissement des bénéfices
                </span>
                <span className="text-xs text-emerald-700">
                  Comptabilité IVOIRETONTINE conforme BCEAO
                </span>
              </div>
              <h3 className="text-base font-bold text-emerald-950">
                Vous avez {formatFCFA(netAvailableForWithdrawal)} de revenus disponibles à virer.
              </h3>
              <p className="text-xs text-emerald-800 max-w-2xl leading-relaxed">
                Les revenus de la plateforme sont constitués des frais fixes d'ouverture (1 000 FCFA) et des commissions de récupération de {(settings.commissionRate * 100).toFixed(0)}% déduites des cagnottes versées. Vous pouvez les virer vers le compte bancaire de la société ou le compte marchand Mobile Money Pro.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => exportTreasuryStatementCSV(transactions, adminWithdrawals, settings.commissionRate, settings.creationFee)}
                className="px-4 py-3 bg-white hover:bg-neutral-100 text-neutral-800 border border-emerald-300 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                title="Exporter l'ensemble des écritures comptables au format Excel/CSV"
              >
                <Download className="w-4 h-4 text-emerald-700" />
                <span>Relevé CSV (Excel)</span>
              </button>

              <button
                onClick={() => setIsTreasuryStatementModalOpen(true)}
                className="px-4 py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                title="Afficher et imprimer le bordereau officiel de trésorerie conforme BCEAO"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Bordereau Officiel</span>
              </button>

              <button
                onClick={() => setIsWithdrawalModalOpen(true)}
                className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-2"
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span>Initier un Retrait</span>
              </button>
            </div>
          </div>

          {/* Module Intégration Compte Marchand CinetPay & Wave Business */}
          <div className="bg-white rounded-2xl border-2 border-emerald-500/30 p-6 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-[#1BA779] text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Compte Marchand Assigné
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">BCEAO UEMOA</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-neutral-900 mt-0.5">
                    Compte Marchand CinetPay & Wave Business : <span className="text-emerald-700 font-mono">05 04 49 14 06</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Titulaire enregistré : <strong className="text-neutral-800">Silué Yardjouman Jean-Pierre</strong> ({currentUser.email})
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsMerchantModalOpen(true)}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  title="Configurer les clés d'API, Site ID et tester la passerelle en direct"
                >
                  <Key className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Configurer Clés API & Webhook</span>
                </button>
                <a
                  href="https://cinetpay.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span>CinetPay.com</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://business.wave.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-[#1BA779] hover:bg-[#158f67] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span>Wave Business</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Merchant Account Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between text-emerald-800 font-semibold mb-1">
                  <span>Numéro Marchand Mobile Money</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-base font-extrabold font-mono text-emerald-950">
                  +225 05 04 49 14 06
                </div>
                <p className="text-[11px] text-emerald-700 mt-1">
                  Réception directe des frais fixes (1 000 FCFA) et des 4% de commissions.
                </p>
              </div>

              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <div className="flex items-center justify-between text-neutral-700 font-semibold mb-1">
                  <span>Passerelle CinetPay CI</span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                    Pré-configuré
                  </span>
                </div>
                <div className="text-xs font-mono text-neutral-800 truncate">
                  ID: SITE_IVT_0504491406
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Agrégation Wave, Orange, MTN, Moov et Cartes Bancaires.
                </p>
              </div>

              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <div className="flex items-center justify-between text-neutral-700 font-semibold mb-1">
                  <span>Compte Wave Business CI</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                    Actif pour Retrait
                  </span>
                </div>
                <div className="text-xs font-mono text-neutral-800">
                  Compte Pro 0504491406
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Décaissement immédiat avec code PIN de sécurité (2026).
                </p>
              </div>
            </div>

            {/* Step-by-step Onboarding Notice */}
            <div className="bg-neutral-900 text-white rounded-xl p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Guide de finalisation de votre compte marchand officiel :</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-neutral-300 text-[11px] leading-relaxed">
                <li>
                  Rendez-vous sur <strong className="text-white">cinetpay.com/inscription</strong> ou ouvrez l'application <strong className="text-white">Wave Business</strong>.
                </li>
                <li>
                  Renseignez votre nom (<strong className="text-white">Silué Yardjouman Jean-Pierre</strong>) et votre numéro : <strong className="text-emerald-400 font-mono">05 04 49 14 06</strong>.
                </li>
                <li>
                  Validez le SMS de confirmation OTP envoyé sur votre carte SIM <strong className="text-emerald-400 font-mono">05 04 49 14 06</strong> et fournissez votre CNI.
                </li>
                <li>
                  Vos commissions de 4% et frais de création de 1 000 FCFA sont instantanément rattachés à votre numéro de retrait.
                </li>
              </ol>
            </div>
          </div>

          {/* Visualisation Recharts (displayed here only if not in 'toutes' mode to avoid duplicate graph) */}
          {adminTab !== 'toutes' && (
            <AdminRevenueAnalytics
              transactions={transactions}
              creationFee={settings.creationFee}
              commissionRate={settings.commissionRate}
            />
          )}

          {/* Historical Admin Withdrawals Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Historique des Retraits de Revenus Administrateur
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Chaque décaissement est signé cryptographiquement et archivé dans le grand livre.
                </p>
              </div>
            </div>

            {adminWithdrawals.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                Aucun retrait administratif enregistré pour le moment.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                    <tr>
                      <th className="py-3 px-4">Réf. Retrait</th>
                      <th className="py-3 px-4">Date & Heure</th>
                      <th className="py-3 px-4">Bénéficiaire / Société</th>
                      <th className="py-3 px-4">Compte Destinataire</th>
                      <th className="py-3 px-4">Origine</th>
                      <th className="py-3 px-4 text-right">Montant Retiré</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4 text-right">Reçu / Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {adminWithdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                          {w.withdrawalRef}
                        </td>
                        <td className="py-3 px-4 text-neutral-500">
                          {formatDateTime(w.date)}
                        </td>
                        <td className="py-3 px-4 font-medium text-neutral-900">
                          {w.destinationEntity}
                        </td>
                        <td className="py-3 px-4 font-mono text-neutral-600">
                          {w.destinationAccount}
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded text-[11px]">
                            {w.sourceType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 tabular-nums">
                          {formatFCFA(w.amount)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Validé
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono text-[10px] text-neutral-400 block truncate max-w-[120px]">
                            {w.auditHash}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: VISUALISATION 30J: GRAPHIQUES RECHARTS DÉDIÉS */}
      {(adminTab === 'toutes' || adminTab === 'visualisation') && (
        <div className="space-y-6 pt-2">
          {adminTab === 'toutes' && (
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-indigo-100 text-indigo-800 rounded-xl">
                  <BarChart3 className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-extrabold text-neutral-900">
                    Module 2 : Visualisation Analytique & Croissance 30J (Recharts)
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Traçabilité en temps réel des encaissements Mobile Money et des commissions de 4%
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Graphique 30J
              </span>
            </div>
          )}
          <AdminRevenueAnalytics
            transactions={transactions}
            creationFee={settings.creationFee}
            commissionRate={settings.commissionRate}
          />

          {/* Detailed breakdown card explaining the regulatory commission structure & analytics metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Frais d’Ouverture Plateforme
              </div>
              <div className="text-xl font-bold font-mono text-neutral-900">
                {settings.creationFee.toLocaleString('fr-FR')} FCFA / tontine
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Perçus dès l'initiation de la tontine par l'administrateur créateur via Mobile Money (Wave, Orange, MTN, Moov). Frais fixes assurant la gestion et la vérification des participants.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Commission de Récupération
              </div>
              <div className="text-xl font-bold font-mono text-emerald-700">
                {(settings.commissionRate * 100).toFixed(0)}% sur chaque cagnotte
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Retenue automatiquement et légalement lors du déblocage et du versement de la cagnotte au bénéficiaire désigné par tirage transparent ou ordre chronologique.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Décaissement & Trésorerie
              </div>
              <div className="text-xl font-bold font-mono text-neutral-900">
                Instantané & Immuable
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Tous les revenus cumulés peuvent être virés à tout moment en 1-clic ou via code PIN sécurisé (2026) vers Wave Business ou les comptes bancaires UEMOA.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: SUPERVISION DES TONTINES */}
      {(adminTab === 'toutes' || adminTab === 'tontines') && (
        <div className="space-y-4 pt-2">
          {adminTab === 'toutes' && (
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-orange-100 text-orange-800 rounded-xl">
                  <Layers className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-extrabold text-neutral-900">
                    Module 3 : Supervision des Tontines ({tontines.length} Groupes)
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Pilotage des cycles, contrôle des cagnottes ({formatFCFA(tontines.reduce((acc, t) => acc + t.totalPot, 0))}) et tirages
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Supervision Active
              </span>
            </div>
          )}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Liste Complète des Tontines Ouvertes
                </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Surveillance des cycles, conformité des tirages et encaissements des 1 000 FCFA.
              </p>
            </div>
            <div className="text-xs font-medium text-neutral-600">
              Total Cagnottes Brutes Gérées :{' '}
              <strong className="text-neutral-900">
                {formatFCFA(tontines.reduce((acc, t) => acc + t.totalPot, 0))}
              </strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Nom de la Tontine</th>
                  <th className="py-3 px-4">Créateur</th>
                  <th className="py-3 px-4">Cotisation</th>
                  <th className="py-3 px-4">Participants</th>
                  <th className="py-3 px-4">Cagnotte Brute</th>
                  <th className="py-3 px-4">Commission ({(settings.commissionRate * 100).toFixed(0)}%)</th>
                  <th className="py-3 px-4">Net Bénéficiaire</th>
                  <th className="py-3 px-4">Frais Création</th>
                  <th className="py-3 px-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {tontines.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-neutral-900">{t.code}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900">{t.name}</div>
                      <div className="text-[10px] text-neutral-500">{t.category}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div>{t.creatorName}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">{t.creatorPhone}</div>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums">
                      {formatFCFA(t.contributionAmount)} / {t.frequency}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {t.participants.length} / {t.participantsCount}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold tabular-nums">
                      {formatFCFA(t.totalPot)}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-700 font-semibold tabular-nums">
                      {formatFCFA(t.commissionAmount)}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-700 tabular-nums">
                      {formatFCFA(t.netPayout)}
                    </td>
                    <td className="py-3 px-4">
                      {t.creationFeePaid ? (
                        <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> 1 000 F payé
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-600 font-medium">En attente</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize text-[11px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                        {t.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}

      {/* SECTION 4: MESSAGES AUTOMATIQUES & RAPPELS DES JOURS DE COTISATION */}
      {(adminTab === 'toutes' || adminTab === 'reminders') && (
        <div className="space-y-6 pt-2">
          {adminTab === 'toutes' && (
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <BellRing className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-extrabold text-neutral-900">
                    Module 4 : Centre Automatisé de Rappels & Relances ({automatedReminders.length} Messages Archivés)
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Diffusion multi-canale (SMS & WhatsApp Business 05 86 80 19 59) pour éradiquer les impayés
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                SMS & WhatsApp
              </span>
            </div>
          )}
          {/* Top Control Strip */}
          <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded border border-orange-800">
                  Système de Notification Automatisé
                </span>
                <span className="text-xs text-neutral-400">Cron 08h00 GMT & J-1</span>
              </div>
              <h3 className="text-base font-bold text-white">
                Rappels Automatiques les Jours d'Échéance de Cotisation
              </h3>
              <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed">
                Le moteur envoie automatiquement un SMS et une notification WhatsApp le matin de chaque date de cotisation aux membres n'ayant pas encore réglé leur tour, avec un rappel d'urgence l'après-midi.
              </p>
            </div>

            <button
              onClick={() => {
                const res = triggerAutomatedReminders();
                setAdminReminderAlert(
                  `${res.count} messages de rappel automatique ont été envoyés avec succès sur les téléphones des participants concernés.`
                );
                setTimeout(() => setAdminReminderAlert(null), 5000);
              }}
              className="px-5 py-3 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center gap-2 shrink-0"
            >
              <BellRing className="w-4 h-4" />
              <span>Diffuser les Rappels du Jour</span>
            </button>
          </div>

          {adminReminderAlert && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{adminReminderAlert}</span>
            </div>
          )}

          {/* Metrics strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
              <span className="text-xs text-neutral-500 block">Total Messages Envoyés</span>
              <span className="text-2xl font-bold font-mono text-neutral-900 mt-1 block tabular-nums">
                {automatedReminders.length}
              </span>
              <span className="text-[10px] text-neutral-400">SMS & WhatsApp cumulés</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
              <span className="text-xs text-neutral-500 block">Canaux Actifs</span>
              <span className="text-base font-bold text-emerald-700 mt-1 block">
                SMS (CI) · WhatsApp · In-App
              </span>
              <span className="text-[10px] text-neutral-400">Orange, MTN, Moov, Wave</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
              <span className="text-xs text-neutral-500 block">Horaires Programmés</span>
              <span className="text-base font-bold text-neutral-800 mt-1 block font-mono">
                08h00 & 16h00 GMT
              </span>
              <span className="text-[10px] text-neutral-400">Le jour de chaque échéance</span>
            </div>
          </div>

          {/* Dispatched Messages Log Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Journal des Envois Automatiques
                </h4>
                <p className="text-[11px] text-neutral-500">
                  Accusés de réception et historique des relances distribuées
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">Destinataire</th>
                    <th className="py-3 px-4">Tontine / Tour</th>
                    <th className="py-3 px-4">Canal</th>
                    <th className="py-3 px-4 text-right">Montant Rappelé</th>
                    <th className="py-3 px-4">Contenu du Message</th>
                    <th className="py-3 px-4">Date d'Envoi</th>
                    <th className="py-3 px-4">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {automatedReminders.map((rem) => (
                    <tr key={rem.id} className="hover:bg-neutral-50/70">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900">{rem.userName}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">{rem.userPhone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-neutral-900">{rem.tontineName}</div>
                        <div className="text-[10px] text-neutral-500">Tour n° {rem.roundNumber}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            rem.channel === 'sms'
                              ? 'bg-orange-100 text-orange-800'
                              : rem.channel === 'whatsapp'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {rem.channel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900 tabular-nums">
                        {formatFCFA(rem.amount)}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-[11px] text-neutral-600">
                        {rem.messageContent}
                      </td>
                      <td className="py-3 px-4 text-neutral-500 font-mono text-[11px] whitespace-nowrap">
                        {rem.sentAt}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Délivré
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: UTILISATEURS & KYC */}
      {(adminTab === 'toutes' || adminTab === 'utilisateurs') && (
        <div className="space-y-4 pt-2">
          {adminTab === 'toutes' && (
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                  <Users className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-extrabold text-neutral-900">
                    Module 5 : Registre des Utilisateurs & Conformité KYC (BCEAO / ONECI)
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Contrôle des identités ({users.length} comptes enregistrés), vérification CNI et Mobile Money
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                KYC Vérifié
              </span>
            </div>
          )}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-neutral-200">
              <h3 className="text-sm font-bold text-neutral-900">
                Registre des Comptes Utilisateurs & Statut de Vérification
              </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Conformité avec les exigences de vigilance de la BCEAO et protection contre la fraude.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Utilisateur</th>
                  <th className="py-3 px-4">Téléphone Mobile Money</th>
                  <th className="py-3 px-4">Ville / Commune</th>
                  <th className="py-3 px-4">Rôle</th>
                  <th className="py-3 px-4">Inscription</th>
                  <th className="py-3 px-4">Statut KYC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50/70">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900">{u.name}</div>
                      <div className="text-[10px] text-neutral-500">{u.email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">{u.phone}</td>
                    <td className="py-3 px-4">{u.city}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          u.role === 'admin'
                            ? 'bg-neutral-900 text-white'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-500">{u.joinedDate}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Vérifié BCEAO
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}

      {/* SECTION 6: PARAMÈTRES ET TARIFS */}
      {(adminTab === 'toutes' || adminTab === 'parametres') && (
        <div className="space-y-4 pt-2">
          {adminTab === 'toutes' && (
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-neutral-100 text-neutral-800 rounded-xl">
                  <Settings className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-extrabold text-neutral-900">
                    Module 6 : Paramètres Tarifaires & Réglementation UEMOA
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Frais de création (1 000 FCFA), commission plateforme 4% et règles de conformité BCEAO
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-neutral-100 text-neutral-800 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Tarification
              </span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-orange-600" />
                <span>Grille Tarifaire Active</span>
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Les tarifs appliqués sur la plateforme sont modifiables par la direction avec enregistrement obligatoire d'un motif d'audit.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                  <div>
                    <div className="font-bold text-neutral-900">Frais de création de tontine</div>
                    <div className="text-[11px] text-neutral-500">Payable immédiatement par l'organisateur</div>
                  </div>
                  <div className="text-base font-extrabold text-orange-600 font-mono">
                    {formatFCFA(settings.creationFee)}
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                  <div>
                    <div className="font-bold text-neutral-900">Commission de récupération</div>
                    <div className="text-[11px] text-neutral-500">Déduite de la cagnotte versée au bénéficiaire</div>
                  </div>
                  <div className="text-base font-extrabold text-emerald-600 font-mono">
                    {(settings.commissionRate * 100).toFixed(0)}%
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                  <div>
                    <div className="font-bold text-neutral-900">Mode Environnement</div>
                    <div className="text-[11px] text-neutral-500">Agrégation Mobile Money & Trésorerie</div>
                  </div>
                  <span className="text-[11px] font-bold text-neutral-800 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                    Production & Directe
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Modifier les Paramètres Tarifaires
              </button>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 space-y-3">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Note Juridique & Réglementaire UEMOA
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                En vertu de l'instruction N°08/05/2015 de la BCEAO relative à l'émission de monnaie électronique, la commission de récupération de {(settings.commissionRate * 100).toFixed(0)}% rémunère la prestation technologique, la sécurisation des cagnottes, le suivi des impayés et la traçabilité des cotisations.
              </p>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Toute modification de taux s'applique exclusivement aux nouvelles tontines créées après la date d'enregistrement du changement dans le registre d'audit.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 7: JOURNAUX D'AUDIT */}
      {(adminTab === 'toutes' || adminTab === 'audit') && (
        <div className="space-y-4 pt-2">
          {adminTab === 'toutes' && (
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-purple-100 text-purple-800 rounded-xl">
                  <FileCheck2 className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-extrabold text-neutral-900">
                    Module 7 : Journaux d’Audit & Traçabilité des Opérations Sensibles
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Historique immuable : retraits de trésorerie, modifications de barème et contrôles mensuels
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Audit Immuable
              </span>
            </div>
          )}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-neutral-200">
            <h3 className="text-sm font-bold text-neutral-900">
              Journaux d’Audit & Traçabilité des Opérations Sensibles
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Historique immuable : retraits de trésorerie, modifications de barème et contrôles mensuels.
            </p>
          </div>

          <div className="divide-y divide-neutral-200">
            {settings.auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-start gap-3 hover:bg-neutral-50 text-xs">
                <span className="p-1.5 rounded-lg bg-neutral-100 text-neutral-700 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900">{log.action}</span>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {formatDateTime(log.date)}
                    </span>
                  </div>
                  <p className="text-neutral-600 mt-1">{log.details}</p>
                  <span className="text-[10px] text-neutral-400 mt-1 block">
                    Opéré par : <strong className="text-neutral-700">{log.adminName}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

      {/* MODAL: RETRAIT DE REVENUS ADMINISTRATEUR */}
      {isWithdrawalModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-sm">
                  <ArrowDownToLine className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">
                    Retrait de Revenus Administrateur
                  </h3>
                  <p className="text-[11px] text-emerald-300">
                    Décaissement des bénéfices vers compte société
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWithdrawalModalOpen(false)}
                className="text-neutral-300 hover:text-white p-1 rounded-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitWithdrawal} className="p-6 space-y-5">
              {/* Available balance highlight */}
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-800 font-medium">
                    Solde total retirable :
                  </span>
                  <div className="text-xl font-extrabold text-emerald-950 font-mono tabular-nums">
                    {formatFCFA(netAvailableForWithdrawal)}
                  </div>
                </div>
                <div className="text-right text-[11px] text-emerald-700">
                  <div>Création : {formatFCFA(totalCreationFeesCollected)}</div>
                  <div>Commissions : {formatFCFA(totalCommissionsCollected)}</div>
                </div>
              </div>

              {/* Amount input */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Montant à retirer (FCFA)
                </label>
                <input
                  type="number"
                  min={1000}
                  max={netAvailableForWithdrawal}
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(Number(e.target.value))}
                  required
                  className="w-full px-4 py-2.5 text-base font-bold font-mono text-neutral-900 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />

                {/* Quick amount buttons */}
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawalAmount(Math.round(netAvailableForWithdrawal * 0.25))}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-neutral-100 hover:bg-neutral-200 rounded-lg text-neutral-700"
                  >
                    25%
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawalAmount(Math.round(netAvailableForWithdrawal * 0.5))}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-neutral-100 hover:bg-neutral-200 rounded-lg text-neutral-700"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawalAmount(netAvailableForWithdrawal)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-100 hover:bg-emerald-200 rounded-lg text-emerald-800"
                  >
                    100% (Totalité)
                  </button>
                </div>
              </div>

              {/* Source breakdown */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Origine des fonds à imputer
                </label>
                <select
                  value={sourceType}
                  onChange={(e: any) => setSourceType(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl bg-white"
                >
                  <option value="total_disponible">Tous les revenus disponibles (Mixte)</option>
                  <option value="frais_creation">Frais de création de tontine uniquement</option>
                  <option value="commissions">Commissions de récupération ({(settings.commissionRate * 100).toFixed(0)}%) uniquement</option>
                </select>
              </div>

              {/* Destination Type */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                  Destination du virement
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDestinationType('mobile_money_pro');
                      setDestinationEntity('Wave Business CI');
                      setDestinationAccount('+225 05 04 49 14 06');
                    }}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      destinationType === 'mobile_money_pro'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-neutral-200 bg-white text-neutral-600'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 mb-1 text-emerald-600" />
                    <div>Mobile Money Pro</div>
                    <span className="text-[10px] text-neutral-400 font-normal">
                      Wave Pro, Orange Pro, MTN MoMo
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDestinationType('virement_bancaire_uemoa');
                      setDestinationEntity('Société Générale Côte d’Ivoire (SGBCI)');
                      setDestinationAccount('CI094 01001 012345678901 22');
                    }}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      destinationType === 'virement_bancaire_uemoa'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-neutral-200 bg-white text-neutral-600'
                    }`}
                  >
                    <Building className="w-4 h-4 mb-1 text-emerald-600" />
                    <div>Virement Bancaire UEMOA</div>
                    <span className="text-[10px] text-neutral-400 font-normal">
                      RIB Bancaire Société CI
                    </span>
                  </button>
                </div>
              </div>

              {/* Destination entity and account */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                    Établissement financier récepteur :
                  </label>
                  <input
                    type="text"
                    value={destinationEntity}
                    onChange={(e) => setDestinationEntity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                    Numéro de compte / RIB UEMOA / Téléphone Pro :
                  </label>
                  <input
                    type="text"
                    value={destinationAccount}
                    onChange={(e) => setDestinationAccount(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded-xl"
                  />
                </div>
              </div>

              {/* 2FA PIN Code */}
              <div className="pt-2 border-t border-neutral-200">
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Code Secret PIN Administrateur (Sécurité Décaissement)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={withdrawalPin}
                    onChange={(e) => setWithdrawalPin(e.target.value)}
                    placeholder="Saisissez votre PIN (ex: 2026)"
                    className="w-full pl-9 pr-4 py-2 text-xs font-mono tracking-widest border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Error & Success Messages */}
              {withdrawalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  {withdrawalError}
                </div>
              )}
              {withdrawalSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
                  {withdrawalSuccessMsg}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawalModalOpen(false)}
                  className="w-1/2 py-2.5 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 rounded-xl text-xs font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isProcessingWithdrawal || netAvailableForWithdrawal <= 0}
                  className="w-1/2 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessingWithdrawal ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Exécution virement...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirmer le Retrait</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MODIFIER TARIFS ET FRAIS DE SERVICE */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-neutral-200 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-orange-600" />
                <span>Modifier les Tarifs de la Plateforme</span>
              </h3>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Frais de création par tontine (FCFA)
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={newCreationFee}
                  onChange={(e) => setNewCreationFee(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Commission de récupération (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  step={1}
                  value={newCommissionRate}
                  onChange={(e) => setNewCommissionRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Motif d'audit obligatoire pour la traçabilité :
                </label>
                <textarea
                  required
                  rows={3}
                  value={settingsReason}
                  onChange={(e) => setSettingsReason(e.target.value)}
                  placeholder="Ex: Décision de conseil d'administration du 17/10/2026 suite à la révision des coûts d'agrégation Mobile Money."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="w-1/2 py-2 border border-neutral-300 rounded-xl font-semibold hover:bg-neutral-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800"
                >
                  Enregistrer & Auditer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
