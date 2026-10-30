import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA } from '../utils/formatters';
import {
  Search,
  Filter,
  PlusCircle,
  Users,
  ShieldCheck,
  ChevronRight,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { TontineFrequency } from '../types';

export const TontinesListView: React.FC = () => {
  const {
    tontines,
    currentUser,
    joinTontine,
    setActiveView,
    setSelectedTontineId,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState<'all' | TontineFrequency>('all');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [joinMsg, setJoinMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Filter tontines
  const filteredTontines = tontines.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFreq = frequencyFilter === 'all' || t.frequency === frequencyFilter;
    return matchesSearch && matchesFreq;
  });

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinMsg(null);
    const cleanedCode = inviteCodeInput.trim().toUpperCase();
    const target = tontines.find((t) => t.code.toUpperCase() === cleanedCode);

    if (!target) {
      setJoinMsg({ text: 'Code de tontine introuvable. Veuillez vérifier.', isError: true });
      return;
    }

    if (target.participants.some((p) => p.userId === currentUser.id)) {
      setJoinMsg({ text: 'Vous êtes déjà membre de cette tontine.', isError: false });
      setSelectedTontineId(target.id);
      setActiveView('details_tontine');
      return;
    }

    const success = joinTontine(target.id);
    if (success) {
      setSelectedTontineId(target.id);
      setActiveView('details_tontine');
    } else {
      setJoinMsg({ text: 'Impossible de rejoindre : groupe déjà complet.', isError: true });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Catalogue d'Épargne Rotative</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Tontines Disponibles en Côte d'Ivoire
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Rejoignez une communauté d'épargne vérifiée ou utilisez votre code d'invitation privé.
          </p>
        </div>

        <button
          onClick={() => setActiveView('creer_tontine')}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Créer ma Tontine (1 000 FCFA)</span>
        </button>
      </div>

      {/* Join By Private Invite Code Strip */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 rounded-2xl p-5 shadow-sm">
        <form
          onSubmit={handleJoinByCode}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-orange-600" />
              <h3 className="text-xs font-bold text-orange-950 uppercase tracking-wider">
                Rejoindre par Code Privé d'Invitation
              </h3>
            </div>
            <p className="text-xs text-orange-900">
              Vous avez reçu un code comme <span className="font-mono font-bold">IVT-7821</span> ? Entrez-le pour accéder directement au groupe.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={inviteCodeInput}
              onChange={(e) => setInviteCodeInput(e.target.value)}
              placeholder="Ex: IVT-7821"
              required
              className="px-3.5 py-2 text-xs font-mono font-bold tracking-wider rounded-xl border border-orange-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap"
            >
              Rejoindre
            </button>
          </div>
        </form>

        {joinMsg && (
          <div
            className={`mt-3 text-xs p-2.5 rounded-lg font-medium ${
              joinMsg.isError
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}
          >
            {joinMsg.text}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, ville, code..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
          />
        </div>

        {/* Frequency Segmented Filter */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl">
          {[
            { id: 'all', label: 'Toutes' },
            { id: 'hebdomadaire', label: 'Hebdo' },
            { id: 'bimensuelle', label: 'Bimensuel' },
            { id: 'mensuelle', label: 'Mensuel' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFrequencyFilter(item.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                frequencyFilter === item.id
                  ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tontines Cards Grid */}
      {filteredTontines.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-3">
          <p className="text-xs text-neutral-500">
            Aucune tontine ne correspond à vos critères de recherche.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFrequencyFilter('all');
            }}
            className="text-xs font-semibold text-orange-600 hover:underline"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTontines.map((tontine) => {
            const isMember = tontine.participants.some(
              (p) => p.userId === currentUser.id
            );
            const isFull = tontine.participants.length >= tontine.participantsCount;
            const progress = (tontine.participants.length / tontine.participantsCount) * 100;

            return (
              <div
                key={tontine.id}
                className="bg-white rounded-2xl border border-neutral-200 hover:border-neutral-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-neutral-400">
                          {tontine.code}
                        </span>
                        <span className="text-neutral-300">·</span>
                        <span className="text-[11px] text-neutral-500">{tontine.category}</span>
                      </div>
                      <h3 className="text-base font-bold text-neutral-900 mt-0.5">
                        {tontine.name}
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 capitalize shrink-0">
                      {tontine.frequency}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                    {tontine.description || 'Groupe d’épargne rotative solidaire.'}
                  </p>

                  {/* Financial Breakdown Card */}
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-150 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Cotisation :</span>
                      <span className="font-mono font-bold text-neutral-900">
                        {formatFCFA(tontine.contributionAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Cagnotte nette / tour :</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {formatFCFA(tontine.netPayout)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-neutral-400 pt-1 border-t border-neutral-200/80">
                      <span>Commission {(tontine.commissionRate * 100).toFixed(0)}% déduite :</span>
                      <span className="font-mono">{formatFCFA(tontine.commissionAmount)}</span>
                    </div>
                  </div>

                  {/* Participants filling bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>Places occupées</span>
                      <span className="font-mono font-semibold text-neutral-900">
                        {tontine.participants.length} / {tontine.participantsCount} membres
                      </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action footer */}
                <div className="bg-neutral-50/70 p-4 border-t border-neutral-150 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500">
                    Par {tontine.creatorName}
                  </span>

                  <div className="flex items-center gap-2">
                    {isMember ? (
                      <button
                        onClick={() => {
                          setSelectedTontineId(tontine.id);
                          setActiveView('details_tontine');
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Membre</span>
                      </button>
                    ) : isFull ? (
                      <span className="text-xs text-neutral-400 font-semibold px-2 py-1">
                        Complet
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          joinTontine(tontine.id);
                          setSelectedTontineId(tontine.id);
                          setActiveView('details_tontine');
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors"
                      >
                        Rejoindre
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedTontineId(tontine.id);
                        setActiveView('details_tontine');
                      }}
                      className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50 rounded-lg transition-colors"
                      title="Voir les détails"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
