export type Role = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  city: string;
  country: string;
  avatarUrl?: string;
  joinedDate: string;
  isVerified: boolean;
  bceaoKycStatus: 'verifie' | 'en_attente' | 'non_soumis';
}

export type TontineFrequency = 'hebdomadaire' | 'bimensuelle' | 'mensuelle';
export type PayoutStrategy = 'tirage_transparent' | 'ordre_inscription' | 'accord_mutuel';
export type TontineStatus = 'en_attente_participants' | 'active' | 'terminee';

export interface TontineParticipant {
  id: string;
  userId: string;
  name: string;
  phone: string;
  orderPosition: number;
  payoutDate: string;
  hasReceivedPayout: boolean;
  contributionsPaidCount: number;
  isCurrentTurn: boolean;
  avatar?: string;
}

export interface TontineRound {
  roundNumber: number;
  dueDate: string;
  beneficiaryId: string;
  beneficiaryName: string;
  beneficiaryPhone: string;
  targetPot: number; // Montant brut
  collectedPot: number;
  commissionAmount: number; // Ex: 4%
  netPaid: number; // 96%
  status: 'a_venir' | 'en_cours' | 'verse';
  payoutTxnRef?: string;
}

export interface Tontine {
  id: string;
  code: string; // Ex: IVT-7821
  name: string;
  category: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorPhone: string;
  contributionAmount: number; // FCFA
  frequency: TontineFrequency;
  participantsCount: number; // Ex: 5, 8, 10
  currentRound: number;
  durationMonths: number;
  rules: string;
  payoutStrategy: PayoutStrategy;
  status: TontineStatus;
  creationFeePaid: boolean; // Obligatoire 1000 FCFA
  creationFeeTxnId?: string;
  createdAt: string;
  nextDueDate: string;
  totalPot: number; // contributionAmount * participantsCount
  commissionRate: number; // Ex: 0.04 (4%)
  commissionAmount: number;
  netPayout: number;
  participants: TontineParticipant[];
  rounds: TontineRound[];
  isPublic: boolean;
}

export type PaymentMethod = 'wave' | 'orange_money' | 'mtn_momo' | 'moov_money' | 'virement_uemoa';
export type TransactionType = 'frais_creation' | 'cotisation' | 'reception_cagnotte' | 'remboursement';
export type TransactionStatus = 'succes' | 'en_attente' | 'echec' | 'rembourse';

export interface Transaction {
  id: string;
  transactionRef: string; // Ex: TXN-CI-2026-9281
  date: string;
  type: TransactionType;
  tontineId?: string;
  tontineName?: string;
  roundNumber?: number;
  userId: string;
  userName: string;
  userPhone: string;
  amountGross: number; // Total brut
  feeAmount: number; // Frais (1000 FCFA création ou 4% récupération)
  amountNet: number; // Net versé ou prélevé
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  paymentSignature: string;
  receiptNumber: string;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  type: 'echeance' | 'paiement' | 'tirage' | 'invitation' | 'alerte';
  read: boolean;
  actionView?: string;
}

export interface SupportTicketMessage {
  id: string;
  sender: string;
  text: string;
  date: string;
  isAdmin: boolean;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string; // Ex: REC-2026-041
  userId: string;
  userName: string;
  userPhone: string;
  subject: string;
  category: 'paiement' | 'retard_cotisation' | 'reception_fonds' | 'technique' | 'autre';
  status: 'ouvert' | 'en_cours' | 'resolu';
  priority: 'normale' | 'urgente';
  createdAt: string;
  messages: SupportTicketMessage[];
}

export interface AdminWithdrawal {
  id: string;
  withdrawalRef: string;
  date: string;
  adminId: string;
  adminName: string;
  amount: number;
  sourceType: 'frais_creation' | 'commissions' | 'total_disponible';
  destinationType: 'mobile_money_pro' | 'virement_bancaire_uemoa';
  destinationAccount: string;
  destinationEntity: string; // Ex: Wave Business CI, SGBCI, Ecobank CI
  status: 'valide' | 'en_traitement';
  auditHash: string;
  receiptNumber: string;
}

export interface AutomatedReminder {
  id: string;
  tontineId: string;
  tontineName: string;
  roundNumber: number;
  userId: string;
  userName: string;
  userPhone: string;
  amount: number;
  dueDate: string;
  channel: 'sms' | 'in_app' | 'whatsapp';
  sentAt: string;
  status: 'delivre' | 'en_attente';
  messageContent: string;
}

export interface PlatformSettings {
  creationFee: number; // Défaut: 1000 FCFA
  commissionRate: number; // Défaut: 0.04 (4%)
  minContribution: number;
  maxContribution: number;
  sandboxMode: boolean;
  automatedRemindersEnabled: boolean;
  reminderChannels: ('sms' | 'in_app' | 'whatsapp')[];
  reminderSchedule: {
    daysBefore: number; // ex: 1 (veille)
    morningHour: string; // ex: "08:00"
    urgencyHour: string; // ex: "16:00"
  };
  auditLogs: {
    id: string;
    date: string;
    adminName: string;
    action: string;
    details: string;
  }[];
  merchantSettings?: {
    merchantPhone: string;
    cinetpayApiKey?: string;
    cinetpaySiteId?: string;
    waveMerchantId?: string;
    payoutDestination: string;
    status: 'en_attente_validation' | 'actif' | 'pre_configure';
  };
}
