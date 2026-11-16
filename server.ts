import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'SK AI Studio API',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// Live Gemini AI Execution Endpoint
app.post('/api/gemini/run-prompt', async (req: Request, res: Response) => {
  try {
    const { prompt, model, systemInstruction } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Prompt text is required and must be a string.',
      });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        success: false,
        error:
          'GEMINI_API_KEY is not configured on the server. Please check the Secrets panel in AI Studio settings.',
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Map legacy model names to current 2026 production models
    let requestedModel = model;
    if (!requestedModel || requestedModel === 'gemini-2.5-flash') {
      requestedModel = 'gemini-3.8-flash';
    } else if (requestedModel === 'gemini-2.5-pro') {
      requestedModel = 'gemini-3.1-pro-preview';
    }

    const candidateModels = Array.from(
      new Set([
        requestedModel,
        'gemini-3.8-flash',
        'gemini-3.1-pro-preview',
        'gemini-2.5-flash',
      ].filter(Boolean))
    ) as string[];

    let lastError: any = null;
    let outputText = '';
    let usedModel = candidateModels[0];

    for (const curModel of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: curModel,
          contents: prompt,
          config: systemInstruction
            ? {
                systemInstruction,
              }
            : undefined,
        });

        outputText = response.text ?? '';
        usedModel = curModel;
        lastError = null;
        break;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini API] Failed with model ${curModel}:`, err?.message || err);
      }
    }

    if (lastError && !outputText) {
      let cleanMessage = lastError?.message || 'Gemini generation failed';
      try {
        const parsed = JSON.parse(cleanMessage);
        if (parsed?.error?.message) {
          cleanMessage = parsed.error.message;
        }
      } catch {
        // Not a JSON string
      }

      res.status(500).json({
        success: false,
        error: cleanMessage,
      });
      return;
    }

    res.json({
      success: true,
      text: outputText,
      model: usedModel,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate response from Gemini API',
    });
  }
});

// Start dev or production server
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SK AI Studio] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[SK AI Studio] Failed to start server:', err);
  process.exit(1);
});
