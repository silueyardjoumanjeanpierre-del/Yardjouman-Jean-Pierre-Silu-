import React from 'react';
import { Shield, FileText, Lock, AlertTriangle } from 'lucide-react';

export const TermsPrivacyView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
          <Shield className="w-4 h-4" />
          <span>Cadre Juridique & Réglementaire</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
          Conditions Générales & Politique de Confidentialité
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Réglementation applicable en République de Côte d'Ivoire et au sein de l'espace UEMOA.
        </p>
      </div>

      {/* Warning callout */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3.5">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 space-y-1 leading-relaxed">
          <div className="font-bold text-sm text-amber-950">
            Avertissement sur les Risques et Absence de Garantie de Gain
          </div>
          <p>
            L'épargne rotative (tontine) repose sur la solidarité et l'engagement réciproque de ses participants. IVOIRETONTINE ne promet aucun rendement spéculatif ni gain financier garanti. L'application constitue une plateforme technologique d'organisation, d'horodatage et de traçabilité. Chaque participant est tenu d'honorer scrupuleusement l'ensemble de ses cotisations jusqu'au terme complet de la tontine.
          </p>
        </div>
      </div>

      {/* Legal Articles */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6 text-xs text-neutral-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
            Article 1 : Nature du Service et Rôle d'IVOIRETONTINE
          </h2>
          <p>
            IVOIRETONTINE est un service numérique d'intermédiation technologique dédié à la facilitation des tontines rotatives traditionnelles. IVOIRETONTINE n'est ni un établissement bancaire, ni un établissement de crédit, ni un organisme de dépôt au sens de la loi bancaire de l'UEMOA. Tous les transferts de fonds sont exécutés de manière externe par des établissements émetteurs de monnaie électronique agréés (Orange Money Côte d'Ivoire, MTN Mobile Money CI, Moov Money CI, Wave Digital Finance).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
            Article 2 : Modèle Économique & Tarifs de Service
          </h2>
          <p>
            La rémunération du service technologique repose sur deux sources distinctes et expressément acceptées par l'utilisateur :
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
            <li>
              <strong>Frais de création de tontine :</strong> Montant forfaitaire de <strong>1 000 FCFA</strong> exigible à l'ouverture de toute nouvelle tontine, non remboursable une fois le groupe activé.
            </li>
            <li>
              <strong>Commission de récupération :</strong> Commission de <strong>4%</strong> prélevée sur le montant brut de la cagnotte lors de son versement effectif au bénéficiaire du tour, rémunérant le service d'administration, la tenue des registres et l'infrastructure sécurisée.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
            Article 3 : Obligations des Participants et Sanctions des Retards
          </h2>
          <p>
            Tout participant ayant adhéré à une tontine s'oblige solidairement à verser sa cotisation à chaque échéance fixée par le calendrier du groupe. En cas de défaillance ou de retard non justifié de plus de 48 heures, des pénalités conventionnelles prévues par le règlement intérieur du groupe peuvent être appliquées et reversées au bénéficiaire lésé.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
            Article 4 : Protection des Données Personnelles (ARTCI)
          </h2>
          <p>
            Conformément à la loi n°2013-450 relative à la protection des données à caractère personnel en Côte d'Ivoire, régulée par l'Autorité de Régulation des Télécommunications/TIC de Côte d'Ivoire (ARTCI), vos données (identité, numéro de téléphone, historique de transactions) sont collectées strictement pour l'exécution du contrat de tontine et la prévention des fraudes.
          </p>
          <p>
            IVOIRETONTINE ne commercialise ni ne cède vos données personnelles à des tiers. Les codes PIN secrets Mobile Money ne sont en aucun cas demandés, traités ou enregistrés par nos systèmes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
            Article 5 : Médiation et Résolution des Différends
          </h2>
          <p>
            En cas de litige entre participants ou contestation relative à un paiement, les parties conviennent de soumettre en priorité leur réclamation au Centre de Médiation IVOIRETONTINE. À défaut d'accord amiable sous 30 jours, les tribunaux compétents d'Abidjan (Plateau) seront seuls habilités à trancher le différend.
          </p>
        </section>
      </div>
    </div>
  );
};
