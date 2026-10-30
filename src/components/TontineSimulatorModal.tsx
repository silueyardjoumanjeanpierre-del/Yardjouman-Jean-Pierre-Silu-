/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA, calculateTontineEconomics } from '../utils/formatters';
import { getWhatsAppBusinessLink } from '../utils/whatsapp';
import {
  X,
  Calculator,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Users,
  Calendar,
  Sparkles,
  MessageCircle,
  Percent,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';

interface TontineSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TontineSimulatorModal: React.FC<TontineSimulatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, setActiveView } = useApp();

  const [contribution, setContribution] = useState<number>(25000);
  const [participants, setParticipants] = useState<number>(8);
  const [frequency, setFrequency] = useState<'hebdomadaire' | 'mensuelle'>('mensuelle');

  if (!isOpen) return null;

  const commissionRate = settings.commissionRate; // 4% (0.04)
  const creationFee = settings.creationFee; // 1 000 FCFA

  const economics = calculateTontineEconomics(contribution, participants, commissionRate);

  // Microfinance comparison calculation (standard MFI interest rate in Côte d'Ivoire is ~2% per month or 24% annual)
  const durationMonths = frequency === 'mensuelle' ? participants : Math.ceil(participants / 4);
  const mfiInterestRate = 0.02 * durationMonths; // e.g. 16% for 8 months
  const mfiCost = Math.round(economics.totalPot * mfiInterestRate);
  const tontineFee = economics.commissionAmount; // 4%
  const savingsVsCredit = Math.max(0, mfiCost - tontineFee);

  const handleCreateNow = () => {
    onClose();
    setActiveView('creer_tontine');
  };

  const whatsappMessage = `📊 *Simulation Tontine IVOIRETONTINE*\n\n💰 Cotisation : ${formatFCFA(contribution)} / ${frequency}\n👥 Participants : ${participants} membres\n🎯 Cagnotte brute : ${formatFCFA(economics.totalPot)}\n💼 Commission de gestion (4%) : ${formatFCFA(economics.commissionAmount)}\n✨ *Montant Net Reçu : ${formatFCFA(economics.netPayout)}*\n🔒 Frais d'ouverture du groupe : 1 000 FCFA unique\n\nRejoignez ou créez votre tontine sur ivoiretontine.ci`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-950 text-orange-400 px-2 py-0.5 rounded border border-orange-800">
                  Simulateur Économique
                </span>
                <span className="text-xs text-neutral-400">Règle BCEAO : Com. 4%</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Simulateur d'Épargne Rotative & Cagnottes
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-neutral-50 p-5 rounded-2xl border border-neutral-200">
            {/* 1. Contribution */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-bold text-neutral-900">Cotisation par membre</label>
                <span className="font-mono font-extrabold text-orange-600 text-sm">
                  {formatFCFA(contribution)}
                </span>
              </div>
              <input
                type="range"
                min={5000}
                max={200000}
                step={5000}
                value={contribution}
                onChange={(e) => setContribution(Number(e.target.value))}
                className="w-full accent-orange-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>5 000 F</span>
                <span>50 000 F</span>
                <span>200 000 F</span>
              </div>
            </div>

            {/* 2. Number of participants */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-bold text-neutral-900">Nombre de membres</label>
                <span className="font-mono font-extrabold text-neutral-900 text-sm">
                  {participants} participants
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={20}
                step={1}
                value={participants}
                onChange={(e) => setParticipants(Number(e.target.value))}
                className="w-full accent-orange-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>3 pers.</span>
                <span>10 pers.</span>
                <span>20 pers.</span>
              </div>
            </div>

            {/* 3. Frequency */}
            <div className="space-y-2">
              <label className="block font-bold text-neutral-900">Fréquence des tours</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFrequency('hebdomadaire')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    frequency === 'hebdomadaire'
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                  }`}
                >
                  Hebdo (Semaine)
                </button>
                <button
                  type="button"
                  onClick={() => setFrequency('mensuelle')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    frequency === 'mensuelle'
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                  }`}
                >
                  Mensuelle (Mois)
                </button>
              </div>
              <span className="text-[10px] text-neutral-500 block text-center">
                Durée totale du cycle : {participants} {frequency === 'mensuelle' ? 'mois' : 'semaines'}
              </span>
            </div>
          </div>

          {/* Results Big Card */}
          <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950 text-white p-6 rounded-3xl border border-neutral-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-700/80 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800 font-mono">
                  Montant Net Versé au Bénéficiaire
                </span>
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white mt-1 tabular-nums">
                  {formatFCFA(economics.netPayout)}
                </div>
                <p className="text-xs text-neutral-300 mt-1">
                  Reçu directement sur le compte Mobile Money (Wave, Orange, MTN, Moov) au tour tiré au sort.
                </p>
              </div>

              <div className="bg-neutral-800/80 p-3 rounded-2xl border border-neutral-700 shrink-0 text-right">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Cagnotte Brute</span>
                <div className="text-lg font-bold font-mono text-neutral-200">
                  {formatFCFA(economics.totalPot)}
                </div>
                <span className="text-[10px] text-neutral-400">
                  {participants} × {formatFCFA(contribution)}
                </span>
              </div>
            </div>

            {/* Breakdown table */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-neutral-800/60 p-3 rounded-xl border border-neutral-700/60">
                <span className="text-neutral-400 text-[10px] uppercase font-bold">Frais d'ouverture groupe</span>
                <div className="text-sm font-extrabold font-mono text-orange-400 mt-0.5">
                  1 000 FCFA
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Payé 1 seule fois par le créateur pour sécuriser le groupe.
                </p>
              </div>

              <div className="bg-neutral-800/60 p-3 rounded-xl border border-neutral-700/60">
                <span className="text-neutral-400 text-[10px] uppercase font-bold">
                  Commission de gestion ({(commissionRate * 100).toFixed(0)}%)
                </span>
                <div className="text-sm font-extrabold font-mono text-emerald-400 mt-0.5">
                  - {formatFCFA(economics.commissionAmount)}
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Déduite automatiquement au versement de la cagnotte.
                </p>
              </div>

              <div className="bg-neutral-800/60 p-3 rounded-xl border border-neutral-700/60">
                <span className="text-neutral-400 text-[10px] uppercase font-bold">Total Épargné Net</span>
                <div className="text-sm font-extrabold font-mono text-white mt-0.5">
                  100% garanti
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Suivi transparent sans contestation ni retard.
                </p>
              </div>
            </div>
          </div>

          {/* Microfinance vs Tontine Comparison */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-emerald-950 text-sm">
                Comparatif Anti-Usure : Vous économisez environ {formatFCFA(savingsVsCredit)} !
              </div>
              <p className="text-emerald-800 text-xs leading-relaxed">
                Contrairement à un microcrédit bancaire classique facturé à plus de <strong>24% TAEG</strong> (soit environ {formatFCFA(mfiCost)} d'intérêts et de frais de dossier), la tontine solidaire numérique ne vous coûte que <strong>4%</strong> tout en vous permettant de disposer immédiatement de votre capital.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <a
              href={getWhatsAppBusinessLink(whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Partager la simulation sur WhatsApp</span>
            </a>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={handleCreateNow}
                className="w-full sm:w-auto px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>Créer cette tontine (1 000 F)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
