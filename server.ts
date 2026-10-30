import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Enable larger body limit for audio blobs and video prompts
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Shared Gemini Client with recommended User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// -------------------------------------------------------------
// 1. Multi-turn Chat API with Search & Maps Grounding
// -------------------------------------------------------------
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model, taskType, grounding, role } = req.body;

    // Grounding mode selection: search, maps, or none
    // As per specifications: use gemini-3.8-flash for Google Search & Google Maps grounding
    let selectedModel = 'gemini-3.8-flash';
    let tools: any[] | undefined = undefined;

    if (grounding === 'search') {
      selectedModel = 'gemini-3.8-flash';
      tools = [{ googleSearch: {} }];
    } else if (grounding === 'maps') {
      selectedModel = 'gemini-3.8-flash';
      tools = [{ googleMaps: {} }];
    } else {
      // Standard model selection based on user requirements:
      // gemini-4-argon for complex tasks, gemini-3.8-flash for general, gemini-3.1-flash-lite for fast tasks
      if (model === 'gemini-3.1-flash-lite' || taskType === 'fast') {
        selectedModel = 'gemini-3.1-flash-lite';
      } else if (model === 'gemini-4-argon' || taskType === 'complex') {
        selectedModel = 'gemini-4-argon';
      } else if (model) {
        selectedModel = model;
      }
    }

    let roleInstruction = '';
    if (role === 'juridique') {
      roleInstruction = `Vous intervenez en tant qu'Expert Juridique et Réglementaire spécialisé en droit bancaire UEMOA et directives BCEAO sur l'intermédiation financière, les tontines rotatives et le Mobile Money en Côte d'Ivoire.`;
    } else if (role === 'calculateur') {
      roleInstruction = `Vous êtes le Simulateur Financier Haute Précision d'IVOIRETONTINE. Vous fournissez des tableaux d'échéances et de cagnottes clairs, avec calcul exact de la commission de 4% déduite et des 1 000 FCFA de frais d'ouverture.`;
    } else {
      roleInstruction = `Vous êtes « IVOIRE-CONSEIL », le conseiller virtuel d'IVOIRETONTINE, plateforme leader de numérisation et sécurisation des tontines en Côte d'Ivoire et Afrique de l'Ouest.`;
    }

    const systemInstruction = `${roleInstruction}

Règles de fonctionnement d'IVOIRETONTINE à respecter scrupuleusement :
1. Frais de création forfaitaires de 1 000 FCFA par tontine créée (couvrent l'audit et l'ouverture du registre).
2. Commission de récupération de 4% prélevée sur le montant brut de la cagnotte lors du déblocage au bénéficiaire (ex: cagnotte brute 100 000 FCFA -> 4 000 FCFA de commission plateforme, 96 000 FCFA versés nets au membre).
3. Intégration Mobile Money sécurisée (Wave, Orange Money, MTN MoMo, Moov Money).
4. Accès Super Administrateur & Trésorerie pour le retrait des revenus de la société vers Wave Business ou virement bancaire UEMOA.
5. Rappels automatiques envoyés le jour de la cotisation par SMS et WhatsApp.
6. Toutes les simulations sont exprimées en Francs CFA (FCFA / XOF).
7. Si l'outil Google Search ou Google Maps est activé, fournissez des informations vérifiées, actuelles et géolocalisées en Côte d'Ivoire (Abidjan, Bouaké, San Pedro, etc.).`;

    // Format multi-turn conversation
    const contents = (messages || []).map((m: any) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content || m.text || '' }],
    }));

    if (contents.length === 0) {
      return res.status(400).json({ error: 'Historique de conversation requis.' });
    }

    const config: any = {
      systemInstruction,
      temperature: 0.7,
    };

    if (tools && tools.length > 0) {
      config.tools = tools;
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config,
    });

    const replyText =
      response.text || 'Je suis à votre disposition pour vous aider dans la gestion de votre tontine.';

    // Extract grounding citations & web chunks if available
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    return res.json({
      reply: replyText,
      model: selectedModel,
      grounding: grounding || 'none',
      groundingMetadata: groundingMetadata || null,
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      error:
        error.message ||
        'Une erreur est survenue lors de la communication avec le conseiller Gemini.',
    });
  }
});

// -------------------------------------------------------------
// 2. Audio Transcription API (gemini-3.5-transcribe)
// -------------------------------------------------------------
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioData, mimeType } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: 'Données audio manquantes.' });
    }

    // Clean base64 string if data URL prefix was included
    const cleanedBase64 = audioData.includes(',') ? audioData.split(',')[1] : audioData;

    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: cleanedBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          {
            text: `Transcris fidèlement et intégralement cet enregistrement audio en langue française ou avec termes ivoiriens usuels (tontine, wave, djamo, orange money, FCFA). Corrige légèrement les hésitations pour une clarté optimale.`,
          },
        ],
      },
    });

    const transcription = response.text?.trim() || '';
    return res.json({ transcription, model: 'gemini-3.5-transcribe' });
  } catch (error: any) {
    console.error('Error in /api/transcribe:', error);
    return res.status(500).json({
      error: error.message || "Erreur lors de la transcription audio avec gemini-3.5-transcribe.",
    });
  }
});

// -------------------------------------------------------------
// 3. Veo 3 Video Generation API (veo-3.1-fast-generate-preview)
// -------------------------------------------------------------
app.post('/api/generate-video', async (req, res) => {
  try {
    const { prompt, aspectRatio } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Le prompt textuel est requis pour générer la vidéo.' });
    }

    const selectedRatio = aspectRatio === '9:16' ? '9:16' : '16:9';

    // Model per user requirement: veo-3.1-fast-generate-preview with fallback to veo-3.1-lite-generate-preview
    const modelToUse = 'veo-3.1-fast-generate-preview';

    let operation;
    try {
      operation = await ai.models.generateVideos({
        model: modelToUse,
        prompt: `Cinematic promotional video for IVOIRETONTINE Côte d'Ivoire: ${prompt}`,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: selectedRatio,
        },
      });
    } catch (veoFastErr: any) {
      console.warn('veo-3.1-fast-generate-preview not available, falling back to veo-3.1-lite-generate-preview:', veoFastErr?.message);
      operation = await ai.models.generateVideos({
        model: 'veo-3.1-lite-generate-preview',
        prompt: `Cinematic promotional video for IVOIRETONTINE Côte d'Ivoire: ${prompt}`,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: selectedRatio,
        },
      });
    }

    return res.json({ operationName: operation.name });
  } catch (error: any) {
    console.error('Error in /api/generate-video:', error);
    return res.status(500).json({
      error: error.message || 'Erreur lors du démarrage de la génération vidéo Veo.',
    });
  }
});

app.post('/api/video-status', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: "Nom d'opération requis." });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });

    return res.json({
      done: Boolean(updated.done),
      error: updated.error || null,
    });
  } catch (error: any) {
    console.error('Error in /api/video-status:', error);
    return res.status(500).json({
      error: error.message || 'Erreur lors de la vérification du statut vidéo.',
    });
  }
});

app.post('/api/video-download', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: "Nom d'opération requis." });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });

    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(404).json({ error: 'Vidéo introuvable ou non prête.' });
    }

    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey },
    });

    if (!videoRes.ok) {
      throw new Error(`Échec de récupération de la vidéo : ${videoRes.statusText}`);
    }

    res.setHeader('Content-Type', 'video/mp4');
    if (videoRes.body) {
      const reader = videoRes.body.getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      };
      await pump();
    } else {
      res.end();
    }
  } catch (error: any) {
    console.error('Error in /api/video-download:', error);
    return res.status(500).json({
      error: error.message || 'Erreur lors du téléchargement de la vidéo.',
    });
  }
});

// Vite middleware in development or static in production
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true, port: PORT, host: '0.0.0.0' },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`IVOIRETONTINE server active on http://0.0.0.0:${PORT}`);
});
