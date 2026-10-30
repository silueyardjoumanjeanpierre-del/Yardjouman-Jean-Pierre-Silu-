import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod, Transaction } from '../types';
import { formatFCFA, generateTxnRef, generateReceiptNumber } from '../utils/formatters';
import {
  ShieldCheck,
  Smartphone,
  Lock,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  RefreshCw,
  QrCode,
  FileCheck,
  MessageCircle,
} from 'lucide-react';
import {
  WHATSAPP_BUSINESS_DISPLAY,
  getWhatsAppBusinessLink,
  getWhatsAppShareLink,
  formatReceiptShareMessage,
} from '../utils/whatsapp';

interface OperatorInfo {
  id: PaymentMethod;
  name: string;
  badge: string;
  color: string;
  accentBg: string;
  borderColor: string;
  promptDescription: string;
}

const OPERATORS: OperatorInfo[] = [
  {
    id: 'wave',
    name: 'Wave Côte d’Ivoire',
    badge: '0% de frais de dépôt',
    color: 'text-sky-600',
    accentBg: 'bg-sky-50',
    borderColor: 'border-sky-300',
    promptDescription: 'Validez la notification instantanée sur votre application Wave CI.',
  },
  {
    id: 'orange_money',
    name: 'Orange Money (OM)',
    badge: 'Composez #144*82#',
    color: 'text-orange-600',
    accentBg: 'bg-orange-50',
    borderColor: 'border-orange-300',
    promptDescription: 'Générez un code temporaire en composant #144*82# ou validez le SMS.',
  },
  {
    id: 'mtn_momo',
    name: 'MTN Mobile Money',
    badge: 'Notification Push *133#',
    color: 'text-amber-600',
    accentBg: 'bg-amber-50',
    borderColor: 'border-amber-300',
    promptDescription: 'Approuvez la demande de débit sur votre téléphone (menu *133#).',
  },
  {
    id: 'moov_money',
    name: 'Moov Money (Flooz)',
    badge: 'Code USSD *155#',
    color: 'text-emerald-600',
    accentBg: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    promptDescription: 'Saisissez votre code PIN secret sur le prompt USSD de votre SIM Moov.',
  },
];

export const PaymentGatewayModal: React.FC = () => {
  const {
    currentUser,
    paymentModalConfig,
    closePaymentModal,
    setSelectedReceiptTxn,
    isLiveMode,
  } = useApp();

  const [selectedOperator, setSelectedOperator] = useState<PaymentMethod>('wave');
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phone || '+225 07 00 00 00 00');
  const [step, setStep] = useState<'details' | 'authenticating' | 'confirmed' | 'failed'>('details');
  const [otpCode, setOtpCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdTxn, setCreatedTxn] = useState<Transaction | null>(null);

  if (!paymentModalConfig.isOpen) return null;

  const executeInstantPayment = (operator: PaymentMethod = selectedOperator) => {
    setIsProcessing(true);
    setTimeout(() => {
      const txnRef = generateTxnRef(
        paymentModalConfig.type === 'frais_creation' ? 'TXN-CI-FEE' : 'TXN-CI-COT'
      );
      const receiptNum = generateReceiptNumber();

      const newTxn: Transaction = {
        id: `txn_${Date.now()}`,
        transactionRef: txnRef,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: paymentModalConfig.type,
        tontineId: paymentModalConfig.tontineId,
        tontineName: paymentModalConfig.metadata?.tontineName || paymentModalConfig.title,
        roundNumber: paymentModalConfig.roundNumber,
        userId: currentUser.id,
        userName: currentUser.name,
        userPhone: phoneNumber,
        amountGross: paymentModalConfig.amount,
        feeAmount: paymentModalConfig.type === 'frais_creation' ? paymentModalConfig.amount : 0,
        amountNet: paymentModalConfig.amount,
        paymentMethod: operator,
        status: 'succes',
        paymentSignature: `SIG-${operator.toUpperCase()}-${Math.floor(
          1000000 + Math.random() * 9000000
        )}-VALID`,
        receiptNumber: receiptNum,
        notes: `${paymentModalConfig.title} - Paiement express validé`,
      };

      setCreatedTxn(newTxn);
      setIsProcessing(false);
      setStep('confirmed');

      if (paymentModalConfig.onSuccess) {
        paymentModalConfig.onSuccess(newTxn);
      }
    }, 150);
  };

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    executeInstantPayment();
  };

  const handleConfirmAuthorization = () => {
    executeInstantPayment();
  };

  const handleClose = () => {
    setStep('details');
    setIsProcessing(false);
    setCreatedTxn(null);
    closePaymentModal();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-neutral-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-sm">
              IT
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                Guichet Sécurisé Mobile Money
              </h3>
              <p className="text-[11px] text-neutral-400">
                Agrégateur UEMOA · Côte d'Ivoire
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isProcessing && step === 'authenticating'}
            className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sandbox Test Mode Notice */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Mode Démonstration & Test (Sandbox) :</span>{' '}
            Aucun débit bancaire réel ne sera effectué sur votre SIM. La validation simule fidèlement les webhooks des opérateurs Mobile Money ivoiriens.
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {step === 'details' && (
            <form onSubmit={handleStartPayment} className="space-y-5">
              {/* Transaction Summary Card */}
              <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
                <div className="text-xs text-neutral-500 font-medium">Motif du paiement</div>
                <div className="text-sm font-semibold text-neutral-900 mt-0.5">
                  {paymentModalConfig.title}
                </div>
                <div className="mt-3 pt-3 border-t border-neutral-200/80 flex items-baseline justify-between">
                  <span className="text-xs text-neutral-600">Montant total à débiter :</span>
                  <span className="text-xl font-extrabold text-orange-600 tabular-nums">
                    {formatFCFA(paymentModalConfig.amount)}
                  </span>
                </div>
              </div>

              {/* Operator Selection */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                  1. Choisissez votre opérateur Mobile Money
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {OPERATORS.map((op) => {
                    const isSelected = selectedOperator === op.id;
                    return (
                      <button
                        type="button"
                        key={op.id}
                        onClick={() => setSelectedOperator(op.id)}
                        className={`text-left p-3 rounded-xl border text-xs transition-all ${
                          isSelected
                            ? `${op.borderColor} ${op.accentBg} ring-2 ring-orange-500/20 font-medium`
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-bold ${op.color}`}>{op.name}</span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-orange-600" />
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-500 block truncate">
                          {op.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  2. Numéro Mobile Money (+225)
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+225 07 12 34 56 78"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Ce numéro recevra la demande de confirmation sécurisée.
                </p>
              </div>

              {/* Safety & WhatsApp Support notice */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-neutral-500 bg-neutral-100/70 p-2.5 rounded-lg">
                  <Lock className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                  <span>
                    Vos codes PIN secrets ne sont <strong>jamais</strong> collectés ni stockés par IVOIRETONTINE.
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] bg-emerald-50 text-emerald-950 p-2.5 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-[#25D366] shrink-0" />
                    <span>Aide WhatsApp : <strong className="font-mono">{WHATSAPP_BUSINESS_DISPLAY}</strong></span>
                  </div>
                  <a
                    href={getWhatsAppBusinessLink(`Bonjour, j'ai besoin d'aide pour valider mon paiement Mobile Money sur IVOIRETONTINE (${paymentModalConfig.title}).`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-emerald-700 hover:text-emerald-800 underline shrink-0"
                  >
                    Assistance &rarr;
                  </a>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="space-y-2 pt-1">
                {isLiveMode ? (
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Confirmer et Payer {formatFCFA(paymentModalConfig.amount)}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => executeInstantPayment()}
                      disabled={isProcessing}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Valider Instantanément (Démo 1-Clic)</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Simulation standard Mobile Money</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                {/* Direct WhatsApp assistance link */}
                <div className="flex items-center justify-between text-[11px] text-neutral-600 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                  <span className="flex items-center gap-1.5 font-medium text-emerald-950">
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-[#25D366]" />
                    <span>Besoin d'aide ? Échangez sur WhatsApp :</span>
                  </span>
                  <a
                    href={getWhatsAppBusinessLink(`Bonjour IVOIRETONTINE, j'ai besoin d'une assistance pour le paiement Mobile Money de ${formatFCFA(paymentModalConfig.amount)}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono font-bold text-[#075E54] hover:text-[#25D366] underline flex items-center gap-0.5"
                  >
                    <span>{WHATSAPP_BUSINESS_DISPLAY}</span>
                  </a>
                </div>
              </div>
            </form>
          )}

          {step === 'authenticating' && (
            <div className="space-y-5 text-center py-2">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto text-orange-600 animate-pulse">
                <Smartphone className="w-7 h-7" />
              </div>

              <div>
                <h4 className="text-base font-bold text-neutral-900">
                  Approbation sur votre téléphone
                </h4>
                <p className="text-xs text-neutral-600 mt-1 max-w-sm mx-auto">
                  Une demande de débit de{' '}
                  <strong className="text-neutral-900">
                    {formatFCFA(paymentModalConfig.amount)}
                  </strong>{' '}
                  a été envoyée au numéro <span className="font-mono">{phoneNumber}</span> via{' '}
                  <strong className="text-neutral-900">
                    {OPERATORS.find((o) => o.id === selectedOperator)?.name}
                  </strong>.
                </p>
              </div>

              {/* Operator specific prompt simulation */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-left text-xs space-y-3">
                <div className="flex items-center gap-2 font-semibold text-neutral-800">
                  <RefreshCw className="w-3.5 h-3.5 text-orange-600 animate-spin" />
                  <span>Attente de signature opérateur...</span>
                </div>

                <p className="text-neutral-600">
                  {OPERATORS.find((o) => o.id === selectedOperator)?.promptDescription}
                </p>

                {selectedOperator === 'orange_money' && (
                  <div className="pt-2 border-t border-neutral-200">
                    <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                      Code de validation Orange Money :
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="Ex: 8241"
                        className="w-32 px-3 py-1.5 border border-neutral-300 rounded-lg text-center font-mono tracking-widest text-sm"
                      />
                      {!isLiveMode && (
                        <button
                          type="button"
                          onClick={() => setOtpCode('9134')}
                          className="px-2.5 py-1 text-[11px] bg-neutral-200 hover:bg-neutral-300 rounded-md text-neutral-700"
                        >
                          Générer code test
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  disabled={isProcessing}
                  className="w-1/2 py-2.5 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 rounded-xl text-xs font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAuthorization}
                  disabled={isProcessing}
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Vérification Webhook...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isLiveMode ? 'Confirmer la Réception' : 'Simuler validation Mobile'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'confirmed' && createdTxn && (
            <div className="space-y-5 text-center py-2">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-neutral-900">
                  Paiement Confirmé avec Succès !
                </h4>
                <p className="text-xs text-neutral-600 mt-1">
                  La transaction a été validée et enregistrée de manière immuable.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Réf. Transaction :</span>
                  <span className="font-mono font-semibold text-neutral-900">
                    {createdTxn.transactionRef}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Reçu N° :</span>
                  <span className="font-mono font-semibold text-neutral-900">
                    {createdTxn.receiptNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Montant :</span>
                  <span className="font-bold text-neutral-900 tabular-nums">
                    {formatFCFA(createdTxn.amountGross)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Moyen :</span>
                  <span className="font-medium text-neutral-800 uppercase">
                    {createdTxn.paymentMethod.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-neutral-200 text-[11px]">
                  <span className="text-neutral-500">Signature cryptographique :</span>
                  <span className="font-mono text-emerald-600 text-[10px] truncate max-w-[170px]">
                    {createdTxn.paymentSignature}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <a
                  href={getWhatsAppShareLink(formatReceiptShareMessage(createdTxn))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Transmettre le Reçu sur WhatsApp</span>
                </a>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedReceiptTxn(createdTxn);
                      handleClose();
                    }}
                    className="w-1/2 py-2.5 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Voir le Reçu Officiel</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-1/2 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Terminer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
