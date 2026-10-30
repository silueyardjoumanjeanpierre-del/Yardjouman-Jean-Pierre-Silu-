import React from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Phone, Mail, MapPin, Award } from 'lucide-react';
import { WHATSAPP_BUSINESS_DISPLAY, getWhatsAppBusinessLink } from '../utils/whatsapp';

export const Footer: React.FC = () => {
  const { setActiveView, setIsAuditModalOpen } = useApp();

  return (
    <footer className="bg-neutral-900 text-neutral-300 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Purpose */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-extrabold text-sm">
                IT
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                IVOIRE<span className="text-orange-500">TONTINE</span>
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              La plateforme technologique de référence pour la numérisation des tontines et de l’épargne rotative en Côte d’Ivoire et dans l’espace UEMOA.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Shield className="w-4 h-4 shrink-0" />
              <span>Conforme aux normes de paiement BCEAO</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Plateforme
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <button
                  onClick={() => setActiveView('accueil')}
                  className="hover:text-white transition-colors"
                >
                  Accueil & Simulateur
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('catalogue')}
                  className="hover:text-white transition-colors"
                >
                  Tontines Disponibles
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('creer_tontine')}
                  className="hover:text-white transition-colors"
                >
                  Créer une Tontine (1 000 FCFA)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('fonctionnement')}
                  className="hover:text-white transition-colors"
                >
                  Guide du Fonctionnement
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('transactions')}
                  className="hover:text-white transition-colors"
                >
                  Historique des Transactions
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Modèle économique & Sécurité */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Transparence Financière
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <span className="text-neutral-300 font-medium">Frais d'ouverture :</span> 1 000 FCFA par tontine créée
              </li>
              <li>
                <span className="text-neutral-300 font-medium">Commission de récupération :</span> 4% sur la cagnotte versée
              </li>
              <li>
                <span className="text-neutral-300 font-medium">Moyens de paiement :</span> Wave, Orange Money, MTN MoMo, Moov
              </li>
              <li>
                <button
                  onClick={() => setActiveView('cgu')}
                  className="hover:text-white transition-colors underline"
                >
                  Conditions Générales & Confidentialité
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Support */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Support & Conformité
            </h4>
            <div className="space-y-2.5 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span>Abidjan, Côte d'Ivoire (Plateau & Cocody)</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                <a
                  href={getWhatsAppBusinessLink('Bonjour IVOIRETONTINE, je vous contacte depuis le site.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-mono font-medium"
                >
                  <span>{WHATSAPP_BUSINESS_DISPLAY} (WhatsApp Business)</span>
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span>contact@ivoiretontine.ci</span>
              </div>
              <div className="pt-2 flex flex-col gap-1.5">
                <button
                  onClick={() => setActiveView('assistance')}
                  className="text-xs font-medium text-orange-400 hover:text-orange-300 transition-colors text-left"
                >
                  Ouvrir une réclamation / litige &rarr;
                </button>
                <button
                  onClick={() => setIsAuditModalOpen(true)}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors text-left flex items-center gap-1"
                >
                  <span>Consulter le Rapport d'Audit Fintech &rarr;</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory & Disclaimer Notice */}
        <div className="pt-8 border-t border-neutral-800 text-[11px] text-neutral-500 leading-relaxed space-y-2">
          <p>
            <strong className="text-neutral-400">Avis réglementaire et protection des participants :</strong> IVOIRETONTINE est une solution technologique éditée pour numériser et sécuriser l'épargne rotative communautaire. Conformément à la réglementation applicable en Côte d'Ivoire et dans la zone UEMOA, IVOIRETONTINE ne conserve pas directement de dépôts bancaires non régulés. L'ensemble des transferts, débits et crédits s'effectue via des prestataires de services de paiement et émetteurs de monnaie électronique dûment agréés par la Banque Centrale des États de l'Afrique de l'Ouest (BCEAO). La commission de récupération de 4% fait l'objet d'un accord exprès lors de l'adhésion.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 text-neutral-500 gap-2">
            <div>
              &copy; {new Date().getFullYear()} IVOIRETONTINE. Tous droits réservés. République de Côte d'Ivoire.
            </div>
            <div className="flex items-center gap-4 text-xs">
              <button onClick={() => setActiveView('cgu')} className="hover:text-neutral-300">
                Mentions Légales
              </button>
              <span>·</span>
              <button onClick={() => setActiveView('cgu')} className="hover:text-neutral-300">
                Politique ARTCI
              </button>
              <span>·</span>
              <button onClick={() => setActiveView('assistance')} className="hover:text-neutral-300">
                Centre d'Aide
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
