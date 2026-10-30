/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction, AdminWithdrawal } from '../types';

export function exportTreasuryStatementCSV(
  transactions: Transaction[],
  withdrawals: AdminWithdrawal[],
  commissionRate: number,
  creationFee: number
) {
  const currentDate = new Date().toISOString().substring(0, 10);
  const filename = `releve-tresorerie-ivoiretontine-${currentDate}.csv`;

  // CSV Headers
  const headers = [
    'Date / Heure',
    'Référence Transaction',
    'Type d\'opération',
    'Tontine Associée',
    'Utilisateur',
    'Téléphone',
    'Moyen de Paiement',
    'Montant Brut (FCFA)',
    'Frais / Commission Plateforme (FCFA)',
    'Montant Net (FCFA)',
    'Statut',
    'Numéro Reçu',
    'Signature Numérique / Hash',
  ];

  const rows: string[][] = [];

  // Add transactions
  transactions.forEach((t) => {
    rows.push([
      `"${t.date}"`,
      `"${t.transactionRef}"`,
      `"${t.type === 'frais_creation' ? 'Frais d\'ouverture de tontine' : t.type === 'cotisation' ? 'Cotisation tour' : 'Versement cagnotte'}"`,
      `"${t.tontineName || 'N/A'}"`,
      `"${t.userName || 'N/A'}"`,
      `"${t.userPhone || 'N/A'}"`,
      `"${t.paymentMethod.toUpperCase()}"`,
      `${t.amountGross}`,
      `${t.feeAmount}`,
      `${t.amountNet}`,
      `"${t.status.toUpperCase()}"`,
      `"${t.receiptNumber || 'N/A'}"`,
      `"${t.paymentSignature || 'N/A'}"`,
    ]);
  });

  // Add withdrawals
  withdrawals.forEach((w) => {
    rows.push([
      `"${w.date}"`,
      `"${w.withdrawalRef}"`,
      `"RETRAIT REVENUS PLATEFORME (${w.sourceType})"`,
      `"Caisse Trésorerie Centrale"`,
      `"${w.adminName}"`,
      `"${w.destinationAccount}"`,
      `"${w.destinationEntity}"`,
      `${w.amount}`,
      `0`,
      `${w.amount}`,
      `"${w.status.toUpperCase()}"`,
      `"${w.receiptNumber}"`,
      `"${w.auditHash}"`,
    ]);
  });

  // Calculate totals
  const totalVolume = transactions.reduce((acc, t) => acc + t.amountGross, 0);
  const totalCreationFees = transactions
    .filter((t) => t.type === 'frais_creation' && t.status === 'succes')
    .reduce((acc, t) => acc + t.amountGross, 0);
  const totalCommissions = transactions
    .filter((t) => t.type === 'reception_cagnotte' && t.status === 'succes')
    .reduce((acc, t) => acc + t.feeAmount, 0);
  const totalRevenue = totalCreationFees + totalCommissions;
  const totalWithdrawn = withdrawals.reduce((acc, w) => acc + w.amount, 0);
  const netSolde = totalRevenue - totalWithdrawn;

  // Add summary rows
  rows.push([]);
  rows.push(['"--- RECAPITULATIF FISCAL & TRESORERIE BCEAO ---"']);
  rows.push(['"Volume Brut Global Traité (FCFA)"', `${totalVolume}`]);
  rows.push(['"Total Frais de Création Encaissés (1 000 FCFA / groupe)"', `${totalCreationFees}`]);
  rows.push([`"Total Commissions de Récupération (${(commissionRate * 100).toFixed(0)}%)"`, `${totalCommissions}`]);
  rows.push(['"Total Chiffre d\'Affaires Plateforme Encaissé"', `${totalRevenue}`]);
  rows.push(['"Total Revenus Déjà Retirés vers Wave/Banque"', `${totalWithdrawn}`]);
  rows.push(['"Solde Net Disponible en Trésorerie"', `${netSolde}`]);
  rows.push(['"Titulaire Responsable Compte Marchand"', '"Silué Yardjouman Jean-Pierre (+225 05 04 49 14 06)"']);

  // Prepend UTF-8 BOM so Excel decodes UTF-8 accents correctly
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
