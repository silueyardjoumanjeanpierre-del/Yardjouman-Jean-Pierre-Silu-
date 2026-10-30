import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  HelpCircle,
  MessageSquare,
  AlertTriangle,
  Phone,
  Mail,
  Send,
  PlusCircle,
  CheckCircle2,
  Clock,
  Shield,
  FileCheck2,
  ExternalLink,
} from 'lucide-react';
import { SupportTicket } from '../types';
import { DynamicFAQSection } from '../components/DynamicFAQSection';
import { WHATSAPP_BUSINESS_DISPLAY, getWhatsAppBusinessLink } from '../utils/whatsapp';

export const SupportView: React.FC = () => {
  const { tickets, currentUser, createSupportTicket, replyTicket, setIsAuditModalOpen } = useApp();

  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('paiement');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<SupportTicket['priority']>('normale');

  // Selected ticket for conversation
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    tickets[0]?.id || null
  );
  const [replyText, setReplyText] = useState('');

  const currentTicket = tickets.find((t) => t.id === selectedTicketId);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    createSupportTicket(subject, category, message, priority);
    setSubject('');
    setMessage('');
    setIsNewTicketOpen(false);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicketId) return;

    replyTicket(selectedTicketId, replyText, currentUser.role === 'admin');
    setReplyText('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
            <HelpCircle className="w-4 h-4" />
            <span>Médiation & Conformité Client</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Centre d'Assistance & de Réclamation
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Signalez un incident de paiement Mobile Money, un retard de participant ou un litige financier.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 border border-neutral-700"
          >
            <FileCheck2 className="w-4 h-4 text-orange-400" />
            <span>Rapport d'Audit & Diagnostic</span>
          </button>

          <button
            onClick={() => setIsNewTicketOpen(true)}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ouvrir une Réclamation</span>
          </button>
        </div>
      </div>

      {/* Direct Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* WhatsApp Business Card */}
        <a
          href={getWhatsAppBusinessLink('Bonjour IVOIRETONTINE, je vous contacte depuis la page Support pour une assistance.')}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-br from-emerald-50 to-white p-4 rounded-2xl border-2 border-[#25D366]/40 shadow-sm hover:border-[#25D366] transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm">
              <MessageSquare className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                <span>WhatsApp Business Officiel</span>
                <span className="w-2 h-2 rounded-full bg-[#25D366] inline-block animate-pulse" />
              </div>
              <div className="text-xs text-emerald-700 font-mono font-bold mt-0.5">
                {WHATSAPP_BUSINESS_DISPLAY}
              </div>
              <div className="text-[10px] text-emerald-800 font-medium">
                Conseiller en ligne · Réponse sous 10 min
              </div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </a>

        {/* Support Téléphonique Abidjan */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-neutral-900">Standard Téléphonique Abidjan</div>
            <div className="text-xs text-neutral-800 font-mono font-bold">{WHATSAPP_BUSINESS_DISPLAY}</div>
            <div className="text-[10px] text-neutral-400">Lun - Sam : 07h à 21h GMT</div>
          </div>
        </div>

        {/* Audit & Legal Litiges */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-neutral-700" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900">Centre de Médiation & Audit</div>
              <div className="text-xs text-neutral-600 font-mono">contact@ivoiretontine.ci</div>
              <div className="text-[10px] text-neutral-400">Conformité BCEAO & ARTCI</div>
            </div>
          </div>
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="text-[11px] font-bold text-orange-600 hover:text-orange-700 underline shrink-0"
          >
            Audit &rarr;
          </button>
        </div>
      </div>

      {/* Dynamic Knowledge Base & FAQ */}
      <DynamicFAQSection />

      {/* Main Support Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tickets list */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-neutral-200 text-xs font-bold text-neutral-900 uppercase tracking-wider">
            Dossiers de Réclamation ({tickets.length})
          </div>

          <div className="divide-y divide-neutral-150">
            {tickets.map((t) => {
              const isSelected = t.id === selectedTicketId;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-4 cursor-pointer text-xs transition-colors ${
                    isSelected ? 'bg-orange-50/70 border-l-4 border-orange-600' : 'hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-neutral-500 text-[10px]">
                      {t.ticketNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        t.status === 'resolu'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-neutral-900 line-clamp-1">{t.subject}</h4>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1">
                    <span>{t.userName}</span>
                    <span>{t.createdAt.split(' ')[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Ticket Conversation Thread */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col min-h-[450px]">
          {currentTicket ? (
            <>
              {/* Ticket Header */}
              <div className="p-5 border-b border-neutral-200 bg-neutral-50/60">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-orange-600">
                    {currentTicket.ticketNumber}
                  </span>
                  <span className="text-xs text-neutral-500 capitalize">
                    Catégorie : {currentTicket.category.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-base font-bold text-neutral-900 mt-1">
                  {currentTicket.subject}
                </h3>
                <div className="text-xs text-neutral-500 mt-0.5">
                  Demandeur : <strong>{currentTicket.userName}</strong> ({currentTicket.userPhone})
                </div>
              </div>

              {/* Message History */}
              <div className="p-5 flex-1 space-y-4 overflow-y-auto max-h-[350px]">
                {currentTicket.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.isAdmin ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mb-1">
                      <span className="font-semibold text-neutral-700">{m.sender}</span>
                      <span>·</span>
                      <span>{m.date}</span>
                    </div>
                    <div
                      className={`p-3.5 rounded-2xl text-xs max-w-lg leading-relaxed ${
                        m.isAdmin
                          ? 'bg-neutral-100 text-neutral-900 rounded-tl-none border border-neutral-200'
                          : 'bg-orange-600 text-white rounded-tr-none'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Input */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-neutral-200 bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Tapez votre réponse ou justificatif..."
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-neutral-400 m-auto">
              Sélectionnez un ticket pour afficher la discussion.
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Ticket */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
              <h3 className="text-sm font-bold text-neutral-900">
                Ouvrir une Demande de Médiation ou Litige
              </h3>
              <button
                onClick={() => setIsNewTicketOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Catégorie du litige
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl bg-white"
                >
                  <option value="paiement">Incident de débit Mobile Money</option>
                  <option value="retard_cotisation">Retard abusif de cotisation d'un membre</option>
                  <option value="reception_fonds">Versement cagnotte non reçu</option>
                  <option value="technique">Problème d'accès ou compte</option>
                  <option value="autre">Autre motif</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Objet du dossier
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: Débit Wave effectué mais non comptabilisé sur le Tour 2"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Description détaillée et références de transaction
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Précisez la date, le montant, la tontine concernée et le numéro de téléphone émetteur..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="w-1/2 py-2 border border-neutral-300 rounded-xl font-semibold hover:bg-neutral-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Soumettre le dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
