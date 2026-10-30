import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Tontine,
  Transaction,
  NotificationItem,
  SupportTicket,
  PlatformSettings,
  PaymentMethod,
  AdminWithdrawal,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_TONTINES,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_TICKETS,
  INITIAL_SETTINGS,
  INITIAL_ADMIN_WITHDRAWALS,
  INITIAL_REMINDERS,
} from '../data/initialData';
import { generateTxnRef, generateReceiptNumber } from '../utils/formatters';
import { AutomatedReminder } from '../types';
import { db, validateFirestoreConnection } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

interface AppContextType {
  currentUser: User;
  users: User[];
  tontines: Tontine[];
  transactions: Transaction[];
  notifications: NotificationItem[];
  tickets: SupportTicket[];
  settings: PlatformSettings;
  adminWithdrawals: AdminWithdrawal[];
  automatedReminders: AutomatedReminder[];
  activeDueToast: {
    isOpen: boolean;
    tontine: Tontine;
    amount: number;
    roundNumber: number;
  } | null;
  dismissDueToast: () => void;
  triggerAutomatedReminders: (targetTontineId?: string) => {
    count: number;
    reminders: AutomatedReminder[];
  };
  activeView: string;
  selectedTontineId: string | null;
  selectedReceiptTxn: Transaction | null;
  isGeminiModalOpen: boolean;
  setIsGeminiModalOpen: (open: boolean) => void;
  isVeoModalOpen: boolean;
  setIsVeoModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isAuditModalOpen: boolean;
  setIsAuditModalOpen: (open: boolean) => void;
  isSimulatorModalOpen: boolean;
  setIsSimulatorModalOpen: (open: boolean) => void;
  isTreasuryStatementModalOpen: boolean;
  setIsTreasuryStatementModalOpen: (open: boolean) => void;
  isMerchantModalOpen: boolean;
  setIsMerchantModalOpen: (open: boolean) => void;
  isLiveMode: boolean;
  setIsLiveMode: (live: boolean) => void;
  paymentModalConfig: {
    isOpen: boolean;
    title: string;
    amount: number;
    type: 'frais_creation' | 'cotisation';
    tontineId?: string;
    roundNumber?: number;
    metadata?: any;
    onSuccess?: (txn: Transaction) => void;
  };
  setActiveView: (view: string) => void;
  setSelectedTontineId: (id: string | null) => void;
  setSelectedReceiptTxn: (txn: Transaction | null) => void;
  setCurrentUserById: (userId: string) => void;
  openPaymentModal: (config: {
    title: string;
    amount: number;
    type: 'frais_creation' | 'cotisation';
    tontineId?: string;
    roundNumber?: number;
    metadata?: any;
    onSuccess?: (txn: Transaction) => void;
  }) => void;
  closePaymentModal: () => void;
  createTontine: (
    data: Omit<Tontine, 'id' | 'code' | 'creationFeePaid' | 'createdAt' | 'creationFeeTxnId' | 'totalPot' | 'commissionAmount' | 'netPayout' | 'currentRound'>,
    txnId: string
  ) => Tontine;
  joinTontine: (tontineId: string) => boolean;
  submitContributionPayment: (
    tontineId: string,
    roundNumber: number,
    paymentMethod: PaymentMethod,
    phoneNumber: string
  ) => Transaction;
  distributeRoundPayout: (tontineId: string, roundNumber: number) => Transaction | null;
  updatePlatformSettings: (
    newSettings: Partial<PlatformSettings>,
    reason: string
  ) => void;
  performAdminWithdrawal: (params: {
    amount: number;
    sourceType: 'frais_creation' | 'commissions' | 'total_disponible';
    destinationType: 'mobile_money_pro' | 'virement_bancaire_uemoa';
    destinationAccount: string;
    destinationEntity: string;
    pin: string;
  }) => { success: boolean; error?: string; withdrawal?: AdminWithdrawal };
  registerUser: (userData: {
    name: string;
    email: string;
    phone: string;
    city: string;
    country: string;
    bceaoKycStatus?: 'verifie' | 'en_attente' | 'non_soumis';
  }) => User;
  performRefund: (transactionId: string, reason: string) => { success: boolean; error?: string };
  performLiveDraw: (tontineId: string) => boolean;
  createSupportTicket: (
    subject: string,
    category: SupportTicket['category'],
    message: string,
    priority: SupportTicket['priority']
  ) => void;
  replyTicket: (ticketId: string, text: string, isAdmin: boolean) => void;
  markNotificationRead: (id: string) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'ivoiretontine_users_v1',
  CURRENT_USER_ID: 'ivoiretontine_current_user_id_v1',
  TONTINES: 'ivoiretontine_tontines_v1',
  TRANSACTIONS: 'ivoiretontine_transactions_v1',
  NOTIFICATIONS: 'ivoiretontine_notifications_v1',
  TICKETS: 'ivoiretontine_tickets_v1',
  SETTINGS: 'ivoiretontine_settings_v1',
  ADMIN_WITHDRAWALS: 'ivoiretontine_admin_withdrawals_v1',
  REMINDERS: 'ivoiretontine_reminders_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load users (ensuring Silué Yardjouman Jean-Pierre is registered as Super Admin)
  const [users, setUsers] = useState<User[]>(() => {
    const adminUser: User = {
      id: 'user_admin',
      name: 'Silué Yardjouman Jean-Pierre',
      email: 'silueyardjoumanjeanpierre@gmail.com',
      phone: '+225 05 04 49 14 06',
      role: 'admin',
      city: 'Abidjan (Plateau / Cocody)',
      country: "Côte d'Ivoire",
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      joinedDate: '01 Janvier 2026',
      isVerified: true,
      bceaoKycStatus: 'verifie',
    };
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        const withoutOldAdmin = parsed.filter((u) => u.id !== 'user_admin');
        const updatedUsers = [adminUser, ...withoutOldAdmin];
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
        return updatedUsers;
      } catch (e) {
        return [adminUser, ...INITIAL_USERS.filter((u) => u.id !== 'user_admin')];
      }
    }
    return [adminUser, ...INITIAL_USERS.filter((u) => u.id !== 'user_admin')];
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (!saved || saved === 'user_aminata') {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'user_admin');
      return 'user_admin';
    }
    return saved;
  });

  // Mode Réel / Production (par défaut actif, quitte le mode démo)
  const [isLiveMode, setIsLiveMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ivoiretontine_is_live_mode');
    return saved !== 'false';
  });

  const [tontines, setTontines] = useState<Tontine[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TONTINES);
    if (saved) {
      try {
        const parsed: Tontine[] = JSON.parse(saved);
        let hasChanges = false;
        const updated = parsed.map((t) => {
          if (t.commissionRate === 0.10 || t.commissionRate === 0.1) {
            hasChanges = true;
            const newCommission = Math.round(t.totalPot * 0.04);
            return {
              ...t,
              commissionRate: 0.04,
              commissionAmount: newCommission,
              netPayout: t.totalPot - newCommission,
              rounds: (t.rounds || []).map((r) => {
                const roundCom = Math.round(r.targetPot * 0.04);
                return {
                  ...r,
                  commissionAmount: roundCom,
                  netPaid: r.targetPot - roundCom,
                };
              }),
            };
          }
          return t;
        });
        if (hasChanges) {
          localStorage.setItem(STORAGE_KEYS.TONTINES, JSON.stringify(updated));
        }
        return updated;
      } catch (e) {
        return INITIAL_TONTINES;
      }
    }
    return INITIAL_TONTINES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (saved) {
      try {
        const parsed: Transaction[] = JSON.parse(saved);
        let hasChanges = false;
        const updated = parsed.map((txn) => {
          if (txn.type === 'reception_cagnotte' && (txn.notes?.includes('10%') || txn.notes?.includes('25 000') || txn.notes?.includes('6 000'))) {
            hasChanges = true;
            const fee = Math.round(txn.amountGross * 0.04);
            return {
              ...txn,
              feeAmount: fee,
              amountNet: txn.amountGross - fee,
              notes: (txn.notes || '')
                .replace(/10%/g, '4%')
                .replace(/25 000/g, '10 000')
                .replace(/6 000/g, '2 400'),
            };
          }
          return txn;
        });
        if (hasChanges) {
          localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
        }
        return updated;
      } catch (e) {
        return INITIAL_TRANSACTIONS;
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  const [settings, setSettings] = useState<PlatformSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        const parsed: PlatformSettings = JSON.parse(saved);
        if (parsed.commissionRate === 0.10 || parsed.commissionRate === 0.1) {
          parsed.commissionRate = 0.04;
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        return INITIAL_SETTINGS;
      }
    }
    return INITIAL_SETTINGS;
  });

  const [adminWithdrawals, setAdminWithdrawals] = useState<AdminWithdrawal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_WITHDRAWALS);
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_WITHDRAWALS;
  });

  const [automatedReminders, setAutomatedReminders] = useState<AutomatedReminder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    return saved ? JSON.parse(saved) : INITIAL_REMINDERS;
  });

  // State for automatic contribution day toast/banner
  const [activeDueToast, setActiveDueToast] = useState<{
    isOpen: boolean;
    tontine: Tontine;
    amount: number;
    roundNumber: number;
  } | null>(null);

  // Dismiss toast
  const dismissDueToast = () => {
    setActiveDueToast(null);
  };

  // Navigation states
  const [activeView, setActiveView] = useState<string>('accueil');
  const [selectedTontineId, setSelectedTontineId] = useState<string | null>(null);
  const [selectedReceiptTxn, setSelectedReceiptTxn] = useState<Transaction | null>(null);

  // Gemini Chatbot, Veo Video Studio & Firebase Auth modal states
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
  const [isVeoModalOpen, setIsVeoModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false);
  const [isTreasuryStatementModalOpen, setIsTreasuryStatementModalOpen] = useState(false);
  const [isMerchantModalOpen, setIsMerchantModalOpen] = useState(false);

  useEffect(() => {
    validateFirestoreConnection().catch(() => {});
  }, []);

  // Payment Modal configuration
  const [paymentModalConfig, setPaymentModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    amount: number;
    type: 'frais_creation' | 'cotisation';
    tontineId?: string;
    roundNumber?: number;
    metadata?: any;
    onSuccess?: (txn: Transaction) => void;
  }>({
    isOpen: false,
    title: '',
    amount: 0,
    type: 'frais_creation',
  });

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TONTINES, JSON.stringify(tontines));
  }, [tontines]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_WITHDRAWALS, JSON.stringify(adminWithdrawals));
  }, [adminWithdrawals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(automatedReminders));
  }, [automatedReminders]);

  useEffect(() => {
    localStorage.setItem('ivoiretontine_is_live_mode', String(isLiveMode));
  }, [isLiveMode]);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  // Automatic contribution day check for logged-in user
  useEffect(() => {
    if (currentUser.role === 'admin') {
      setActiveDueToast(null);
      return;
    }

    // Check if the user has an active unpaid round in any tontine
    const dueTontine = tontines.find((t) => {
      if (t.status !== 'active') return false;
      const myPart = t.participants.find((p) => p.userId === currentUser.id);
      if (!myPart) return false;
      return myPart.contributionsPaidCount < t.currentRound;
    });

    if (dueTontine) {
      setActiveDueToast({
        isOpen: true,
        tontine: dueTontine,
        amount: dueTontine.contributionAmount,
        roundNumber: dueTontine.currentRound,
      });
    } else {
      setActiveDueToast(null);
    }
  }, [currentUserId, tontines]);

  const setCurrentUserById = (userId: string) => {
    setCurrentUserId(userId);
  };

  const openPaymentModal = (config: {
    title: string;
    amount: number;
    type: 'frais_creation' | 'cotisation';
    tontineId?: string;
    roundNumber?: number;
    metadata?: any;
    onSuccess?: (txn: Transaction) => void;
  }) => {
    setPaymentModalConfig({
      ...config,
      isOpen: true,
    });
  };

  const closePaymentModal = () => {
    setPaymentModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  // Create Tontine (only after payment of creation fee)
  const createTontine = (
    data: Omit<Tontine, 'id' | 'code' | 'creationFeePaid' | 'createdAt' | 'creationFeeTxnId' | 'totalPot' | 'commissionAmount' | 'netPayout' | 'currentRound'>,
    txnId: string
  ): Tontine => {
    const id = `tontine_${Date.now()}`;
    const code = `IVT-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalPot = data.contributionAmount * data.participantsCount;
    const commissionRate = settings.commissionRate;
    const commissionAmount = Math.round(totalPot * commissionRate);
    const netPayout = totalPot - commissionAmount;

    // Generate initial rounds structure
    const rounds = Array.from({ length: data.participantsCount }).map((_, index) => {
      const assignedParticipant = data.participants[index];
      return {
        roundNumber: index + 1,
        dueDate: `2026-${String(index + 3).padStart(2, '0')}-05`,
        beneficiaryId: assignedParticipant ? assignedParticipant.userId : '',
        beneficiaryName: assignedParticipant ? assignedParticipant.name : `Bénéficiaire Tour ${index + 1}`,
        beneficiaryPhone: assignedParticipant ? assignedParticipant.phone : '',
        targetPot: totalPot,
        collectedPot: 0,
        commissionAmount,
        netPaid: netPayout,
        status: (index === 0 ? 'en_cours' : 'a_venir') as 'en_cours' | 'a_venir',
      };
    });

    const newTontine: Tontine = {
      ...data,
      id,
      code,
      creationFeePaid: true,
      creationFeeTxnId: txnId,
      createdAt: new Date().toISOString().split('T')[0],
      currentRound: 1,
      totalPot,
      commissionRate,
      commissionAmount,
      netPayout,
      rounds,
    };

    setTontines((prev) => [newTontine, ...prev]);

    // Persist to Google Cloud Firestore
    try {
      setDoc(doc(db, 'tontines', newTontine.id), newTontine).catch((err) => {
        console.warn('Firestore tontine sync notice:', err);
      });
    } catch (e) {}

    // Send notification to creator
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      title: 'Tontine créée avec succès',
      message: `Votre tontine "${newTontine.name}" (Code: ${newTontine.code}) est désormais active. Partagez le lien d’invitation.`,
      date: 'À l’instant',
      type: 'paiement',
      read: false,
      actionView: newTontine.id,
    };
    setNotifications((prev) => [notif, ...prev]);

    return newTontine;
  };

  // Join a tontine
  const joinTontine = (tontineId: string): boolean => {
    const tontine = tontines.find((t) => t.id === tontineId);
    if (!tontine) return false;

    // Check if user is already participant
    if (tontine.participants.some((p) => p.userId === currentUser.id)) {
      return false;
    }

    if (tontine.participants.length >= tontine.participantsCount) {
      return false;
    }

    const nextPosition = tontine.participants.length + 1;
    const newParticipant = {
      id: `tp_${Date.now()}`,
      userId: currentUser.id,
      name: currentUser.name,
      phone: currentUser.phone,
      orderPosition: nextPosition,
      payoutDate: `Tour ${nextPosition}`,
      hasReceivedPayout: false,
      contributionsPaidCount: 0,
      isCurrentTurn: false,
      avatar: currentUser.avatarUrl,
    };

    const updatedParticipants = [...tontine.participants, newParticipant];
    const isNowFull = updatedParticipants.length >= tontine.participantsCount;

    setTontines((prev) =>
      prev.map((t) => {
        if (t.id !== tontineId) return t;
        return {
          ...t,
          participants: updatedParticipants,
          status: isNowFull ? 'active' : t.status,
        };
      })
    );

    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      title: 'Adhésion confirmée',
      message: `Vous avez rejoint la tontine "${tontine.name}". Votre tour de tirage est la position #${nextPosition}.`,
      date: 'À l’instant',
      type: 'invitation',
      read: false,
      actionView: tontine.id,
    };
    setNotifications((prev) => [notif, ...prev]);

    return true;
  };

  // Pay contribution for a round
  const submitContributionPayment = (
    tontineId: string,
    roundNumber: number,
    paymentMethod: PaymentMethod,
    phoneNumber: string
  ): Transaction => {
    const tontine = tontines.find((t) => t.id === tontineId);
    if (!tontine) throw new Error('Tontine introuvable');

    const txnRef = generateTxnRef('TXN-CI-COT');
    const receiptNum = generateReceiptNumber();

    const newTxn: Transaction = {
      id: `txn_${Date.now()}`,
      transactionRef: txnRef,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'cotisation',
      tontineId: tontine.id,
      tontineName: tontine.name,
      roundNumber,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: phoneNumber || currentUser.phone,
      amountGross: tontine.contributionAmount,
      feeAmount: 0,
      amountNet: tontine.contributionAmount,
      paymentMethod,
      status: 'succes',
      paymentSignature: `SIG-${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}-VERIFIED`,
      receiptNumber: receiptNum,
      notes: `Cotisation Tour ${roundNumber} - ${tontine.name}`,
    };

    setTransactions((prev) => [newTxn, ...prev]);

    // Persist to Cloud Firestore
    try {
      setDoc(doc(db, 'transactions', newTxn.id), newTxn).catch((err) => {
        console.warn('Firestore transaction sync notice:', err);
      });
      setDoc(doc(db, 'tontines', tontine.id), tontine).catch(() => {});
    } catch (e) {}

    // Update tontine state
    setTontines((prev) =>
      prev.map((t) => {
        if (t.id !== tontineId) return t;

        // Update participant contributions count
        const updatedParticipants = t.participants.map((p) => {
          if (p.userId === currentUser.id) {
            return {
              ...p,
              contributionsPaidCount: p.contributionsPaidCount + 1,
            };
          }
          return p;
        });

        // Update round collected pot
        const updatedRounds = t.rounds.map((r) => {
          if (r.roundNumber === roundNumber) {
            return {
              ...r,
              collectedPot: Math.min(t.totalPot, r.collectedPot + t.contributionAmount),
            };
          }
          return r;
        });

        return {
          ...t,
          participants: updatedParticipants,
          rounds: updatedRounds,
        };
      })
    );

    // Notification
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      title: 'Cotisation reçue',
      message: `Votre cotisation de ${tontine.contributionAmount} FCFA pour "${tontine.name}" a été confirmée. Reçu: ${receiptNum}`,
      date: 'À l’instant',
      type: 'paiement',
      read: false,
      actionView: tontine.id,
    };
    setNotifications((prev) => [notif, ...prev]);

    return newTxn;
  };

  // Distribute round payout to beneficiary (with commission deduction, default 4%)
  const distributeRoundPayout = (tontineId: string, roundNumber: number): Transaction | null => {
    const tontine = tontines.find((t) => t.id === tontineId);
    if (!tontine) return null;

    const round = tontine.rounds.find((r) => r.roundNumber === roundNumber);
    if (!round) return null;

    const grossAmount = tontine.totalPot;
    const commissionRate = tontine.commissionRate || 0.04;
    const commission = Math.round(grossAmount * commissionRate);
    const netPayout = grossAmount - commission;

    const txnRef = generateTxnRef('TXN-CI-PAYOUT');
    const receiptNum = generateReceiptNumber();

    const payoutTxn: Transaction = {
      id: `txn_${Date.now()}`,
      transactionRef: txnRef,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'reception_cagnotte',
      tontineId: tontine.id,
      tontineName: tontine.name,
      roundNumber,
      userId: round.beneficiaryId || currentUser.id,
      userName: round.beneficiaryName || currentUser.name,
      userPhone: round.beneficiaryPhone || currentUser.phone,
      amountGross: grossAmount,
      feeAmount: commission, // Retenue de service (4% par défaut)
      amountNet: netPayout,
      paymentMethod: 'wave',
      status: 'succes',
      paymentSignature: `SIG-PAYOUT-UEMOA-${Math.floor(100000 + Math.random() * 900000)}-BCEAO`,
      receiptNumber: receiptNum,
      notes: `Versement de la cagnotte Tour ${roundNumber} (${grossAmount} FCFA) déduction commission ${(commissionRate * 100).toFixed(0)}% (${commission} FCFA).`,
    };

    setTransactions((prev) => [payoutTxn, ...prev]);

    // Persist to Cloud Firestore
    try {
      setDoc(doc(db, 'transactions', payoutTxn.id), payoutTxn).catch((err) => {
        console.warn('Firestore payout sync notice:', err);
      });
      setDoc(doc(db, 'tontines', tontine.id), tontine).catch(() => {});
    } catch (e) {}

    // Update tontine round
    setTontines((prev) =>
      prev.map((t) => {
        if (t.id !== tontineId) return t;

        const updatedRounds = t.rounds.map((r) => {
          if (r.roundNumber === roundNumber) {
            return {
              ...r,
              collectedPot: grossAmount,
              status: 'verse' as const,
              payoutTxnRef: txnRef,
            };
          }
          if (r.roundNumber === roundNumber + 1) {
            return {
              ...r,
              status: 'en_cours' as const,
            };
          }
          return r;
        });

        const updatedParticipants = t.participants.map((p) => {
          if (p.userId === round.beneficiaryId) {
            return {
              ...p,
              hasReceivedPayout: true,
              isCurrentTurn: false,
            };
          }
          return p;
        });

        const nextRoundNum = roundNumber + 1;
        const isCompleted = nextRoundNum > t.participantsCount;

        return {
          ...t,
          currentRound: isCompleted ? t.currentRound : nextRoundNum,
          status: isCompleted ? 'terminee' : t.status,
          rounds: updatedRounds,
          participants: updatedParticipants,
        };
      })
    );

    // Notify beneficiary
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: round.beneficiaryId || currentUser.id,
      title: 'Cagnotte débloquée !',
      message: `Votre cagnotte de ${netPayout} FCFA nets pour "${tontine.name}" a été virée sur votre compte Mobile Money.`,
      date: 'À l’instant',
      type: 'paiement',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    return payoutTxn;
  };

  // Update platform settings (Admin only)
  const updatePlatformSettings = (newSettings: Partial<PlatformSettings>, reason: string) => {
    const updated = {
      ...settings,
      ...newSettings,
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          adminName: currentUser.name,
          action: 'MODIFICATION_PARAMETRES_TARIF',
          details: `${reason} - Frais création: ${newSettings.creationFee ?? settings.creationFee} FCFA, Commission: ${((newSettings.commissionRate ?? settings.commissionRate) * 100).toFixed(0)}%`,
        },
        ...settings.auditLogs,
      ],
    };
    setSettings(updated);
  };

  // Perform Admin Revenue Withdrawal (Retrait de revenus administrateur)
  const performAdminWithdrawal = (params: {
    amount: number;
    sourceType: 'frais_creation' | 'commissions' | 'total_disponible';
    destinationType: 'mobile_money_pro' | 'virement_bancaire_uemoa';
    destinationAccount: string;
    destinationEntity: string;
    pin: string;
  }): { success: boolean; error?: string; withdrawal?: AdminWithdrawal } => {
    // Basic PIN security check for admin payout (default admin PIN: 2026 or 1234)
    if (params.pin !== '2026' && params.pin !== '1234') {
      return { success: false, error: 'Code secret PIN Administrateur incorrect. (PIN démo : 2026)' };
    }

    if (params.amount <= 0) {
      return { success: false, error: 'Le montant de retrait doit être supérieur à 0 FCFA.' };
    }

    // Calculate current available balance
    const totalCreationFees = transactions
      .filter((t) => t.type === 'frais_creation' && t.status === 'succes')
      .reduce((acc, t) => acc + t.amountGross, 0);

    const totalCommissions = transactions
      .filter((t) => t.type === 'reception_cagnotte' && t.status === 'succes')
      .reduce((acc, t) => acc + t.feeAmount, 0);

    const totalWithdrawn = adminWithdrawals
      .filter((w) => w.status === 'valide')
      .reduce((acc, w) => acc + w.amount, 0);

    const totalAvailable = totalCreationFees + totalCommissions - totalWithdrawn;

    if (params.amount > totalAvailable) {
      return {
        success: false,
        error: `Solde insuffisant. Solde total disponible : ${totalAvailable.toLocaleString('fr-FR')} FCFA.`,
      };
    }

    const withdrawalRef = `RET-ADM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const receiptNum = `REC-RET-${Math.floor(10000 + Math.random() * 90000)}`;
    const auditHash = `HASH-SHA256-RETRAIT-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newWithdrawal: AdminWithdrawal = {
      id: `w_${Date.now()}`,
      withdrawalRef,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      adminId: currentUser.id,
      adminName: currentUser.name,
      amount: params.amount,
      sourceType: params.sourceType,
      destinationType: params.destinationType,
      destinationAccount: params.destinationAccount,
      destinationEntity: params.destinationEntity,
      status: 'valide',
      auditHash,
      receiptNumber: receiptNum,
    };

    setAdminWithdrawals((prev) => [newWithdrawal, ...prev]);

    // Persist to Cloud Firestore
    try {
      setDoc(doc(db, 'admin_withdrawals', newWithdrawal.id), newWithdrawal).catch((err) => {
        console.warn('Firestore admin withdrawal sync notice:', err);
      });
    } catch (e) {}

    // Record immutable audit entry
    const auditEntry = {
      id: `log_${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      adminName: currentUser.name,
      action: 'RETRAIT_REVENUS_ADMINISTRATEUR',
      details: `Retrait de ${params.amount.toLocaleString('fr-FR')} FCFA (${params.sourceType}) vers ${params.destinationEntity} (${params.destinationAccount}). Réf: ${withdrawalRef}. Hash: ${auditHash}`,
    };

    setSettings((prev) => ({
      ...prev,
      auditLogs: [auditEntry, ...prev.auditLogs],
    }));

    return { success: true, withdrawal: newWithdrawal };
  };

  // Trigger automated contribution day reminders (SMS, WhatsApp, In-App)
  const triggerAutomatedReminders = (targetTontineId?: string): {
    count: number;
    reminders: AutomatedReminder[];
  } => {
    const targetTontines = targetTontineId
      ? tontines.filter((t) => t.id === targetTontineId && t.status === 'active')
      : tontines.filter((t) => t.status === 'active');

    const newReminders: AutomatedReminder[] = [];
    const newNotifications: NotificationItem[] = [];

    targetTontines.forEach((tontine) => {
      // Find all participants who haven't paid their current round contribution
      const unpaidParticipants = tontine.participants.filter(
        (p) => p.contributionsPaidCount < tontine.currentRound
      );

      unpaidParticipants.forEach((p) => {
        const smsContent = `IVOIRETONTINE : Bonjour ${p.name}, aujourd'hui est le jour de cotisation pour "${tontine.name}" (Tour ${tontine.currentRound}). Montant : ${tontine.contributionAmount.toLocaleString('fr-FR')} FCFA. Réglez dès maintenant sur votre espace en un clic par Wave ou Orange Money.`;
        const whatsappContent = `🌟 *Rappel Automatique IVOIRETONTINE*\nBonjour *${p.name}*,\nC'est aujourd'hui le jour de votre cotisation pour le *Tour ${tontine.currentRound}* de *${tontine.name}*.\n💰 *Montant :* ${tontine.contributionAmount.toLocaleString('fr-FR')} FCFA\nÉchéance : ${tontine.nextDueDate}\nMerci d'honorer votre engagement pour assurer la cagnotte du tour.`;

        // 1. SMS Dispatch
        const smsReminder: AutomatedReminder = {
          id: `rem_sms_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          tontineId: tontine.id,
          tontineName: tontine.name,
          roundNumber: tontine.currentRound,
          userId: p.userId,
          userName: p.name,
          userPhone: p.phone,
          amount: tontine.contributionAmount,
          dueDate: tontine.nextDueDate,
          channel: 'sms',
          sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: 'delivre',
          messageContent: smsContent,
        };

        // 2. WhatsApp Dispatch
        const waReminder: AutomatedReminder = {
          id: `rem_wa_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          tontineId: tontine.id,
          tontineName: tontine.name,
          roundNumber: tontine.currentRound,
          userId: p.userId,
          userName: p.name,
          userPhone: p.phone,
          amount: tontine.contributionAmount,
          dueDate: tontine.nextDueDate,
          channel: 'whatsapp',
          sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: 'delivre',
          messageContent: whatsappContent,
        };

        newReminders.push(smsReminder, waReminder);

        // 3. In-App Notification
        const inAppNotif: NotificationItem = {
          id: `notif_rem_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          userId: p.userId,
          title: `🔔 Jour de cotisation : ${tontine.name}`,
          message: `Aujourd'hui est le jour d'échéance de votre cotisation (${tontine.contributionAmount.toLocaleString('fr-FR')} FCFA) pour le Tour ${tontine.currentRound}. Cliquez pour régler.`,
          date: 'Aujourd’hui',
          type: 'echeance',
          read: false,
          actionView: tontine.id,
        };

        newNotifications.push(inAppNotif);
      });
    });

    if (newReminders.length > 0) {
      setAutomatedReminders((prev) => [...newReminders, ...prev]);
      setNotifications((prev) => [...newNotifications, ...prev]);

      // Record in audit log
      const auditEntry = {
        id: `log_${Date.now()}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        adminName: 'Système Automatisé (Cron 08h00)',
        action: 'DISPATCH_RAPPELS_AUTOMATIQUES_COTISATION',
        details: `${newReminders.length} alertes (SMS/WhatsApp/In-App) diffusées automatiquement aux membres ayant une cotisation due aujourd'hui.`,
      };

      setSettings((prev) => ({
        ...prev,
        auditLogs: [auditEntry, ...prev.auditLogs],
      }));
    }

    return { count: newReminders.length, reminders: newReminders };
  };

  // Register new user
  const registerUser = (userData: {
    name: string;
    email: string;
    phone: string;
    city: string;
    country: string;
    bceaoKycStatus?: 'verifie' | 'en_attente' | 'non_soumis';
  }): User => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      ...userData,
      role: 'user',
      joinedDate: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
      isVerified: true,
      bceaoKycStatus: userData.bceaoKycStatus || 'verifie',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(newUser.id);

    const welcomeNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: newUser.id,
      title: 'Bienvenue sur IVOIRETONTINE !',
      message: 'Votre compte d’épargne a été créé avec succès et votre statut BCEAO est validé.',
      date: 'À l’instant',
      type: 'paiement',
      read: false,
    };
    setNotifications((prev) => [welcomeNotif, ...prev]);

    return newUser;
  };

  // Perform refund for contested transaction
  const performRefund = (transactionId: string, reason: string): { success: boolean; error?: string } => {
    const txn = transactions.find((t) => t.id === transactionId);
    if (!txn) return { success: false, error: 'Transaction introuvable.' };
    if (txn.status === 'rembourse') return { success: false, error: 'Cette transaction a déjà été remboursée.' };

    const refundRef = generateTxnRef('TXN-CI-REFUND');
    const refundTxn: Transaction = {
      id: `txn_ref_${Date.now()}`,
      transactionRef: refundRef,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'remboursement',
      tontineId: txn.tontineId,
      tontineName: txn.tontineName,
      userId: txn.userId,
      userName: txn.userName,
      userPhone: txn.userPhone,
      amountGross: -txn.amountGross,
      feeAmount: 0,
      amountNet: -txn.amountNet,
      paymentMethod: txn.paymentMethod,
      status: 'succes',
      paymentSignature: `SIG-REFUND-${Math.floor(100000 + Math.random() * 900000)}-OK`,
      receiptNumber: generateReceiptNumber(),
      notes: `Remboursement suite à réclamation : ${reason}`,
    };

    setTransactions((prev) => [
      refundTxn,
      ...prev.map((t) => (t.id === transactionId ? { ...t, status: 'rembourse' as const } : t)),
    ]);

    const auditEntry = {
      id: `log_${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      adminName: currentUser.name,
      action: 'REMBOURSEMENT_TRANSACTION',
      details: `Remboursement de ${txn.amountNet} FCFA opéré pour ${txn.userName} (${txn.userPhone}). Réf: ${refundRef}. Motif: ${reason}`,
    };
    setSettings((prev) => ({ ...prev, auditLogs: [auditEntry, ...prev.auditLogs] }));

    return { success: true };
  };

  // Perform transparent live draw to randomize participants order
  const performLiveDraw = (tontineId: string): boolean => {
    const tontine = tontines.find((t) => t.id === tontineId);
    if (!tontine || tontine.participants.length < 2) return false;

    // Fisher-Yates shuffle
    const shuffled = [...tontine.participants];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const updatedParticipants = shuffled.map((p, idx) => ({
      ...p,
      orderPosition: idx + 1,
      payoutDate: `Tour ${idx + 1}`,
      isCurrentTurn: idx === 0,
    }));

    const updatedRounds = Array.from({ length: tontine.participantsCount }).map((_, index) => {
      const assigned = updatedParticipants[index];
      return {
        roundNumber: index + 1,
        dueDate: `2026-${String(index + 3).padStart(2, '0')}-05`,
        beneficiaryId: assigned ? assigned.userId : '',
        beneficiaryName: assigned ? assigned.name : `Bénéficiaire Tour ${index + 1}`,
        beneficiaryPhone: assigned ? assigned.phone : '',
        targetPot: tontine.totalPot,
        collectedPot: 0,
        commissionAmount: tontine.commissionAmount,
        netPaid: tontine.netPayout,
        status: (index === 0 ? 'en_cours' : 'a_venir') as 'en_cours' | 'a_venir',
      };
    });

    setTontines((prev) =>
      prev.map((t) => {
        if (t.id !== tontineId) return t;
        return {
          ...t,
          participants: updatedParticipants,
          rounds: updatedRounds,
          status: 'active',
        };
      })
    );

    const auditEntry = {
      id: `log_${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      adminName: currentUser.name,
      action: 'TIRAGE_AU_SORT_IMPARTIAL_EFFECTUE',
      details: `Tirage au sort transparent validé pour la tontine "${tontine.name}" (${tontine.code}). ${updatedParticipants.length} positions scellées.`,
    };
    setSettings((prev) => ({ ...prev, auditLogs: [auditEntry, ...prev.auditLogs] }));

    return true;
  };

  // Support ticket operations
  const createSupportTicket = (
    subject: string,
    category: SupportTicket['category'],
    message: string,
    priority: SupportTicket['priority']
  ) => {
    const newTicket: SupportTicket = {
      id: `ticket_${Date.now()}`,
      ticketNumber: `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      subject,
      category,
      status: 'ouvert',
      priority,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      messages: [
        {
          id: `msg_${Date.now()}`,
          sender: currentUser.name,
          text: message,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          isAdmin: false,
        },
      ],
    };

    setTickets((prev) => [newTicket, ...prev]);
  };

  const replyTicket = (ticketId: string, text: string, isAdmin: boolean) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status: isAdmin ? 'en_cours' : t.status,
          messages: [
            ...t.messages,
            {
              id: `msg_${Date.now()}`,
              sender: isAdmin ? 'Support IVOIRETONTINE' : currentUser.name,
              text,
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              isAdmin,
            },
          ],
        };
      })
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };


  const resetAllData = () => {
    localStorage.clear();
    setTontines(INITIAL_TONTINES);
    setTransactions(INITIAL_TRANSACTIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setTickets(INITIAL_TICKETS);
    setSettings(INITIAL_SETTINGS);
    setCurrentUserId('user_admin');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        tontines,
        transactions,
        notifications,
        tickets,
        settings,
        adminWithdrawals,
        automatedReminders,
        activeDueToast,
        dismissDueToast,
        triggerAutomatedReminders,
        activeView,
        selectedTontineId,
        selectedReceiptTxn,
        isGeminiModalOpen,
        setIsGeminiModalOpen,
        isVeoModalOpen,
        setIsVeoModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isAuditModalOpen,
        setIsAuditModalOpen,
        isSimulatorModalOpen,
        setIsSimulatorModalOpen,
        isTreasuryStatementModalOpen,
        setIsTreasuryStatementModalOpen,
        isMerchantModalOpen,
        setIsMerchantModalOpen,
        isLiveMode,
        setIsLiveMode,
        paymentModalConfig,
        setActiveView,
        setSelectedTontineId,
        setSelectedReceiptTxn,
        setCurrentUserById,
        openPaymentModal,
        closePaymentModal,
        createTontine,
        joinTontine,
        submitContributionPayment,
        distributeRoundPayout,
        updatePlatformSettings,
        performAdminWithdrawal,
        registerUser,
        performRefund,
        performLiveDraw,
        createSupportTicket,
        replyTicket,
        markNotificationRead,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
