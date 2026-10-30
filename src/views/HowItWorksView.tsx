import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  CheckCircle2,
  Users,
  Smartphone,
  CircleDollarSign,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { IMAGES } from '../utils/images';

export const HowItWorksView: React.FC = () => {
  const { setActiveView } = useApp();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-orange-600 uppercase tracking-wider bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
          Guide Pédagogique
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
          Comment fonctionne IVOIRETONTINE ?
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
          Numériser la solidarité africaine pour offrir une sécurité maximale, éliminer les défauts de paiement et garantir la transparence totale.
        </p>
      </div>

      {/* 4 Step Process */}
      <div className="space-y-6">
        {[
          {
            step: '01',
            title: 'Création et Frais d’Ouverture de 1 000 FCFA',
            desc: "L'initiateur configure les paramètres de sa tontine (montant, fréquence, nombre de participants). Pour valider l'ouverture et prouver son engagement, il règle des frais fixes de 1 000 FCFA via Mobile Money. Cette barrière élimine les faux groupes et responsabilise les créateurs.",
            tag: 'Source de revenu 1',
          },
          {
            step: '02',
            title: 'Adhésion et Ordre des Tours Transparent',
            desc: "Les membres rejoignent le groupe via un lien direct ou un code unique (ex: IVT-7821). Dès que le nombre requis de participants est atteint, l'ordre de réception de la cagnotte est scellé publiquement (par tirage au sort audité par le système ou par ordre d'arrivée). Plus aucune contestation possible.",
            tag: 'Transparence absolue',
          },
          {
            step: '03',
            title: 'Cotisations Périodiques Sécurisées',
            desc: "À chaque échéance, les participants reçoivent un rappel automatique par SMS et notification. Ils cotisent directement depuis leur compte Wave, Orange Money, MTN MoMo ou Moov Money. Chaque paiement génère un reçu électronique certifié avec identifiant unique.",
            tag: 'Zéro manipulation d’espèces',
          },
          {
            step: '04',
            title: 'Versement de la Cagnotte et Commission de 4%',
            desc: "Lorsque le tour arrive à son terme, la cagnotte totale est reversée instantanément sur le compte Mobile Money du bénéficiaire désigné, après déduction de la commission de récupération de 4% rémunérant le service technologique et la sécurisation. Exemple : sur 100 000 FCFA collectés, 96 000 FCFA nets sont versés.",
            tag: 'Source de revenu 2',
          },
        ].map((item) => (
          <div
            key={item.step}
            className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex flex-col md:flex-row gap-5 items-start"
          >
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-mono font-extrabold text-lg shrink-0">
              {item.step}
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                  {item.tag}
                </span>
              </div>
              <h3 className="text-base font-bold text-neutral-900">{item.title}</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Block with Generated Payment Confirmation Photo */}
      <div className="bg-neutral-900 text-white rounded-3xl p-6 sm:p-10 border border-neutral-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 rounded-2xl overflow-hidden aspect-[4/3] bg-neutral-800 shadow-lg">
            <img
              src={IMAGES.mobileMoney}
              alt="Confirmation de paiement Mobile Money sur smartphone"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Paiements & Réglementation
            </span>
            <h3 className="text-2xl font-bold tracking-tight">
              Une technologie d'escrow conforme aux directives de la BCEAO.
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              IVOIRETONTINE ne conserve aucun fonds sur ses propres serveurs et n'exerce aucune activité bancaire illégale de réception de dépôts. Les flux monétaires sont directement orchestrés entre les comptes de monnaie électronique des participants et des prestataires agréés en Côte d'Ivoire.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setActiveView('creer_tontine')}
                className="px-5 py-3 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-2"
              >
                <span>Créer une tontine maintenant (1 000 FCFA)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
