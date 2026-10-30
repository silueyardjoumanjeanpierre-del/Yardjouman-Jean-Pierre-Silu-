import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Search,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Coins,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  MessageCircleQuestion,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatFCFA } from '../utils/formatters';

interface FAQItem {
  id: string;
  category: 'cotisation' | 'frais_commissions' | 'mobile_money' | 'securite' | 'creation';
  question: string;
  answer: string;
  tags: string[];
  highlight?: string;
}

export const DynamicFAQSection: React.FC = () => {
  const { settings, setIsGeminiModalOpen } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>('faq_1');

  const faqItems: FAQItem[] = useMemo(() => [
    {
      id: 'faq_1',
      category: 'frais_commissions',
      question: "Pourquoi des frais d'ouverture de 1 000 FCFA sont-ils exigés à la création d'une tontine ?",
      answer: `Les frais forfaitaires de ${formatFCFA(settings.creationFee)} sont prélevés une seule fois par l'initiateur lors de l'enregistrement de la tontine. Ils couvrent l'ouverture de l'espace numérique sécurisé, l'audit initial du groupe et constituent un gage de sérieux pour décourager la création de faux groupes non viables.`,
      tags: ['Frais', '1 000 FCFA', 'Création', 'Engagement'],
      highlight: 'Frais unique de 1 000 FCFA payé par Mobile Money',
    },
    {
      id: 'faq_2',
      category: 'frais_commissions',
      question: `Comment est calculée la commission de ${(settings.commissionRate * 100).toFixed(0)}% lors du versement de la cagnotte ?`,
      answer: `La commission de ${(settings.commissionRate * 100).toFixed(0)}% s'applique exclusivement lors du déblocage de la cagnotte au bénéficiaire désigné du tour. Exemple : sur une cagnotte brute collectée de 100 000 FCFA, 4 000 FCFA de commission plateforme sont retenus et 96 000 FCFA nets sont versés instantanément sur le compte Mobile Money du bénéficiaire. Les cotisations des membres restent exemptes de frais additionnels.`,
      tags: ['Commission 4%', 'Cagnotte', 'Versement net'],
      highlight: 'Déduite uniquement lors du versement net',
    },
    {
      id: 'faq_3',
      category: 'mobile_money',
      question: "Quels opérateurs Mobile Money sont acceptés en Côte d'Ivoire ?",
      answer: `IVOIRETONTINE prend en charge l'ensemble des principaux portefeuilles de monnaie électronique agréés : Wave Côte d'Ivoire, Orange Money, MTN Mobile Money et Moov Money. Chaque transaction est confirmée par un accusé de réception électronique doté d'une référence unique (ex: TXN-...).`,
      tags: ['Wave', 'Orange Money', 'MTN MoMo', 'Moov', 'UEMOA'],
      highlight: 'Interconnexion instantanée Wave & Opérateurs Télécoms',
    },
    {
      id: 'faq_4',
      category: 'cotisation',
      question: "Que se passe-t-il si un participant a du retard ou ne cotise pas à son tour ?",
      answer: `Notre protocole prévoit 3 niveaux de protection : (1) des rappels automatiques push et SMS envoyés le jour J et la veille, (2) le blocage de la réception de sa future cagnotte tant que les arriérés ne sont pas soldés, (3) l'activation du fonds de garantie mutualisé et la réattribution du tour par l'administrateur avec dossier de litige ouvert au centre de médiation.`,
      tags: ['Retard', 'Rappels', 'Sanction', 'Médiation'],
      highlight: 'Rappels automatisés & Sécurisation stricte',
    },
    {
      id: 'faq_5',
      category: 'securite',
      question: "IVOIRETONTINE est-elle conforme aux réglementations de la BCEAO et de l'UEMOA ?",
      answer: `Oui. Conformément aux directives de la Banque Centrale des États de l'Afrique de l'Ouest (BCEAO) sur l'intermédiation financière numérique et les services de paiement, IVOIRETONTINE n'effectue aucun dépôt bancaire illégal. La conservation et le transfert des fonds sont opérés directement par les émetteurs de monnaie électronique (EME) agréés.`,
      tags: ['BCEAO', 'UEMOA', 'Réglementation', 'Conformité'],
      highlight: 'Conformité légale UEMOA stricte',
    },
    {
      id: 'faq_6',
      category: 'creation',
      question: "Comment est déterminé l'ordre de passage des bénéficiaires ?",
      answer: `Le créateur peut choisir entre deux modes lors du paramétrage : le Tirage au sort électronique transparent (généré et scellé par l'algorithme) ou l'Ordre d'inscription validé par accord mutuel des membres. Une fois la tontine démarrée, l'ordre est public, immuable et consultable par tous les participants.`,
      tags: ['Tirage au sort', 'Ordre des tours', 'Transparence'],
      highlight: 'Algorithme audité et immuable',
    },
    {
      id: 'faq_7',
      category: 'cotisation',
      question: "Puis-je télécharger un reçu officiel pour ma comptabilité personnelle ?",
      answer: `Absolument. Chaque versement de cotisation ou réception de cagnotte génère un reçu numérique infalsifiable conforme aux normes de traçabilité, avec code de vérification, horodatage certifié, montant en FCFA et identifiant de l'opérateur. Vous pouvez l'imprimer ou le télécharger à tout moment depuis l'historique des transactions.`,
      tags: ['Reçu officiel', 'Comptabilité', 'PDF', 'Traçabilité'],
      highlight: 'Reçu officiel téléchargeable',
    },
    {
      id: 'faq_8',
      category: 'mobile_money',
      question: "Comment contacter directement l'assistance par WhatsApp Business ?",
      answer: `Notre ligne officielle WhatsApp Business (+225 05 86 80 19 59) est ouverte du lundi au samedi de 07h à 21h GMT. Vous pouvez échanger en direct avec un conseiller pour valider un paiement Mobile Money (Wave, Orange, MTN, Moov), certifier votre pièce d'identité ou signaler un retard de cotisation.`,
      tags: ['WhatsApp', 'Support direct', '05 86 80 19 59', 'Assistance en ligne'],
      highlight: 'Support direct WhatsApp +225 05 86 80 19 59',
    },
  ], [settings]);

  const categories = [
    { id: 'all', label: 'Toutes les questions' },
    { id: 'frais_commissions', label: `Frais & Commissions (${(settings.commissionRate * 100).toFixed(0)}%)` },
    { id: 'mobile_money', label: 'Mobile Money & Paiements' },
    { id: 'cotisation', label: 'Cotisations & Retards' },
    { id: 'securite', label: 'Sécurité & BCEAO' },
    { id: 'creation', label: 'Création & Tirage' },
  ];

  const filteredItems = useMemo(() => {
    return faqItems.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.tags.some((t) => t.toLowerCase().includes(query));
      return matchCat && matchQuery;
    });
  }, [faqItems, selectedCategory, searchQuery]);

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
            <HelpCircle className="w-4 h-4" />
            <span>Base de Connaissance Dynamique</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            Foire Aux Questions Fréquentes (FAQ)
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Trouvez des réponses instantanées adaptées aux réalités financières ivoiriennes.
          </p>
        </div>

        {/* AI Assistant Quick Trigger */}
        <button
          onClick={() => setIsGeminiModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 self-start md:self-auto shrink-0"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>Demander à l'IA IVOIRE-CONSEIL</span>
        </button>
      </div>

      {/* Dynamic Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher par mot-clé (ex: Wave, 1000 FCFA, commission 4%, retard, BCEAO, reçu)..."
          className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-neutral-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700 font-bold px-1.5 py-0.5 rounded"
          >
            Effacer
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Accordion Questions List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-300 space-y-3">
            <MessageCircleQuestion className="w-8 h-8 text-neutral-400 mx-auto" />
            <p className="text-xs text-neutral-600">
              Aucune question ne correspond à votre recherche « <strong>{searchQuery}</strong> ».
            </p>
            <button
              onClick={() => setIsGeminiModalOpen(true)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Poser cette question spécifique au conseiller IA</span>
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isExpanded
                    ? 'border-orange-200 bg-orange-50/20 shadow-xs'
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                        {item.category.replace('_', ' ')}
                      </span>
                      {item.highlight && (
                        <span className="text-[10px] font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
                          {item.highlight}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-neutral-900 leading-snug">
                      {item.question}
                    </h3>
                  </div>
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                      isExpanded ? 'rotate-180 bg-orange-100 text-orange-700' : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 space-y-3">
                    <p className="whitespace-pre-line">{item.answer}</p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {item.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
