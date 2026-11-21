import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

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
    const { prompt, model, systemInstruction, thinkingLevel } = req.body;

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

    const ALLOWED_MODELS = new Set([
      'gemini-4-hydrogen',
      'gemini-3.1-flash-lite',
    ]);

    const primaryModel =
      typeof model === 'string' && ALLOWED_MODELS.has(model)
        ? model
        : 'gemini-4-hydrogen';

    const resolvedThinkingLevel =
      thinkingLevel === 'HIGH'
        ? ThinkingLevel.HIGH
        : thinkingLevel === 'MEDIUM'
          ? ThinkingLevel.MEDIUM
          : ThinkingLevel.LOW;

    const candidateModels =
      primaryModel === 'gemini-4-hydrogen'
        ? ['gemini-4-hydrogen', 'gemini-3.1-flash-lite']
        : ['gemini-3.1-flash-lite', 'gemini-4-hydrogen'];

    const isTransientOverload = (err: unknown): boolean => {
      const msg = String((err as { message?: string })?.message || err || '');
      const status = (err as { status?: number })?.status;
      return (
        status === 503 ||
        msg.includes('503') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('high demand')
      );
    };

    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    let lastError: unknown = null;
    let outputText = '';
    let usedModel = candidateModels[0];

    for (const curModel of candidateModels) {
      let attempt = 0;
      const maxAttempts = 2;

      while (attempt < maxAttempts) {
        attempt += 1;
        try {
          const config: Record<string, unknown> = {};
          if (systemInstruction) {
            config.systemInstruction = systemInstruction;
          }
          if (curModel === 'gemini-4-hydrogen') {
            config.thinkingConfig = {
              thinkingLevel: resolvedThinkingLevel,
            };
          }

          const response = await ai.models.generateContent({
            model: curModel,
            contents: prompt,
            config: Object.keys(config).length > 0 ? config : undefined,
          });

          outputText = response.text ?? '';
          usedModel = curModel;
          lastError = null;
          break;
        } catch (err: unknown) {
          lastError = err;
          if (attempt < maxAttempts && isTransientOverload(err)) {
            await sleep(800);
            continue;
          }
          console.warn(
            `[Gemini API] Failed with model ${curModel}:`,
            (err as { message?: string })?.message || err
          );
          break;
        }
      }

      if (!lastError && outputText) {
        break;
      }
    }

    if (lastError && !outputText) {
      const errObj = lastError as { message?: string; status?: number };
      let cleanMessage = errObj?.message || 'Gemini generation failed.';
      let httpStatus = typeof errObj?.status === 'number' ? errObj.status : 500;

      try {
        const parsed = JSON.parse(cleanMessage);
        if (parsed?.error?.message) {
          cleanMessage = parsed.error.message;
        }
        if (typeof parsed?.error?.code === 'number') {
          httpStatus = parsed.error.code;
        }
      } catch {
        // Error message is plain text, not JSON
      }

      if (
        httpStatus === 429 ||
        cleanMessage.includes('RESOURCE_EXHAUSTED') ||
        cleanMessage.toLowerCase().includes('quota')
      ) {
        httpStatus = 429;
        cleanMessage =
          'Gemini API quota limit reached. Please wait a moment and try again, or verify your attached API key in Settings > Secrets.';
      } else if (
        httpStatus === 401 ||
        httpStatus === 403 ||
        cleanMessage.includes('API_KEY_INVALID') ||
        cleanMessage.includes('PERMISSION_DENIED')
      ) {
        httpStatus = 403;
        cleanMessage =
          'Gemini API authentication failed. Please check your GEMINI_API_KEY in Settings > Secrets.';
      } else if (httpStatus === 503 || cleanMessage.includes('UNAVAILABLE')) {
        httpStatus = 503;
        cleanMessage =
          'Gemini models are temporarily experiencing high demand. Please retry in a few seconds.';
      } else if (httpStatus < 400 || httpStatus > 599) {
        httpStatus = 500;
      }

      res.status(httpStatus).json({
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
  } catch (error: unknown) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      success: false,
      error:
        (error as { message?: string })?.message ||
        'Failed to generate response from Gemini API',
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
