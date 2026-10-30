import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Sparkles,
  X,
  Play,
  Download,
  RotateCcw,
  Film,
  CheckCircle2,
  Clock,
  AlertCircle,
  Smartphone,
  Monitor,
  Share2,
} from 'lucide-react';

interface VeoVideoStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_PROMPTS = [
  "Spot publicitaire dynamique montrant des femmes commerçantes d'Abidjan à Treichville recevant leur cagnotte Wave sur smartphone avec le logo IVOIRETONTINE",
  "Animation 3D cinématique élégante montrant des pièces d'or FCFA qui tournent autour d'un coffre numérique sécurisé avec le drapeau ivoirien",
  "Groupe d'entrepreneurs ivoiriens au Plateau fêtant le déblocage de leur tontine rotative pour financer un nouveau commerce",
  "Tutoriel visuel animé en 3D expliquant la cotisation Mobile Money (Wave, Orange, MTN) et la commission équitable de 4%",
];

const LOADING_MESSAGES = [
  "Initialisation du modèle Veo 3 (veo-3.1-fast-generate-preview)...",
  "Création du storyboard cinématique pour IVOIRETONTINE...",
  "Génération neuronale image par image à haute résolution...",
  "Application de l'étalonnage des couleurs et de la dynamique visuelle...",
  "Rendu vidéo haute fidélité en cours...",
  "Finalisation et encodage du flux MP4...",
];

export const VeoVideoStudioModal: React.FC<VeoVideoStudioModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [prompt, setPrompt] = useState(SAMPLE_PROMPTS[0]);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [operationName, setOperationName] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pollIntervalRef = useRef<any>(null);

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 4500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Clean up polling interval when modal unmounts or closes
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleStartGeneration = async () => {
    if (!prompt.trim() || isGenerating) return;

    setErrorMessage(null);
    setVideoUrl(null);
    setIsGenerating(true);
    setLoadingStep(0);

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur serveur (${response.status})`);
      }

      const data = await response.json();
      const opName = data.operationName;
      setOperationName(opName);

      // Start polling backend for completion
      startPolling(opName);
    } catch (err: any) {
      console.error('Error starting video generation:', err);
      setIsGenerating(false);
      setErrorMessage(
        err.message || "Erreur lors du démarrage de la génération vidéo Veo 3."
      );
    }
  };

  const startPolling = (opName: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const statusRes = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: opName }),
        });

        if (!statusRes.ok) {
          throw new Error('Échec de vérification du statut vidéo.');
        }

        const statusData = await statusRes.json();

        if (statusData.error) {
          clearInterval(pollIntervalRef.current);
          setIsGenerating(false);
          setErrorMessage(statusData.error.message || 'Erreur lors du traitement vidéo.');
          return;
        }

        if (statusData.done) {
          clearInterval(pollIntervalRef.current);
          downloadFinishedVideo(opName);
        }
      } catch (err: any) {
        console.error('Polling error:', err);
      }
    }, 5000);
  };

  const downloadFinishedVideo = async (opName: string) => {
    try {
      const dlRes = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName: opName }),
      });

      if (!dlRes.ok) {
        throw new Error('Impossible de télécharger la vidéo générée.');
      }

      const blob = await dlRes.blob();
      const objectUrl = URL.createObjectURL(blob);
      setVideoUrl(objectUrl);
      setIsGenerating(false);
    } catch (err: any) {
      console.error('Download error:', err);
      setIsGenerating(false);
      setErrorMessage(err.message || 'Erreur lors du chargement de la vidéo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-orange-950 text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-md">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight">
                  Studio Vidéo Veo 3 · IVOIRETONTINE
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">
                  veo-3.1-fast-generate-preview
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Génération de spots promotionnels cinématiques par IA à partir de vos descriptions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Prompt input and aspect ratio */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                Description de la vidéo (Prompt) :
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
                rows={3}
                placeholder="Décrivez précisément la scène, le lieu en Côte d'Ivoire, les personnages et l'action..."
                className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-neutral-50/50 resize-none"
              />
            </div>

            {/* Prompt suggestions */}
            <div>
              <span className="text-[11px] font-semibold text-neutral-500 block mb-1.5">
                Idées de spots publicitaires pour tontine :
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(p)}
                    disabled={isGenerating}
                    className="text-left p-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-orange-50/70 hover:border-orange-200 text-neutral-700 text-[11px] transition-all line-clamp-2"
                  >
                    "{p}"
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio selector */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-neutral-150">
              <div>
                <span className="text-xs font-bold text-neutral-800 block">
                  Format d'affichage (Aspect Ratio) :
                </span>
                <span className="text-[11px] text-neutral-500">
                  Paysage pour web/TV ou Portrait pour WhatsApp Status & TikTok
                </span>
              </div>

              <div className="inline-flex rounded-xl p-1 bg-neutral-100 border border-neutral-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setAspectRatio('16:9')}
                  disabled={isGenerating}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    aspectRatio === '16:9'
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>16:9 Paysage (Web / YouTube)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio('9:16')}
                  disabled={isGenerating}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    aspectRatio === '9:16'
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>9:16 Portrait (WhatsApp / TikTok)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div>
            <button
              onClick={handleStartGeneration}
              disabled={!prompt.trim() || isGenerating}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>
                {isGenerating ? 'Génération Veo 3 en cours...' : 'Générer la Vidéo avec Veo 3'}
              </span>
            </button>
          </div>

          {/* Loading Animation & Messages */}
          {isGenerating && (
            <div className="bg-neutral-900 text-white rounded-2xl p-6 text-center space-y-4 border border-neutral-800 animate-in fade-in">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                <Film className="w-7 h-7 text-orange-400 absolute inset-0 m-auto" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-neutral-100">
                  Création de votre vidéo par Veo 3
                </h4>
                <p className="text-xs text-orange-300 font-mono mt-1">
                  {LOADING_MESSAGES[loadingStep]}
                </p>
                <p className="text-[11px] text-neutral-400 mt-2 max-w-md mx-auto">
                  La génération vidéo par diffusion neurale prend habituellement de 1 à 3 minutes. Vous pouvez laisser cette fenêtre ouverte pendant le rendu.
                </p>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-1.5 pt-2">
                {LOADING_MESSAGES.map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === loadingStep ? 'bg-orange-500 scale-125' : 'bg-neutral-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-xs">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold">Information de génération</div>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Video Player Display */}
          {videoUrl && (
            <div className="bg-neutral-950 rounded-2xl p-4 sm:p-5 border border-neutral-800 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between text-white border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold">Vidéo générée avec succès</span>
                  <span className="text-[10px] text-neutral-400">· Format {aspectRatio}</span>
                </div>

                <a
                  href={videoUrl}
                  download="ivoiretontine-spot.mp4"
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger MP4</span>
                </a>
              </div>

              <div
                className={`mx-auto overflow-hidden rounded-xl bg-black flex items-center justify-center ${
                  aspectRatio === '9:16' ? 'max-w-[280px] aspect-[9/16]' : 'w-full aspect-[16/9]'
                }`}
              >
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-neutral-400 pt-2 border-t border-neutral-800">
                <span>Résolution 720p · Optimisée pour réseaux sociaux</span>
                <button
                  type="button"
                  onClick={() => setVideoUrl(null)}
                  className="text-orange-400 hover:text-orange-300 font-semibold"
                >
                  Générer une autre vidéo &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
