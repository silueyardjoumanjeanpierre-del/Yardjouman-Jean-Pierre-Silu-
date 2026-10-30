export function formatFCFA(amount: number): string {
  if (isNaN(amount)) return '0 FCFA';
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
}

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}

export function generateTxnRef(prefix: string = 'TXN-CI'): string {
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${randomPart}`;
}

export function generateReceiptNumber(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `REC-IVT-${new Date().getFullYear()}-${num}`;
}

export function calculateTontineEconomics(
  contributionAmount: number,
  participantsCount: number,
  commissionRate: number = 0.04
) {
  const totalPot = contributionAmount * participantsCount;
  const commissionAmount = Math.round(totalPot * commissionRate);
  const operatorFee = 0; // Pris en charge ou 0 FCFA en test
  const netPayout = totalPot - commissionAmount - operatorFee;

  return {
    contributionAmount,
    participantsCount,
    totalPot,
    commissionRate,
    commissionAmount,
    operatorFee,
    netPayout,
  };
}
