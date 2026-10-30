import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA, calculateTontineEconomics } from '../utils/formatters';
import { IMAGES } from '../utils/images';
import {
  ShieldCheck,
  TrendingUp,
  Users,
  Smartphone,
  ArrowRight,
  Calculator,
  Lock,
  CheckCircle2,
  Sparkles,
  Award,
  CircleDollarSign,
  HeartPulse,
  Database,
  Bot,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    setActiveView,
    openPaymentModal,
    tontines,
    setIsGeminiModalOpen,
    setIsAuthModalOpen,
    settings,
  } = useApp();

  // Interactive Simulator State
  const [simContribution, setSimContribution] = useState<number>(25000);
  const [simParticipants, setSimParticipants] = useState<number>(8);
  const [simFrequency, setSimFrequency] = useState<'hebdomadaire' | 'bimensuelle' | 'mensuelle'>('mensuelle');

  const economics = calculateTontineEconomics(simContribution, simParticipants, settings.commissionRate);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION WITH GENERATED IMAGE */}
      <section className="relative overflow-hidden bg-neutral-900 text-white pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Ambient Gradient Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800/80 border border-neutral-700 text-xs font-medium text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span>Plateforme Numérique de Tontines en Côte d'Ivoire</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
                La tontine africaine modernisée, transparente et sécurisée.
              </h1>

              <p className="text-base sm:text-lg text-neutral-300 max-w-xl font-normal leading-relaxed">
                Créez ou rejoignez un groupe d'épargne rotative en toute confiance. Cotisez par Mobile Money (Wave, Orange, MTN, Moov), suivez l'ordre des tours sans contestation et recevez votre cagnotte nette en direct.
              </p>

              {/* Economic Model Highlights */}
              <div className="grid grid-cols-2 gap-3 pt-2 max-w-lg">
                <div className="p-3 bg-neutral-800/60 rounded-xl border border-neutral-700/80">
                  <div className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">
                    Frais de création
                  </div>
                  <div className="text-lg font-bold text-orange-400 font-mono mt-0.5">
                    1 000 FCFA
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Payables pour ouvrir un groupe
                  </div>
                </div>

                <div className="p-3 bg-neutral-800/60 rounded-xl border border-neutral-700/80">
                  <div className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">
                    Commission de récupération
                  </div>
                  <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                    {(settings.commissionRate * 100).toFixed(0)}%
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Déduite de la cagnotte finale
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
                <button
                  onClick={() => setActiveView('creer_tontine')}
                  className="px-6 py-3.5 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <span>Créer une tontine (1 000 FCFA)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveView('catalogue')}
                  className="px-6 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-sm font-semibold rounded-xl border border-neutral-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Rejoindre un groupe</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex items-center gap-6 text-xs text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Sandbox BCEAO UEMOA</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-orange-400" />
                  <span>Wave · Orange · MTN · Moov</span>
                </div>
              </div>
            </div>

            {/* Right Column: High Quality Generated Hero Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-neutral-700 aspect-[16/10] sm:aspect-[4/3] lg:aspect-[4/3] bg-neutral-800">
                <img
                  src={IMAGES.hero}
                  alt="Utilisatrice IVOIRETONTINE vérifiant son épargne à Abidjan"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent pointer-events-none" />

                {/* Floating overlay badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-3.5 text-neutral-900 border border-neutral-200/80 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-extrabold text-sm">
                        ✓
                      </div>
                      <div>
                        <div className="text-xs font-bold text-neutral-900">
                          Cagnotte Tour 1 Versée
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Aminata Koné · 225 000 FCFA nets
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Wave CI
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REAL-TIME TONTINE SIMULATOR & ECONOMIC CALCULATOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Inputs & Parameters */}
            <div className="lg:col-span-7 p-6 sm:p-10 space-y-6">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
                  <Calculator className="w-4 h-4" />
                </span>
                <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
                  Simulateur de Tontine & Transparence Financière
                </h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Testez en direct les flux financiers d'une tontine selon la cotisation choisie et le nombre de participants. Les frais et la commission de {(settings.commissionRate * 100).toFixed(0)}% sont calculés automatiquement.
              </p>

              {/* Contribution Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-neutral-700">Cotisation par membre :</span>
                  <span className="font-mono text-orange-600 font-bold text-sm">
                    {formatFCFA(simContribution)}
                  </span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={200000}
                  step={5000}
                  value={simContribution}
                  onChange={(e) => setSimContribution(Number(e.target.value))}
                  className="w-full accent-orange-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>5 000 FCFA</span>
                  <span>50 000 FCFA</span>
                  <span>100 000 FCFA</span>
                  <span>200 000 FCFA</span>
                </div>
              </div>

              {/* Number of participants */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-neutral-700">Nombre de participants :</span>
                  <span className="font-mono text-neutral-900 font-bold text-sm">
                    {simParticipants} membres ({simParticipants} tours)
                  </span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={20}
                  step={1}
                  value={simParticipants}
                  onChange={(e) => setSimParticipants(Number(e.target.value))}
                  className="w-full accent-neutral-900 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>3 membres</span>
                  <span>10 membres</span>
                  <span>20 membres</span>
                </div>
              </div>

              {/* Frequency selection */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2">
                  Fréquence des cotisations :
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['hebdomadaire', 'bimensuelle', 'mensuelle'] as const).map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setSimFrequency(freq)}
                      className={`py-2 px-3 text-xs font-medium rounded-xl border text-center capitalize transition-all ${
                        simFrequency === freq
                          ? 'border-orange-500 bg-orange-50 text-orange-950 font-bold ring-2 ring-orange-500/20'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Economic Outcome Panel */}
            <div className="lg:col-span-5 bg-neutral-950 text-white p-6 sm:p-10 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Décomposition financière par tour
                </span>
                <div className="text-sm font-semibold text-neutral-200 mt-1">
                  Chaque participant reçoit à son tour :
                </div>

                {/* Big Net Payout */}
                <div className="mt-4 pt-4 border-t border-neutral-800">
                  <div className="text-xs text-emerald-400 font-medium">
                    Montant net viré au bénéficiaire
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono tracking-tight tabular-nums mt-1">
                    {formatFCFA(economics.netPayout)}
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-2 mt-6 pt-4 border-t border-neutral-800 text-xs text-neutral-300">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Cagnotte totale brute ({simParticipants} × {formatFCFA(simContribution)}) :</span>
                    <span className="font-mono font-semibold tabular-nums">
                      {formatFCFA(economics.totalPot)}
                    </span>
                  </div>

                  <div className="flex justify-between text-orange-400">
                    <span>Commission de récupération IVOIRETONTINE ({(settings.commissionRate * 100).toFixed(0)}%) :</span>
                    <span className="font-mono font-semibold tabular-nums">
                      - {formatFCFA(economics.commissionAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between text-neutral-400">
                    <span>Frais de création de la tontine (payés 1 seule fois) :</span>
                    <span className="font-mono font-semibold text-neutral-200">
                      1 000 FCFA
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setActiveView('creer_tontine')}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <span>Créer cette tontine (1 000 FCFA)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THREE CORE PILLARS OF IVOIRETONTINE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Pourquoi passer à la tontine numérique ?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            Fini les disputes de carnets, les retards inexpliqués ou les disparitions de cagnottes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <CircleDollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">
              1. Création payante à 1 000 FCFA
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Pour éviter les groupes fantômes et responsabiliser les initiateurs, chaque ouverture de tontine requiert un paiement préalable de 1 000 FCFA vérifié par notre passerelle.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">
              2. Mobile Money 100% Intégré
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Cotisez en un clic avec Wave, Orange Money, MTN MoMo ou Moov. Chaque transaction génère un reçu électronique horodaté avec identifiant unique et signature de sécurité.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">
              3. Tirage et Ordre Transparent
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              L'ordre de réception des fonds est fixé publiquement dès le premier jour (tirage au sort audité ou ordre d'inscription). Aucun favoritisme, tout est consultable en ligne.
            </p>
          </div>
        </div>
      </section>

      {/* INNOVATIONS: GEMINI AI, SANTÉ & BIOMÉDICAL, FIREBASE GOOGLE AUTH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider font-mono">
            Innovations Technologiques & Communautaires
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Intelligence Artificielle, Santé & Sécurité Cloud
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            Des outils de pointe intégrés pour sécuriser chaque étape de votre épargne en Côte d'Ivoire.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Gemini Chatbot */}
          <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white p-6 rounded-2xl border border-neutral-700 shadow-md flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-amber-200" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-orange-300 bg-orange-950/80 px-2 py-0.5 rounded border border-orange-800 font-mono">
                  Gemini Flash & Argon
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                Conseiller Virtuel IVOIRE-CONSEIL
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Posez vos questions en direct sur le calcul des cagnottes, la déduction des {(settings.commissionRate * 100).toFixed(0)}%, les frais de 1 000 FCFA et la réglementation BCEAO.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsGeminiModalOpen(true)}
              className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4" />
              <span>Ouvrir l'Assistant Gemini</span>
            </button>
          </div>

          {/* Card 2: Santé & Bioscience Tontines */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                  Science Skills · PubMed
                </span>
              </div>
              <h3 className="text-base font-bold text-neutral-900">
                Tontines de Santé & Pharmacie
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Caisses d'achats groupés pour traitements essentiels (paludisme, drépanocytose, maternité) avec accès direct à la littérature biomédicale Europe PMC.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('sante_biomedical')}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <HeartPulse className="w-4 h-4" />
              <span>Explorer le Module Santé</span>
            </button>
          </div>

          {/* Card 3: Firebase Google Auth & Firestore */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
                  Google Cloud Firestore
                </span>
              </div>
              <h3 className="text-base font-bold text-neutral-900">
                Authentification Google & Cloud
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Identifiez-vous de manière sécurisée avec votre compte Google et persistez vos données de tontines et reçus de paiement en direct.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Database className="w-4 h-4" />
              <span>Gérer mon Accès Google</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. COMMUNITY & SOCIAL PROOF WITH SECOND GENERATED IMAGE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-100 rounded-3xl p-6 sm:p-10 border border-neutral-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 rounded-2xl overflow-hidden shadow-md aspect-[4/3] bg-neutral-200">
              <img
                src={IMAGES.community}
                alt="Groupe de commerçants et entrepreneurs ivoiriens en tontine"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Solidarité & Croissance
              </span>
              <h3 className="text-2xl font-bold text-neutral-900 tracking-tight">
                Pour les commerçants d'Adjamé, les cadres du Plateau et les familles de Cocody.
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                De l'achat de stock de marchandises au financement de projets immobiliers ou scolaires, la tontine est au cœur de l'économie ivoirienne. IVOIRETONTINE lui donne un cadre numérique moderne et irréprochable.
              </p>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-white p-3 rounded-xl border border-neutral-200">
                  <div className="text-lg font-black text-neutral-900 font-mono">
                    {tontines.length}
                  </div>
                  <div className="text-[11px] text-neutral-500">Tontines actives</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-neutral-200">
                  <div className="text-lg font-black text-emerald-600 font-mono">
                    99.4%
                  </div>
                  <div className="text-[11px] text-neutral-500">Taux de cotisation</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-neutral-200">
                  <div className="text-lg font-black text-orange-600 font-mono">
                    0 FCFA
                  </div>
                  <div className="text-[11px] text-neutral-500">Litiges non résolus</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. REGULATORY BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-5 rounded-2xl bg-neutral-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-neutral-100 block">
                Cadre Réglementaire & Sécurité des Dépôts
              </span>
              <span className="text-neutral-400">
                L'application n'opère aucun stockage direct de fonds bancaires. Tous les flux transitent par les opérateurs agréés BCEAO.
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveView('cgu')}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700 whitespace-nowrap transition-colors"
          >
            Lire la conformité &rarr;
          </button>
        </div>
      </section>
    </div>
  );
};
