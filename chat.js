// Vercel Serverless Function: POST /api/chat
export default async function handler(req, res) {
  // CORS – povol jen tvůj web (můžeš přidat i mobilní doménu, až bude)
  const ALLOW_ORIGIN = 'https://petrboss.github.io';
  res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});

  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages)) return res.status(400).json({error:'messages[] required'});

    // volání OpenAI-kompatibilního chat API
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',        // můžeš změnit na jiný kompatibilní model
        temperature: 0.6,
        messages: [
          { role: 'system', content: 'Jsi trenér osobního rozvoje. Odpovídej česky, stručně a věcně.' },
          ...messages
        ]
      })
    });

    if (!r.ok) {
      const t = await r.text();
      return res.status(500).json({error:'Upstream error', detail: t});
    }
    const data = await r.json();
    const text = data.choices?.[0]?.message?.content ?? '';
    return res.status(200).json({ reply: text });
  } catch (e) {
    return res.status(500).json({error: e.message || 'Unknown error'});
  }
}
