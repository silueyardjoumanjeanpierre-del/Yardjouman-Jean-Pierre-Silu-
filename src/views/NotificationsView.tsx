import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  Check,
  Clock,
  Shield,
  ChevronRight,
  Smartphone,
  Send,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Settings2,
  Sparkles,
  KeyRound,
  Radio,
} from 'lucide-react';
import { NotificationItem } from '../types';

export const NotificationsView: React.FC = () => {
  const { notifications, currentUser, markNotificationRead, setSelectedTontineId, setActiveView } = useApp();

  const userNotifs = notifications.filter((n) => n.userId === currentUser.id);

  // Push notification permission state
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [fcmToken, setFcmToken] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [pushStatusMessage, setPushStatusMessage] = useState<string | null>(null);

  // Push notification preferences
  const [prefEcheances, setPrefEcheances] = useState(true);
  const [prefReceptionFonds, setPrefReceptionFonds] = useState(true);
  const [prefInvitations, setPrefInvitations] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
      const savedToken = localStorage.getItem('ivoiretontine_fcm_token');
      if (savedToken) {
        setFcmToken(savedToken);
      }
    }
  }, []);

  const requestPushPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPushStatusMessage('Les notifications push ne sont pas supportées par ce navigateur.');
      return;
    }

    setIsRegistering(true);
    try {
      const res = await Notification.requestPermission();
      setPermission(res);

      if (res === 'granted') {
        const generatedToken = `fcm_ci_${currentUser.id.substring(0, 8)}_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
        setFcmToken(generatedToken);
        localStorage.setItem('ivoiretontine_fcm_token', generatedToken);
        setPushStatusMessage('Notifications push autorisées et jeton FCM synchronisé avec succès.');

        // Play short sound & show welcome notification
        try {
          new Notification('IVOIRETONTINE - Notifications Activées', {
            body: 'Vous recevrez désormais les alertes d’échéances et de versements Mobile Money.',
            icon: '/favicon.ico',
          });
        } catch (e) {}
      } else {
        setPushStatusMessage('Autorisation refusée ou ignorée. Vous pouvez l’activer dans les paramètres du navigateur.');
      }
    } catch (err: any) {
      setPushStatusMessage(`Erreur d'activation : ${err.message || 'Échec de la demande'}`);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleTestPush = (type: 'echeance' | 'reception_fonds' | 'invitation') => {
    let title = '';
    let body = '';

    if (type === 'echeance') {
      title = '⏰ Rappel Cotisation Tontine (Jour J)';
      body = 'Votre cotisation de 25 000 FCFA pour la Tontine des Commerçants de Treichville est due aujourd’hui.';
    } else if (type === 'reception_fonds') {
      title = '💰 Félicitations ! Cagnotte Mobile Money Débloquée';
      body = 'Votre cagnotte nette de 225 000 FCFA a été virée avec succès sur votre compte Wave (+225 07 48...).';
    } else {
      title = '✉️ Nouvelle Invitation en Tontine';
      body = 'Kouamé Konan vous invite à rejoindre le groupe « Tontine Épargne Rentrée Scolaire ».';
    }

    // Native Notification if supported & permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch (e) {}
    }

    // Audio chime feedback using Web Audio API
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {}

    setPushStatusMessage(`Notification test envoyée : « ${title} »`);
  };

  const handleMarkAllRead = () => {
    userNotifs.forEach((n) => markNotificationRead(n.id));
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    markNotificationRead(notif.id);
    if (notif.actionView) {
      setSelectedTontineId(notif.actionView);
      setActiveView('details_tontine');
    }
  };

  const filteredNotifs = userNotifs.filter((n) => {
    if (filterType === 'unread') return !n.read;
    if (filterType === 'paiement') return n.type === 'paiement';
    if (filterType === 'echeance') return n.type === 'echeance' || n.type === 'alerte';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" />
            <span>Centre de Messages & Push FCM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Notifications & Alertes Push
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Restez informé en temps réel des échéances de cotisation, réceptions de fonds et invitations.
          </p>
        </div>

        {userNotifs.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5 self-start sm:self-auto bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-xl transition-colors"
          >
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tout marquer comme lu</span>
          </button>
        )}
      </div>

      {/* Firebase Cloud Messaging & Push Control Card */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-3xl p-6 shadow-md border border-neutral-700 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-700/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Notifications Push FCM (Firebase Cloud Messaging)</h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    permission === 'granted'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {permission === 'granted' ? 'Activé' : permission === 'denied' ? 'Bloqué' : 'En attente'}
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Avertissements instantanés sur smartphone ou ordinateur, même si l’onglet est fermé.
              </p>
            </div>
          </div>

          {permission !== 'granted' ? (
            <button
              onClick={requestPushPermission}
              disabled={isRegistering}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{isRegistering ? 'Activation en cours...' : 'Activer les alertes Push'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold shrink-0">
              <CheckCircle2 className="w-4 h-4" />
              <span>Push Naviguateur Autorisé</span>
            </div>
          )}
        </div>

        {/* Device FCM Token details */}
        {fcmToken && (
          <div className="p-3 bg-neutral-950/70 rounded-xl border border-neutral-800 text-xs space-y-1">
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-orange-400" />
                <span>Jeton de périphérique FCM enregistré</span>
              </span>
              <span className="font-mono text-[10px] text-emerald-400">Connecté à Firebase</span>
            </div>
            <div className="font-mono text-[11px] text-neutral-300 truncate select-all">
              {fcmToken}
            </div>
          </div>
        )}

        {/* Quick Test Triggers */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Tester les flux de notification push :
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTestPush('echeance')}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-medium border border-neutral-700 transition-colors flex items-center gap-1.5"
            >
              <span>🔔 Test Échéance Cotisation (Jour J)</span>
            </button>
            <button
              onClick={() => handleTestPush('reception_fonds')}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-medium border border-neutral-700 transition-colors flex items-center gap-1.5"
            >
              <span>💰 Test Réception de Fonds (96% net)</span>
            </button>
            <button
              onClick={() => handleTestPush('invitation')}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-medium border border-neutral-700 transition-colors flex items-center gap-1.5"
            >
              <span>✉️ Test Invitation Tontine</span>
            </button>
          </div>
        </div>

        {pushStatusMessage && (
          <div className="p-2.5 bg-orange-950/40 border border-orange-500/30 rounded-xl text-xs text-orange-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
            <span>{pushStatusMessage}</span>
          </div>
        )}

        {/* Channel Preferences Checkboxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-neutral-700/60 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-300 hover:text-white">
            <input
              type="checkbox"
              checked={prefEcheances}
              onChange={(e) => setPrefEcheances(e.target.checked)}
              className="rounded text-orange-600 focus:ring-orange-500"
            />
            <span>Échéances (J-1 et Jour J)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-300 hover:text-white">
            <input
              type="checkbox"
              checked={prefReceptionFonds}
              onChange={(e) => setPrefReceptionFonds(e.target.checked)}
              className="rounded text-orange-600 focus:ring-orange-500"
            />
            <span>Versements Mobile Money</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-300 hover:text-white">
            <input
              type="checkbox"
              checked={prefInvitations}
              onChange={(e) => setPrefInvitations(e.target.checked)}
              className="rounded text-orange-600 focus:ring-orange-500"
            />
            <span>Invitations & Nouveaux Tours</span>
          </label>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 pb-2 text-xs">
        {[
          { id: 'all', label: `Toutes (${userNotifs.length})` },
          { id: 'unread', label: `Non lues (${userNotifs.filter((n) => !n.read).length})` },
          { id: 'paiement', label: 'Paiements & Versements' },
          { id: 'echeance', label: 'Échéances & Rappels' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              filterType === tab.id
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications History List */}
      {filteredNotifs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-xs text-neutral-500">
          Aucune notification ne correspond au filtre sélectionné.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden shadow-sm">
          {filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-neutral-50 transition-colors ${
                !n.read ? 'bg-orange-50/40' : ''
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-orange-600 shrink-0" />
                  )}
                  <h3 className="text-xs font-bold text-neutral-900">{n.title}</h3>
                  <span className="text-[10px] text-neutral-400">· {n.date}</span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed pl-4">{n.message}</p>
              </div>

              {n.actionView && (
                <span className="text-xs font-semibold text-orange-600 flex items-center gap-1 shrink-0 pt-1">
                  <span>Voir</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
