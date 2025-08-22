// api/chat.js  (CJS verze – funguje spolehlivě na Vercelu)

module.exports = async function handler(req, res) {
  // --- CORS ---
  const origin = req.headers.origin || "";
  const allowed = [
    "https://petrboss.github.io",   // tvoje GitHub Pages
    "http://localhost:3000"         // pro lokální testy (klidně odstraň, až nebudeš chtít)
  ];

  if (allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  // aby CDN správně variovala podle Origin
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight – prohlížeč si "ťukne" OPTIONS ještě před POSTem
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // --- TĚLO ŽÁDOSTI ---
  try {
    // Vercel u serverless funkcí parses body automaticky když je JSON (pokud ne, tak je to string)
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const userMsg = body?.messages?.[0]?.content || "Ahoj";

    // --- ZATÍM JEN TEST ODPOVĚĎ (bez AI) ---
    return res.status(200).json({
      reply: `Test OK ✅ – dostal jsem: "${userMsg}"`
    });
  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: String(e) });
  }
};
