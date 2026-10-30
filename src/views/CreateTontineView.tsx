import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA, calculateTontineEconomics } from '../utils/formatters';
import {
  PlusCircle,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calculator,
  Lock,
  Layers,
  Sparkles,
  Smartphone,
  Eye,
} from 'lucide-react';
import { TontineFrequency, PayoutStrategy } from '../types';

export const CreateTontineView: React.FC = () => {
  const { currentUser, settings, openPaymentModal, createTontine, setActiveView, setSelectedTontineId } = useApp();

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Projets Commerciaux & Investissement');
  const [description, setDescription] = useState('');
  const [contributionAmount, setContributionAmount] = useState<number>(20000);
  const [frequency, setFrequency] = useState<TontineFrequency>('mensuelle');
  const [participantsCount, setParticipantsCount] = useState<number>(6);
  const [rules, setRules] = useState(
    'Cotisation obligatoire au plus tard 24h avant la date du tour. Tout retard supérieur à 48h entraîne une pénalité forfaitaire de 2 000 FCFA reversée au bénéficiaire du tour. Solidarité et respect de rigueur.'
  );
  const [payoutStrategy, setPayoutStrategy] = useState<PayoutStrategy>('tirage_transparent');
  const [isPublic, setIsPublic] = useState(true);

  // Economic calculations
  const economics = calculateTontineEconomics(contributionAmount, participantsCount, settings.commissionRate);

  const handleInitiateCreationPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Veuillez donner un nom à votre tontine.');
      return;
    }

    // Open Mobile Money payment modal to pay the mandatory 1 000 FCFA creation fee
    openPaymentModal({
      title: `Frais d'ouverture : ${name}`,
      amount: settings.creationFee, // 1 000 FCFA
      type: 'frais_creation',
      metadata: {
        tontineName: name,
      },
      onSuccess: (txn) => {
        // Automatically create and activate tontine
        const newTontine = createTontine(
          {
            name,
            category,
            description,
            creatorId: currentUser.id,
            creatorName: currentUser.name,
            creatorPhone: currentUser.phone,
            contributionAmount,
            frequency,
            participantsCount,
            durationMonths: frequency === 'mensuelle' ? participantsCount : Math.ceil(participantsCount / 4),
            rules,
            payoutStrategy,
            status: 'en_attente_participants',
            commissionRate: settings.commissionRate,
            isPublic,
            participants: [
              {
                id: `tp_${Date.now()}`,
                userId: currentUser.id,
                name: currentUser.name,
                phone: currentUser.phone,
                orderPosition: 1,
                payoutDate: 'Tour 1 (Créateur)',
                hasReceivedPayout: false,
                contributionsPaidCount: 0,
                isCurrentTurn: true,
                avatar: currentUser.avatarUrl,
              },
            ],
            rounds: [],
            nextDueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
          },
          txn.id
        );

        setSelectedTontineId(newTontine.id);
        setActiveView('details_tontine');
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
          <PlusCircle className="w-4 h-4" />
          <span>Nouvelle Tontine Numérique</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
          Créer un groupe d'épargne rotative
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Configurez votre tontine, validez les frais de création de {settings.creationFee} FCFA et invitez vos premiers membres.
        </p>
      </div>

      {/* Mandatory Creation Fee Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 space-y-1">
          <div className="font-bold text-sm text-amber-950">
            Frais d'ouverture obligatoires : {formatFCFA(settings.creationFee)}
          </div>
          <p className="leading-relaxed">
            Conformément aux conditions de la plateforme, l'ouverture d'une tontine est conditionnée par le règlement préalable de <strong>{formatFCFA(settings.creationFee)}</strong> via Mobile Money. Cette mesure garantit la fiabilité des organisateurs et protège les futurs participants contre les groupes fantômes.
          </p>
        </div>
      </div>

      <form onSubmit={handleInitiateCreationPayment} className="space-y-8">
        {/* Step 1: Informations Générales */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
            1. Informations Générales
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Nom de la tontine *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Tontine Femmes d'Affaires Marcory"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Catégorie de projet
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              >
                <option value="Projets Commerciaux & Investissement">Commerce & Stock Marchandise</option>
                <option value="Épargne Familiale & Conviviale">Épargne Familiale & Conviviale</option>
                <option value="Équipement & Matériel Pro">Équipement Pro & Informatique</option>
                <option value="Immobilier & Terrain">Fonds Travaux & Logement</option>
                <option value="Trésorerie Express">Trésorerie & Fonds de Roulement</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Description de l'objectif
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Expliquez brièvement l'esprit et la finalité de cette tontine..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
        </div>

        {/* Step 2: Paramètres Financiers & Décomposition */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
              2. Paramètres Financiers & Calendrier
            </h3>
            <span className="text-xs text-neutral-500">Devise : Franc CFA (XOF)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Montant de chaque cotisation
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={2000}
                  step={1000}
                  required
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs font-bold font-mono rounded-xl border border-neutral-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <span className="text-[10px] text-neutral-400 mt-1 block">Min. 2 000 FCFA</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Fréquence des versements
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as TontineFrequency)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white capitalize"
              >
                <option value="hebdomadaire">Hebdomadaire (Chaque semaine)</option>
                <option value="bimensuelle">Bimensuelle (Toutes les 2 semaines)</option>
                <option value="mensuelle">Mensuelle (Chaque mois)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Nombre de participants
              </label>
              <input
                type="number"
                min={3}
                max={25}
                required
                value={participantsCount}
                onChange={(e) => setParticipantsCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs font-bold font-mono rounded-xl border border-neutral-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">Entre 3 et 25 membres</span>
            </div>
          </div>

          {/* Live Financial Transparency Breakdown */}
          <div className="bg-neutral-900 text-white rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Tableau de Décomposition Financière
              </span>
              <span className="text-xs text-emerald-400 font-semibold">
                Commission {(settings.commissionRate * 100).toFixed(0)}% appliquée
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-neutral-800/80 p-3 rounded-xl border border-neutral-700">
                <span className="text-neutral-400 block text-[11px]">Cagnotte brute collectée :</span>
                <span className="text-base font-bold font-mono text-white tabular-nums mt-0.5 block">
                  {formatFCFA(economics.totalPot)}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {participantsCount} cotisations de {formatFCFA(contributionAmount)}
                </span>
              </div>

              <div className="bg-neutral-800/80 p-3 rounded-xl border border-neutral-700">
                <span className="text-neutral-400 block text-[11px]">Commission IVOIRETONTINE ({(settings.commissionRate * 100).toFixed(0)}%) :</span>
                <span className="text-base font-bold font-mono text-orange-400 tabular-nums mt-0.5 block">
                  - {formatFCFA(economics.commissionAmount)}
                </span>
                <span className="text-[10px] text-neutral-400">
                  Prélevée à la remise des fonds
                </span>
              </div>

              <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/60">
                <span className="text-emerald-400 block text-[11px] font-semibold">
                  Montant net par bénéficiaire :
                </span>
                <span className="text-lg font-extrabold font-mono text-emerald-300 tabular-nums mt-0.5 block">
                  {formatFCFA(economics.netPayout)}
                </span>
                <span className="text-[10px] text-emerald-400/80">
                  Viré par Mobile Money
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Règles et Attribution de l'Ordre */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
            3. Règles de Fonctionnement & Ordre des Tours
          </h3>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">
              Méthode d'attribution des tours de tirage
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'tirage_transparent',
                  title: 'Tirage au Sort Audité',
                  desc: 'Le système effectue un tirage aléatoire horodaté dès que le groupe est complet.',
                },
                {
                  id: 'ordre_inscription',
                  title: 'Ordre d’Inscription',
                  desc: 'Premier arrivé, premier servi selon la date de validation de l’adhésion.',
                },
                {
                  id: 'accord_mutuel',
                  title: 'Accord Mutuel',
                  desc: 'Les participants négocient et conviennent de l’ordre par consensus.',
                },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPayoutStrategy(m.id as PayoutStrategy)}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    payoutStrategy === m.id
                      ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500/20 font-medium text-neutral-900'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  <div className="font-bold text-xs mb-1">{m.title}</div>
                  <div className="text-[11px] text-neutral-500 leading-snug">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Règlement intérieur et pénalités de retard
            </label>
            <textarea
              rows={3}
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded border-neutral-300 focus:ring-orange-500"
            />
            <label htmlFor="isPublic" className="text-xs text-neutral-700 cursor-pointer">
              Rendre cette tontine visible dans le catalogue public (les utilisateurs peuvent demander à rejoindre)
            </label>
          </div>
        </div>

        {/* Submit & Fee Payment Action */}
        <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-neutral-600">
            En cliquant sur Continuer, vous serez redirigé vers le guichet Mobile Money pour payer les{' '}
            <strong className="text-neutral-900">{formatFCFA(settings.creationFee)}</strong> de frais d'ouverture.
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Smartphone className="w-4 h-4" />
            <span>Payer {formatFCFA(settings.creationFee)} & Créer la Tontine</span>
          </button>
        </div>
      </form>
    </div>
  );
};
