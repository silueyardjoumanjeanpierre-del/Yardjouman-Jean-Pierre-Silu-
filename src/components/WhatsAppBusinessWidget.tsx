/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  MessageCircle,
  X,
  Send,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import {
  WHATSAPP_BUSINESS_DISPLAY,
  WHATSAPP_BUSINESS_RAW,
  WHATSAPP_BUSINESS_CARRIER,
  getWhatsAppBusinessLink,
  WHATSAPP_SUPPORT_PRESETS,
} from '../utils/whatsapp';

export const WhatsAppBusinessWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(WHATSAPP_SUPPORT_PRESETS[0].id);
  const [customNote, setCustomNote] = useState('');

  const activePreset =
    WHATSAPP_SUPPORT_PRESETS.find((p) => p.id === selectedPresetId) ||
    WHATSAPP_SUPPORT_PRESETS[0];

  const fullMessage = customNote.trim()
    ? `${activePreset.message}\n\n*Précision :* ${customNote.trim()}`
    : activePreset.message;

  const directLink = getWhatsAppBusinessLink(fullMessage);

  return (
    <>
      {/* Floating WhatsApp Action Button */}
      <div className="fixed bottom-6 right-5 z-40 flex flex-col items-end">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 border-2 border-white ring-4 ring-emerald-500/20"
          title={`Contacter le support WhatsApp Business (${WHATSAPP_BUSINESS_DISPLAY})`}
          aria-label="Support WhatsApp Business"
        >
          {/* Animated WhatsApp icon */}
          <div className="relative">
            <MessageCircle className="w-5 h-5 fill-white text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-200 rounded-full animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white rounded-full" />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-xs font-black tracking-wide leading-none flex items-center gap-1">
              WhatsApp Business
              <span className="text-[10px] bg-black/20 text-white px-1.5 py-0.2 rounded font-mono font-bold">
                05 86 80 19 59
              </span>
            </span>
            <span className="text-[10px] text-emerald-100 font-medium leading-none mt-0.5">
              Assistance & Vérification Côte d'Ivoire
            </span>
          </div>
        </button>
      </div>

      {/* Interactive WhatsApp Quick Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden text-neutral-900 animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Header with WhatsApp Branding */}
            <div className="bg-[#075E54] text-white p-4 sm:p-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-7 h-7 text-[#25D366] fill-[#25D366]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-base tracking-tight">
                      IVOIRETONTINE Support
                    </h3>
                    <ShieldCheck className="w-4 h-4 text-[#25D366]" />
                  </div>
                  <div className="text-xs text-emerald-200 font-mono font-medium mt-0.5 flex items-center gap-2">
                    <span>{WHATSAPP_BUSINESS_DISPLAY}</span>
                    <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.2 rounded font-sans">
                      {WHATSAPP_BUSINESS_CARRIER}
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-100/90 flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 rounded-full bg-[#25D366] inline-block animate-pulse" />
                    <span>Compte Business Officiel · En ligne</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                  1. Choisissez votre sujet d'échange :
                </label>
                <div className="space-y-1.5">
                  {WHATSAPP_SUPPORT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedPresetId(preset.id)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between gap-2 ${
                        selectedPresetId === preset.id
                          ? 'border-[#25D366] bg-emerald-50 text-emerald-950 ring-2 ring-[#25D366]/20'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <span>{preset.label}</span>
                      {selectedPresetId === preset.id && (
                        <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message preview & customization */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  2. Aperçu du message à envoyer :
                </label>
                <div className="bg-neutral-50 rounded-2xl p-3 border border-neutral-200 text-xs text-neutral-800 space-y-2">
                  <div className="font-sans text-neutral-600 bg-white p-2.5 rounded-xl border border-neutral-200/80 italic">
                    « {activePreset.message} »
                  </div>

                  <input
                    type="text"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Ajouter une précision (ex: Numéro tontine, montant, nom)..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366]"
                  />
                </div>
              </div>

              {/* Direct Info Pills */}
              <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100 text-[11px] text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Délai de réponse moyen : Moins de 10 minutes</span>
                </div>
                <p className="text-emerald-800 text-[10px] leading-relaxed">
                  L'équipe IVOIRETONTINE est disponible du lundi au samedi de 07h à 21h GMT. En dehors de ces plages, les demandes urgentes sont traitées en continu.
                </p>
              </div>

              {/* CTA Launch WhatsApp */}
              <div className="pt-2">
                <a
                  href={directLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Send className="w-4 h-4 fill-white" />
                  <span>Démarrer la discussion sur WhatsApp (05 86 80 19 59)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                <div className="text-center mt-2.5">
                  <span className="text-[11px] text-neutral-400">
                    Numéro direct : <strong className="text-neutral-700 font-mono">{WHATSAPP_BUSINESS_DISPLAY}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
