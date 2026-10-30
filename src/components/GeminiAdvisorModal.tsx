import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User as UserIcon,
  RefreshCw,
  Cpu,
  Trash2,
  HelpCircle,
  Lightbulb,
  Mic,
  MicOff,
  Globe,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Calculator,
  UserCheck,
  AlertCircle,
} from 'lucide-react';

interface GroundingMetadataItem {
  webSearchQueries?: string[];
  searchEntryPoint?: { renderedContent?: string };
  groundingChunks?: Array<{
    web?: { uri?: string; title?: string };
    maps?: { uri?: string; title?: string; address?: string };
  }>;
  groundingSupports?: any[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
  groundingUsed?: 'search' | 'maps' | 'none';
  groundingMetadata?: GroundingMetadataItem | null;
}

const INITIAL_GREETING: ChatMessage = {
  id: 'greet_1',
  role: 'model',
  content: `Bonjour ! Je suis **IVOIRE-CONSEIL**, votre assistant intelligent propulsé par les modèles Gemini.

Je dispose désormais de capacités avancées :
• **Recherche Google en direct (Search Grounding)** : pour les taux BCEAO, l'actualité économique et les réglementations UEMOA à jour.
• **Google Maps Grounding** : pour localiser les kiosques Wave, Orange Money, MTN et agences bancaires partout en Côte d'Ivoire.
• **Transcription vocale (Microphone)** : parlez directement au micro avec le modèle **gemini-3.5-transcribe**.
• **Modèles au choix** : **gemini-3.8-flash** (standard/grounding), **gemini-3.1-flash-lite** (ultra rapide), et **gemini-4-argon** (calculs financiers complexes).

Que souhaitez-vous explorer ou calculer aujourd'hui ?`,
  timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
};

const SUGGESTIONS = [
  'Trouver les points Wave et Orange Money à Cocody et Yopougon',
  'Quelles sont les dernières directives BCEAO sur les tontines ?',
  'Simuler une tontine de 10 personnes à 50 000 FCFA par mois',
  'Comment fonctionne la commission de récupération de 4% ?',
];

interface GeminiAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiAdvisorModal: React.FC<GeminiAdvisorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<
    'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon'
  >('gemini-3.8-flash');
  const [groundingMode, setGroundingMode] = useState<'none' | 'search' | 'maps'>('none');
  const [advisorRole, setAdvisorRole] = useState<'general' | 'juridique' | 'calculateur'>('general');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio Recording & Transcription state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Clean up recording when modal unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  if (!isOpen) return null;

  // -------------------------------------------------------------
  // Audio Transcription with Microphone (gemini-3.5-transcribe)
  // -------------------------------------------------------------
  const handleStartRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("L'accès au microphone n'est pas supporté par ce navigateur.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        await handleTranscribeBlob(audioBlob, recorder.mimeType || 'audio/webm');
      };

      recorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Mic recording error:', err);
      setErrorMessage(err.message || 'Impossible d’accéder au microphone.');
    }
  };

  const handleStopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleTranscribeBlob = async (blob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        const res = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioData: base64Audio,
            mimeType,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Erreur lors de la transcription audio.');
        }

        const data = await res.json();
        if (data.transcription) {
          setInputText((prev) => (prev ? `${prev} ${data.transcription}` : data.transcription));
        }
        setIsTranscribing(false);
      };
    } catch (err: any) {
      console.error('Transcription error:', err);
      setIsTranscribing(false);
      setErrorMessage(err.message || 'Échec de la transcription vocale.');
    }
  };

  // -------------------------------------------------------------
  // Send Chat Message
  // -------------------------------------------------------------
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      // If search or maps grounding is selected, use gemini-3.8-flash as specified
      const modelToSend = groundingMode !== 'none' ? 'gemini-3.8-flash' : selectedModel;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model: modelToSend,
          grounding: groundingMode,
          role: advisorRole,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur serveur (${response.status})`);
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'model',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.model || modelToSend,
        groundingUsed: data.grounding,
        groundingMetadata: data.groundingMetadata,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(
        err.message || "Impossible de contacter l'assistant Gemini. Vérifiez la connexion serveur."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([INITIAL_GREETING]);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-neutral-200 overflow-hidden flex flex-col h-[700px] max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white px-5 py-3.5 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold text-sm shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold tracking-tight">
                  IVOIRE-CONSEIL · Conseiller Intelligent Gemini
                </h3>
                <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-full text-white font-bold">
                  BCEAO Ready
                </span>
              </div>
              <p className="text-[11px] text-orange-100">
                Search Grounding · Google Maps · Transcription Vocale · Simulation Financière
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearHistory}
              title="Effacer la conversation"
              className="p-1.5 text-orange-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Fermer"
              className="p-1.5 text-orange-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration Bar: Model, Role, and Grounding Tools */}
        <div className="bg-neutral-50 border-b border-neutral-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Grounding tools switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              Ancrage :
            </span>
            <button
              type="button"
              onClick={() => {
                setGroundingMode(groundingMode === 'search' ? 'none' : 'search');
                setSelectedModel('gemini-3.8-flash');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 ${
                groundingMode === 'search'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
              title="Active Google Search pour obtenir des informations web récentes (gemini-3.8-flash)"
            >
              <Globe className="w-3 h-3" />
              <span>Google Search</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setGroundingMode(groundingMode === 'maps' ? 'none' : 'maps');
                setSelectedModel('gemini-3.8-flash');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 ${
                groundingMode === 'maps'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
              title="Active Google Maps pour localiser agences Wave, Orange Money, banques en Côte d'Ivoire (gemini-3.8-flash)"
            >
              <MapPin className="w-3 h-3" />
              <span>Google Maps</span>
            </button>
          </div>

          {/* Model Selector Strip */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider hidden sm:inline">
              Modèle :
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedModel('gemini-3.8-flash');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                selectedModel === 'gemini-3.8-flash' && groundingMode === 'none'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : selectedModel === 'gemini-3.8-flash'
                  ? 'bg-neutral-800 text-white'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
              title="gemini-3.8-flash : modèle polyvalent avec grounding"
            >
              gemini-3.8-flash
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedModel('gemini-3.1-flash-lite');
                setGroundingMode('none');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                selectedModel === 'gemini-3.1-flash-lite'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
              title="gemini-3.1-flash-lite : réponses instantanées et calculs simples"
            >
              flash-lite
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedModel('gemini-4-argon');
                setGroundingMode('none');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                selectedModel === 'gemini-4-argon'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
              title="gemini-4-argon : raisonnement financier avancé et cas complexes"
            >
              gemini-4-argon
            </button>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-neutral-50/50">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-neutral-900 text-white rounded-br-xs'
                      : 'bg-white text-neutral-800 border border-neutral-200 rounded-bl-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap space-y-1">{msg.content}</div>

                  {/* Grounding metadata display if present */}
                  {!isUser && msg.groundingMetadata?.groundingChunks && msg.groundingMetadata.groundingChunks.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-neutral-150 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                        {msg.groundingUsed === 'maps' ? (
                          <>
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            <span>Lieux & Agences vérifiés (Google Maps) :</span>
                          </>
                        ) : (
                          <>
                            <Globe className="w-3 h-3 text-blue-600" />
                            <span>Sources web en direct (Google Search) :</span>
                          </>
                        )}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.groundingMetadata.groundingChunks.slice(0, 4).map((chunk, cIdx) => {
                          const item = chunk.web || chunk.maps;
                          if (!item) return null;
                          return (
                            <a
                              key={cIdx}
                              href={item.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                            >
                              <span>{item.title || 'Source'}</span>
                              <ExternalLink className="w-2.5 h-2.5 text-neutral-400" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div
                    className={`flex items-center justify-between gap-3 mt-1.5 pt-1 text-[10px] ${
                      isUser ? 'text-neutral-400' : 'text-neutral-400 border-t border-neutral-100'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    <div className="flex items-center gap-1">
                      {msg.groundingUsed && msg.groundingUsed !== 'none' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {msg.groundingUsed === 'maps' ? 'Maps Grounding' : 'Search Grounding'}
                        </span>
                      )}
                      {msg.modelUsed && (
                        <span className="font-mono text-[9px] bg-neutral-100 text-neutral-600 px-1.5 py-0.2 rounded">
                          {msg.modelUsed}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-neutral-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-neutral-200 rounded-2xl rounded-bl-xs px-4 py-3 text-xs flex items-center gap-2 text-neutral-500 shadow-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-600" />
                <span>
                  {groundingMode === 'search'
                    ? 'Recherche Google en cours...'
                    : groundingMode === 'maps'
                    ? 'Interrogation de Google Maps pour la Côte d’Ivoire...'
                    : 'IVOIRE-CONSEIL analyse votre demande avec Gemini...'}
                </span>
              </div>
            </div>
          )}

          {isTranscribing && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Mic className="w-4 h-4" />
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl rounded-bl-xs px-4 py-3 text-xs flex items-center gap-2 text-indigo-700 shadow-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Transcription audio en cours avec gemini-3.5-transcribe...</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length <= 4 && (
          <div className="px-4 py-2 bg-white border-t border-neutral-150 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
            <span className="text-neutral-400 flex items-center gap-1 shrink-0">
              <Lightbulb className="w-3 h-3 text-amber-500" /> Suggestions :
            </span>
            {SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (sug.includes('Wave et Orange')) {
                    setGroundingMode('maps');
                  } else if (sug.includes('BCEAO')) {
                    setGroundingMode('search');
                  }
                  handleSendMessage(sug);
                }}
                className="px-2.5 py-1 bg-neutral-100 hover:bg-orange-50 hover:text-orange-700 text-neutral-700 rounded-lg whitespace-nowrap transition-colors"
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        {/* Input Form with Audio Microphone Transcription */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3.5 bg-white border-t border-neutral-200 flex items-center gap-2 shrink-0"
        >
          {/* Microphone Recording Button (gemini-3.5-transcribe) */}
          <button
            type="button"
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isLoading || isTranscribing}
            className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-md'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
            title={
              isRecording
                ? `Enregistrement en cours (${recordingDuration}s). Cliquez pour transcrire.`
                : 'Enregistrer votre voix et transcrire avec gemini-3.5-transcribe'
            }
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isRecording && <span className="text-[11px]">{recordingDuration}s</span>}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isRecording
                ? 'Parlez maintenant au micro...'
                : groundingMode === 'maps'
                ? 'Recherchez un kiosque ou une banque en Côte d’Ivoire (Google Maps)...'
                : groundingMode === 'search'
                ? 'Posez une question avec recherche web en temps réel (Google Search)...'
                : 'Posez votre question sur IVOIRETONTINE...'
            }
            disabled={isLoading || isRecording || isTranscribing}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-neutral-50/50"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading || isRecording}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:bg-neutral-300 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>Envoyer</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
