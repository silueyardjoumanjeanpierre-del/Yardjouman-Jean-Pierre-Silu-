import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA, formatDateTime } from '../utils/formatters';
import {
  FileText,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { TransactionType } from '../types';

export const TransactionsView: React.FC = () => {
  const { transactions, currentUser, setSelectedReceiptTxn } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.transactionRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.tontineName && t.tontineName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.userName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleExportCSV = () => {
    const headers = ['Ref', 'Date', 'Type', 'Tontine', 'Nom', 'Téléphone', 'Brut', 'Frais/Com', 'Net', 'Moyen', 'Statut'];
    const rows = filteredTransactions.map((t) => [
      t.transactionRef,
      t.date,
      t.type,
      `"${t.tontineName || ''}"`,
      `"${t.userName}"`,
      t.userPhone,
      t.amountGross,
      t.feeAmount,
      t.amountNet,
      t.paymentMethod,
      t.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ivoiretontine_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Grand Livre des Opérations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Historique des Transactions & Reçus
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Traçabilité intégrale des frais de création, cotisations et versements de cagnottes.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exporter CSV</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par référence, reçu, nom, groupe..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
          />
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'Toutes' },
            { id: 'frais_creation', label: 'Frais Création (1 000 F)' },
            { id: 'cotisation', label: 'Cotisations' },
            { id: 'reception_cagnotte', label: 'Cagnottes Versées' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTypeFilter(item.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap font-medium ${
                typeFilter === item.id
                  ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table of transactions */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4">Réf. & Reçu</th>
                <th className="py-3 px-4">Date & Heure</th>
                <th className="py-3 px-4">Type d'Opération</th>
                <th className="py-3 px-4">Tontine Associée</th>
                <th className="py-3 px-4">Payeur / Bénéficiaire</th>
                <th className="py-3 px-4 text-right">Montant Brut</th>
                <th className="py-3 px-4 text-right">Frais / Com (4%)</th>
                <th className="py-3 px-4 text-right">Montant Net</th>
                <th className="py-3 px-4">Moyen Mobile</th>
                <th className="py-3 px-4 text-right">Reçu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredTransactions.map((txn) => (
                <tr
                  key={txn.id}
                  onClick={() => setSelectedReceiptTxn(txn)}
                  className="hover:bg-neutral-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-neutral-900 block">
                      {txn.transactionRef}
                    </span>
                    <span className="font-mono text-[10px] text-neutral-400">
                      {txn.receiptNumber}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-neutral-500 whitespace-nowrap">
                    {formatDateTime(txn.date)}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        txn.type === 'frais_creation'
                          ? 'bg-orange-100 text-orange-800'
                          : txn.type === 'cotisation'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {txn.type === 'frais_creation'
                        ? 'Frais Création'
                        : txn.type === 'cotisation'
                        ? 'Cotisation'
                        : 'Cagnotte Versée'}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-neutral-900 block truncate max-w-[150px]">
                      {txn.tontineName || '-'}
                    </span>
                    {txn.roundNumber && (
                      <span className="text-[10px] text-neutral-400">
                        Tour n° {txn.roundNumber}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-medium text-neutral-900">{txn.userName}</div>
                    <div className="font-mono text-[10px] text-neutral-400">{txn.userPhone}</div>
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-semibold text-neutral-800 tabular-nums">
                    {formatFCFA(txn.amountGross)}
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-neutral-500 tabular-nums">
                    {txn.feeAmount > 0 ? formatFCFA(txn.feeAmount) : '-'}
                  </td>

                  <td
                    className={`py-3 px-4 text-right font-mono font-bold tabular-nums ${
                      txn.type === 'reception_cagnotte' ? 'text-emerald-700' : 'text-neutral-900'
                    }`}
                  >
                    {formatFCFA(txn.amountNet)}
                  </td>

                  <td className="py-3 px-4 uppercase text-[11px] font-semibold text-neutral-700">
                    {txn.paymentMethod.replace('_', ' ')}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReceiptTxn(txn);
                      }}
                      className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                      title="Imprimer / Afficher le reçu"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
