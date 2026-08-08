import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

app.post('/api/ai/suggest-matrix', async (req, res) => {
  try {
    const ai = getGenAI();
    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }
    const { topic, context } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `You are a decision-making framework specialist. Structure a decision matrix for: "${topic}".
Additional context: ${context || 'None provided'}.

Instructions:
- Provide 4 to 7 criteria with suggested weights (1 to 10) and type: "benefit" (higher is better, e.g. Salary, Quality) or "cost" (lower is better, e.g. Price, Risk, Travel Time).
- Provide 2 to 4 realistic options to evaluate.
- Assign baseline scores (1 to 10 scale) for each option against each criterion.

Return JSON adhering strictly to the schema.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Clean descriptive title' },
            description: { type: Type.STRING, description: 'Summary of decision scope' },
            criteria: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  weight: { type: Type.NUMBER },
                  type: { type: Type.STRING, description: 'benefit or cost' },
                },
                required: ['name', 'weight', 'type'],
              },
            },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  scores: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        criterionName: { type: Type.STRING },
                        score: { type: Type.NUMBER },
                      },
                      required: ['criterionName', 'score'],
                    },
                  },
                },
                required: ['name', 'scores'],
              },
            },
          },
          required: ['title', 'criteria', 'options'],
        },
      },
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (err: any) {
    console.error('AI suggest error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate decision matrix structure.' });
  }
});

app.post('/api/ai/analyze-decision', async (req, res) => {
  try {
    const ai = getGenAI();
    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }
    const { matrixData } = req.body;
    if (!matrixData) {
      return res.status(400).json({ error: 'Matrix data is required.' });
    }

    const prompt = `Analyze this decision matrix for "${matrixData.title}":
Criteria & Weights:
${JSON.stringify(matrixData.criteria, null, 2)}

Options & Final Calculated Weighted Scores:
${JSON.stringify(matrixData.calculatedResults, null, 2)}

Provide an executive decision report:
1. Clear statement of the winning option and why it won.
2. Key trade-offs & criteria sensitivity (where weight adjustments could flip results).
3. Risk factors & qualitative caveats.
4. Recommended actionable next steps.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            winner: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyTradeoffs: { type: Type.ARRAY, items: { type: Type.STRING } },
            sensitivityAlerts: { type: Type.ARRAY, items: { type: Type.STRING } },
            risksAndCaveats: { type: Type.ARRAY, items: { type: Type.STRING } },
            nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['winner', 'summary', 'keyTradeoffs', 'risksAndCaveats', 'nextSteps'],
        },
      },
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (err: any) {
    console.error('AI analysis error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate AI executive analysis.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
