import React, { useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';
import { useApp } from '../context/AppContext';
import {
  Shield,
  CheckCircle2,
  X,
  LogOut,
  UserCheck,
  AlertCircle,
  Database,
  Lock,
} from 'lucide-react';

interface FirebaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseAuthModal: React.FC<FirebaseAuthModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, users, setCurrentUserById } = useApp();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Save or update user in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      const userData = {
        id: user.uid,
        name: user.displayName || 'Utilisateur Google',
        email: user.email || '',
        phone: user.phoneNumber || '+225 07 00 00 00 00',
        role: 'user',
        city: 'Abidjan',
        country: "Côte d'Ivoire",
        avatarUrl: user.photoURL || undefined,
        joinedDate: new Date().toISOString().split('T')[0],
        isVerified: true,
        bceaoKycStatus: 'verifie' as const,
      };

      if (!userSnap.exists()) {
        await setDoc(userRef, userData);
      }

      onClose();
    } catch (err: any) {
      console.error('Firebase Auth error:', err);
      setAuthError(
        err.message || 'Impossible de se connecter avec Google. Veuillez réessayer.'
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setFirebaseUser(null);
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-neutral-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-sm">
              <Database className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                Authentification & Firestore
              </h3>
              <p className="text-[11px] text-neutral-400">
                Google Sign-In & Persistance Cloud
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status info */}
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-600 space-y-1">
              <p className="font-semibold text-neutral-900">
                Sécurité & Identification Réglementaire
              </p>
              <p className="text-[11px] leading-relaxed">
                Connectez votre compte Google sécurisé via Firebase Auth pour sauvegarder vos tontines et transactions sur Google Cloud Firestore.
              </p>
            </div>
          </div>

          {/* Current Firebase Auth State */}
          {firebaseUser ? (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Connecté avec Google</span>
                </span>
                <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full font-mono font-bold">
                  Firebase UID
                </span>
              </div>

              <div className="flex items-center gap-3">
                {firebaseUser.photoURL ? (
                  <img
                    src={firebaseUser.photoURL}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-emerald-300"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold">
                    {firebaseUser.displayName?.charAt(0) || 'G'}
                  </div>
                )}
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-neutral-900 truncate">
                    {firebaseUser.displayName || 'Utilisateur Google'}
                  </div>
                  <div className="text-[11px] text-neutral-500 truncate font-mono">
                    {firebaseUser.email}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full mt-2 py-2 px-3 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Se déconnecter de Google</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="w-full py-3 px-4 bg-white hover:bg-neutral-50 text-neutral-900 font-bold text-xs rounded-xl border border-neutral-300 shadow-sm transition-all flex items-center justify-center gap-3"
              >
                {/* Google SVG Logo */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isSigningIn ? 'Connexion en cours...' : 'Se connecter avec Google'}</span>
              </button>
            </div>
          )}

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Quick Demo Switcher Section */}
          <div className="pt-3 border-t border-neutral-200 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
              Ou basculer sur un profil Démo instantané :
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setCurrentUserById(u.id);
                    onClose();
                  }}
                  className={`w-full p-2 text-left rounded-lg text-xs flex items-center justify-between border transition-all ${
                    u.id === currentUser.id
                      ? 'border-orange-500 bg-orange-50/70 text-orange-950 font-semibold'
                      : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={u.avatarUrl || ''}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span>{u.name}</span>
                  </div>
                  {u.role === 'admin' ? (
                    <span className="text-[9px] bg-neutral-900 text-white font-mono px-1.5 py-0.2 rounded">
                      ADMIN
                    </span>
                  ) : u.id === currentUser.id ? (
                    <UserCheck className="w-3.5 h-3.5 text-orange-600" />
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
