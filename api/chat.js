// Vercel Serverless Function: /api/chat
// CORS je povolen jen pro tvůj frontend na GitHub Pages.
const ALLOWED_ORIGIN = 'https://petrboss.github.io';

module.exports = async (req, res) => {
  // CORS hlavičky (předflight i vlastní request)
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight (OPTIONS) – ukončíme 200
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Jen POST je povolen
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // API klíč musí být ve Vercelu v Settings → Environment Variables jako OPENAI_API_KEY
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('Missing OPENAI_API_KEY in environment!');
    return res.status(500).json({ error: 'Server not configured (missing OPENAI_API_KEY).' });
  }

  // Načtení těla
  let body = req.body;
  if (!body || typeof body === 'string') {
    try {
      body = JSON.parse(body || '{}');
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body.' });
    }
  }

  const messages = Array.isArray(body?.messages) ? body.messages : null;
  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: 'Body must contain { messages: [...] }' });
  }

  try {
    // Volání OpenAI Chat Completions (nepotřebujeme SDK, stačí fetch)
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',        // rychlý & levný model; případně změň dle potřeby
        messages,                    // [{role:'user'|'system'|'assistant', content:'...'}]
        temperature: 0.7,
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      console.error('OpenAI error:', r.status, text);
      return res.status(500).json({ error: 'OpenAI request failed', details: text.slice(0, 2000) });
    }

    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || '';

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
