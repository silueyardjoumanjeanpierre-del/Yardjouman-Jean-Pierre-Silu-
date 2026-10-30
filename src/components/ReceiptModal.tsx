import React from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Printer, CheckCircle, X, Download, QrCode, MessageCircle } from 'lucide-react';
import { getWhatsAppShareLink, formatReceiptShareMessage } from '../utils/whatsapp';
import { formatFCFA, formatDateTime } from '../utils/formatters';

export const ReceiptModal: React.FC = () => {
  const { selectedReceiptTxn, setSelectedReceiptTxn } = useApp();

  if (!selectedReceiptTxn) return null;

  const txn = selectedReceiptTxn;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-neutral-300 overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:max-w-full">
        {/* Top Action Bar (hidden when printing) */}
        <div className="bg-neutral-900 text-white px-6 py-3 flex items-center justify-between print:hidden">
          <div className="text-xs font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Quittance Officielle Électronique</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors text-xs flex items-center gap-1"
              title="Imprimer le reçu"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer</span>
            </button>
            <button
              onClick={() => setSelectedReceiptTxn(null)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-8 space-y-6 text-neutral-900 bg-white" id="receipt-paper">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-neutral-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-extrabold text-sm">
                  IT
                </div>
                <span className="text-xl font-extrabold tracking-tight">
                  IVOIRE<span className="text-orange-600">TONTINE</span>
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Plateforme de Tontines Numérisées · République de Côte d'Ivoire
              </p>
              <p className="text-[10px] text-neutral-400">
                Immatriculée ARTCI / Réglementation Épargne & Monnaie Électronique UEMOA
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold font-mono text-neutral-900">
                {txn.receiptNumber}
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                {formatDateTime(txn.date)}
              </div>
              <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                Transaction Confirmée
              </span>
            </div>
          </div>

          {/* Parties involved */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-neutral-50 p-4 rounded-xl border border-neutral-200">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Émetteur / Débiteur
              </span>
              <p className="font-semibold text-neutral-900 mt-0.5">{txn.userName}</p>
              <p className="text-neutral-500 font-mono text-[11px]">{txn.userPhone}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Tontine / Opération
              </span>
              <p className="font-semibold text-neutral-900 mt-0.5 truncate">
                {txn.tontineName || 'Frais de création'}
              </p>
              <p className="text-neutral-500 text-[11px]">
                {txn.roundNumber ? `Tour n° ${txn.roundNumber}` : 'Service Plateforme'}
              </p>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div>
            <div className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
              Détail Financier (XOF / FCFA)
            </div>
            <table className="w-full text-xs border border-neutral-200 rounded-lg overflow-hidden">
              <thead className="bg-neutral-100 text-neutral-600 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3 text-left">Désignation</th>
                  <th className="py-2.5 px-3 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                <tr>
                  <td className="py-2.5 px-3">
                    <span className="font-medium text-neutral-900">
                      {txn.type === 'frais_creation'
                        ? "Frais d'ouverture et création de tontine"
                        : txn.type === 'cotisation'
                        ? 'Cotisation périodique'
                        : 'Cagnotte brute collectée'}
                    </span>
                    <span className="block text-[10px] text-neutral-500">{txn.notes}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums">
                    {formatFCFA(txn.amountGross)}
                  </td>
                </tr>

                {txn.feeAmount > 0 && (
                  <tr className="bg-neutral-50/70 text-neutral-600">
                    <td className="py-2 px-3">
                      <span>
                        {txn.type === 'frais_creation'
                          ? 'Tarif de service fixe'
                          : `Commission de récupération IVOIRETONTINE (${txn.amountGross > 0 ? Math.round((txn.feeAmount / txn.amountGross) * 100) : 4}%)`}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-neutral-700">
                      {txn.type === 'frais_creation'
                        ? formatFCFA(txn.feeAmount)
                        : `- ${formatFCFA(txn.feeAmount)}`}
                    </td>
                  </tr>
                )}

                <tr className="bg-neutral-100/90 font-bold text-sm">
                  <td className="py-3 px-3 text-neutral-900">
                    {txn.type === 'reception_cagnotte' ? 'Net perçu par le bénéficiaire' : 'Total payé'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-700 tabular-nums">
                    {formatFCFA(txn.amountNet)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Method & Security Seal */}
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-1 text-xs">
              <p className="text-neutral-500">
                Moyen de règlement :{' '}
                <strong className="text-neutral-900 uppercase">
                  {txn.paymentMethod.replace('_', ' ')}
                </strong>
              </p>
              <p className="text-neutral-500">
                Réf. Transaction :{' '}
                <span className="font-mono text-neutral-900">{txn.transactionRef}</span>
              </p>
              <p className="text-[10px] text-neutral-400 font-mono truncate max-w-xs">
                Signature : {txn.paymentSignature}
              </p>
            </div>

            {/* Simulated BCEAO Stamp */}
            <div className="w-24 h-24 border-2 border-emerald-600/70 rounded-full flex flex-col items-center justify-center p-1 text-center rotate-[-8deg] opacity-85 select-none">
              <span className="text-[8px] font-bold text-emerald-800 tracking-wider">
                IVOIRETONTINE
              </span>
              <span className="text-[10px] font-black text-emerald-700">PAYÉ</span>
              <span className="text-[7px] text-emerald-800">CÔTE D'IVOIRE</span>
              <span className="text-[6px] text-emerald-700 font-mono">BCEAO SANDBOX</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-[10px] text-neutral-400 text-center border-t border-neutral-200 pt-3">
            Ce reçu électronique constitue une preuve légale d'opération sous réserve des conditions générales d'utilisation d'IVOIRETONTINE et des règles de la tontine souscrite.
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-neutral-100 px-6 py-3 border-t border-neutral-200 flex flex-wrap justify-end items-center gap-2.5 print:hidden">
          <a
            href={getWhatsAppShareLink(formatReceiptShareMessage(txn))}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20ba59] rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
            title="Envoyer la quittance officielle par message WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white" />
            <span>Partager sur WhatsApp</span>
          </a>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer / PDF</span>
          </button>

          <button
            onClick={() => setSelectedReceiptTxn(null)}
            className="px-3 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-200 rounded-xl transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
