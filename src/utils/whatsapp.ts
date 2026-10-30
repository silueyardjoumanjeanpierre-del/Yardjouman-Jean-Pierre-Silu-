/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const WHATSAPP_BUSINESS_RAW = '0586801959';
export const WHATSAPP_BUSINESS_INTL = '2250586801959';
export const WHATSAPP_BUSINESS_DISPLAY = '+225 05 86 80 19 59';
export const WHATSAPP_BUSINESS_CARRIER = 'MTN Côte d\'Ivoire';

/**
 * Builds a direct click-to-chat URL for IVOIRETONTINE WhatsApp Business
 */
export function getWhatsAppBusinessLink(prefilledMessage?: string): string {
  const base = `https://wa.me/${WHATSAPP_BUSINESS_INTL}`;
  if (!prefilledMessage) return base;
  return `${base}?text=${encodeURIComponent(prefilledMessage)}`;
}

/**
 * Builds a generic WhatsApp share link to invite friends or forward receipts
 */
export function getWhatsAppShareLink(message: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

/**
 * Generates formatted invitation text for a Tontine
 */
export function formatTontineInviteMessage(tontine: {
  code: string;
  name: string;
  contributionAmount: number;
  frequency: string;
  netPayout: number;
}): string {
  return `🤝 *INVITATION IVOIRETONTINE* 🇨🇮
Rejoignez notre tontine sécurisée : *${tontine.name}* (Code : *${tontine.code}*)
💰 Cotisation : *${tontine.contributionAmount.toLocaleString('fr-FR')} FCFA* (${tontine.frequency})
🎯 Cagnotte nette par tour : *${tontine.netPayout.toLocaleString('fr-FR')} FCFA*
✅ Numérisée avec Wave, Orange Money et MTN MoMo.
📞 Assistance WhatsApp officielle : ${WHATSAPP_BUSINESS_DISPLAY}`;
}

/**
 * Generates formatted receipt sharing text
 */
export function formatReceiptShareMessage(txn: {
  receiptNumber: string;
  transactionRef: string;
  amountGross: number;
  amountNet: number;
  type: string;
  paymentMethod: string;
  tontineName?: string;
}): string {
  return `🧾 *QUITTANCE OFFICIELLE IVOIRETONTINE* 🇨🇮
Réf : *${txn.transactionRef}* | Reçu N° : *${txn.receiptNumber}*
📌 Opération : *${txn.type === 'cotisation' ? 'Cotisation Validée' : txn.type === 'reception_cagnotte' ? 'Cagnotte Reçue' : 'Frais de Création'}*
${txn.tontineName ? `🏢 Tontine : *${txn.tontineName}*\n` : ''}💵 Montant : *${txn.amountNet.toLocaleString('fr-FR')} FCFA* via *${txn.paymentMethod.toUpperCase()}*
🛡️ Transaction certifiée conforme BCEAO.
📞 Support WhatsApp Business : ${WHATSAPP_BUSINESS_DISPLAY}`;
}

/**
 * Pre-filled templates for official support requests
 */
export const WHATSAPP_SUPPORT_PRESETS = [
  {
    id: 'paiement_aide',
    label: 'Aide paiement Mobile Money (Wave, Orange, MTN)',
    message: `Bonjour IVOIRETONTINE, j'ai besoin d'une assistance pour effectuer ou valider un paiement de cotisation par Mobile Money sur la plateforme.`,
  },
  {
    id: 'creation_tontine',
    label: 'Création & activation d\'une nouvelle tontine',
    message: `Bonjour l'équipe IVOIRETONTINE, je souhaite créer un groupe d'épargne rotatif et avoir des conseils sur le calendrier et les frais d'ouverture (1 000 FCFA).`,
  },
  {
    id: 'kyc_verification',
    label: 'Validation CNI / Pièce d\'identité',
    message: `Bonjour, je souhaite certifier mon compte avec ma pièce d'identité ivoirienne (CNI / Passeport) pour augmenter mon plafond de réception de cagnotte.`,
  },
  {
    id: 'signalement_retard',
    label: 'Médiation & Signalement de retard',
    message: `Bonjour, je vous contacte au sujet d'un retard de cotisation d'un participant dans notre tontine pour déclencher la procédure de rappel ou d'assurance.`,
  },
  {
    id: 'direction_partenariat',
    label: 'Contact Direction & Marchands',
    message: `Bonjour la Direction d'IVOIRETONTINE, je souhaite échanger sur une opportunité de partenariat ou de mutualisation d'entreprise.`,
  },
];
