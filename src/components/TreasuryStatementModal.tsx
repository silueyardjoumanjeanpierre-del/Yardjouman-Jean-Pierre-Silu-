/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA, formatDateTime } from '../utils/formatters';
import { exportTreasuryStatementCSV } from '../utils/treasuryExport';
import {
  X,
  Printer,
  Download,
  Building,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  BadgeCheck,
} from 'lucide-react';

interface TreasuryStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TreasuryStatementModal: React.FC<TreasuryStatementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { transactions, adminWithdrawals, settings, currentUser } = useApp();

  if (!isOpen) return null;

  const totalVolumeGross = transactions
    .filter((t) => t.status === 'succes')
    .reduce((acc, t) => acc + t.amountGross, 0);

  const totalCreationFees = transactions
    .filter((t) => t.type === 'frais_creation' && t.status === 'succes')
    .reduce((acc, t) => acc + t.amountGross, 0);

  const totalCommissions = transactions
    .filter((t) => t.type === 'reception_cagnotte' && t.status === 'succes')
    .reduce((acc, t) => acc + t.feeAmount, 0);

  const totalRevenue = totalCreationFees + totalCommissions;

  const totalWithdrawn = adminWithdrawals
    .filter((w) => w.status === 'valide')
    .reduce((acc, w) => acc + w.amount, 0);

  const netAvailable = Math.max(0, totalRevenue - totalWithdrawn);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    exportTreasuryStatementCSV(
      transactions,
      adminWithdrawals,
      settings.commissionRate,
      settings.creationFee
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-600 text-white rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white">
                Bordereau Officiel de Trésorerie & Déclaration Fiscale
              </h2>
              <p className="text-xs text-neutral-400">
                Conforme aux directives UEMOA & Instruction BCEAO N° 08/2021
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Exporter vers Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Imprimer ou enregistrer en PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer (PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-xs text-neutral-800 font-sans print:p-0">
          {/* Header of the Official Statement */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-neutral-900">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-orange-600 text-white font-black text-sm flex items-center justify-center">
                  IT
                </span>
                <span className="text-xl font-black tracking-tight text-neutral-950">
                  IVOIRETONTINE SAS
                </span>
              </div>
              <div className="text-[11px] text-neutral-500 mt-2 space-y-0.5">
                <p>Plateforme Numérique de Tontines & Épargne Rotative</p>
                <p>RCCM : CI-ABJ-2026-B-04128 · CC : 2604918 X</p>
                <p>Siège : Boulevard de la République, Immeuble Horizon, Abidjan Plateau</p>
                <p>Support : info@ivoiretontine.ci · WhatsApp : +225 05 86 80 19 59</p>
              </div>
            </div>

            <div className="text-right sm:text-right text-[11px] space-y-1 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Relevé Récapitulatif Mensuel
              </div>
              <p className="font-mono text-neutral-700">Réf : BORD-TRES-2026-CI-04</p>
              <p className="text-neutral-500">Date d'édition : {new Date().toLocaleDateString('fr-FR')}</p>
              <p className="text-emerald-700 font-bold font-mono">
                Compte Marchand : +225 05 04 49 14 06
              </p>
              <p className="text-neutral-600">Titulaire : Silué Yardjouman Jean-Pierre</p>
            </div>
          </div>

          {/* KPI Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
              <span className="text-[10px] font-bold text-neutral-500 uppercase">Volume Collecté</span>
              <div className="text-base font-extrabold text-neutral-900 font-mono mt-1">
                {formatFCFA(totalVolumeGross)}
              </div>
              <span className="text-[10px] text-neutral-400">Flux Mobile Money brut</span>
            </div>

            <div className="bg-orange-50 p-3.5 rounded-xl border border-orange-200">
              <span className="text-[10px] font-bold text-orange-700 uppercase">Frais Création (1 000 F)</span>
              <div className="text-base font-extrabold text-orange-950 font-mono mt-1">
                {formatFCFA(totalCreationFees)}
              </div>
              <span className="text-[10px] text-orange-700">Ouverture de groupes</span>
            </div>

            <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Commissions 4%</span>
              <div className="text-base font-extrabold text-emerald-950 font-mono mt-1">
                {formatFCFA(totalCommissions)}
              </div>
              <span className="text-[10px] text-emerald-700">Retenues sur cagnottes</span>
            </div>

            <div className="bg-neutral-900 text-white p-3.5 rounded-xl border border-neutral-800">
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Solde Net Restant</span>
              <div className="text-base font-extrabold text-emerald-400 font-mono mt-1">
                {formatFCFA(netAvailable)}
              </div>
              <span className="text-[10px] text-neutral-400">Disponible au retrait</span>
            </div>
          </div>

          {/* Detailed Treasury Reconciliation Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">
                Historique des Décaissements vers Compte Marchand / Bancaire
              </h3>
              <span className="text-[10px] text-neutral-500">
                {adminWithdrawals.length} virement(s) enregistré(s)
              </span>
            </div>

            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 text-neutral-700 font-bold text-[11px] border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Réf. Retrait</th>
                    <th className="py-2.5 px-3">Destination</th>
                    <th className="py-2.5 px-3">Compte Récepteur</th>
                    <th className="py-2.5 px-3 text-right">Montant (FCFA)</th>
                    <th className="py-2.5 px-3 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {adminWithdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-neutral-50">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-600">{w.date}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-neutral-800">{w.withdrawalRef}</td>
                      <td className="py-2.5 px-3">{w.destinationEntity}</td>
                      <td className="py-2.5 px-3 font-mono text-neutral-700">{w.destinationAccount}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                        {formatFCFA(w.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <BadgeCheck className="w-3 h-3 text-emerald-600" />
                          <span>Transféré</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                  {adminWithdrawals.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-neutral-400">
                        Aucun décaissement effectué pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Regulatory Mention & Stamp Area */}
          <div className="pt-4 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
            <div className="space-y-1 text-[10px] text-neutral-500 leading-relaxed">
              <p className="font-bold text-neutral-700">CONFORMITÉ ET AUDIT LÉGAL :</p>
              <p>
                Document émis conformément aux dispositions légales régissant les services de paiement et les associations d'épargne solidaire en zone CEMAC/UEMOA. Tous les prélèvements de 4% et frais de création de 1 000 FCFA sont enregistrés sur registres infalsifiables.
              </p>
              <p className="font-mono text-neutral-400">
                Signature SHA-256 : CERT-IVT-TRES-0504491406-SHA-SECURE-BCEAO
              </p>
            </div>

            <div className="border border-dashed border-neutral-300 rounded-xl p-4 text-center bg-neutral-50 space-y-1">
              <div className="text-[10px] font-bold text-neutral-600 uppercase">
                Cachet de la Direction & Visa de la Trésorerie
              </div>
              <div className="py-2 flex items-center justify-center gap-2 text-emerald-700 font-serif italic text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Silué Yardjouman Jean-Pierre</span>
              </div>
              <div className="text-[9px] text-neutral-400 font-mono">
                Super Administrateur · Date : {new Date().toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
