// api/chat.js
import OpenAI from "openai";

// Domeny, ze kterych povolime volani API (pridej si dalsi, kdyz bude treba)
const ALLOWED_ORIGINS = [
  "https://petrboss.github.io",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

function setCorsHeaders(res, origin) {
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    // defaultne povol jen produkcni GitHub Pages
    res.setHeader("Access-Control-Allow-Origin", "https://petrboss.github.io");
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  setCorsHeaders(res, origin);

  // CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Missing messages[]" });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Fallback, kdyz chybi klic - backend jede, ale neni nastaveny OPENAI_API_KEY
    if (!apiKey) {
      const reply =
        "Backend běží ✅, ale chybí OPENAI_API_KEY. Přidej ho ve Vercel → Settings → Environment Variables a potom redeploy.";
      return res.status(200).json({ reply, _dummy: true });
    }

    const openai = new OpenAI({ apiKey });

    // levný a rychlý model
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages, // [{role:'user', content:'...'}]
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || "";
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("API /api/chat error:", err);
    return res.status(500).json({ error: "Upstream error" });
  }
}

// (volitelné) necháme default bodyParser zapnutý, Vercel JSON už parsuje
export const config = {
  api: {
    bodyParser: true,
  },
};
