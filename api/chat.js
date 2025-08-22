export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    const body = req.body;
    return res.status(200).json({
      reply: "Ahoj, funguje to! Dostali jsme: " + body.messages[0].content
    });
  }

  res.status(405).json({ error: "Method not allowed" });
}
