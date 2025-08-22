// /api/chat.js – Vercel Node serverless function
export default async function handler(req, res) {
  // --- CORS (povolíme GitHub Pages) ---
  const ORIGIN = 'https://petrboss.github.io';
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end(); // preflight OK

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // V některých prostředích může být req.body neparsované – ošetříme robustně:
    let body = req.body;
    if (!body) {
      body = await new Promise((resolve, reject) => {
        try {
          let data = '';
          req.on('data', (c) => (data += c));
          req.on('end', () => resolve(data ? JSON.parse(data) : {}));
        } catch (e) {
          reject(e);
        }
      });
    }

    const { messages } = body || {};
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages[] required' });
    }

    // Volání OpenAI
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.6,
        messages: [
          { role: 'system', content: 'Jsi trenér osobního rozvoje. Odpovídej česky, stručně a věcně.' },
          ...messages,
        ],
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      return res.status(500).json({ error: 'Upstream error', detail });
    }

    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content ?? '';
    return res.status(200).json({ reply: text });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Unknown error' });
  }
}
