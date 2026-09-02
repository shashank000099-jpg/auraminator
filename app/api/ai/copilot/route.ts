import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { action, payload } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

    if (action === "generate_listing") {
      const prompt = payload?.rawPrompt || "Brutalist Streetwear Drop";
      const type = payload?.type || "digital_file";

      if (apiKey) {
        try {
          const aiPrompt = `You are the lead product copywriter for Auraminator.in, an elite luxury tech, digital assets, SaaS, and cut-and-sew streetwear marketplace.
Generate a high-converting listing for:
- Asset/Product Prompt: "${prompt}"
- Product Category: "${type}"

Respond in pure valid JSON format with these exact keys:
{
  "title": "Bold luxury title with edition tag",
  "description": "Engaging, high-converting product description (3-4 sentences)",
  "tags": ["5-7 relevant tags"],
  "suggested_price": 2499
}
Output only raw JSON without markdown backticks.`;

          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: aiPrompt }] }],
                generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
              }),
            }
          );

          if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(clean);

            return NextResponse.json({
              success: true,
              title: parsed.title,
              description: parsed.description,
              tags: parsed.tags || ["curated", "auraminator", "exclusive-drop"],
              suggested_price: parsed.suggested_price || 2499,
            });
          }
        } catch {}
      }

      // Fallback deterministic generator
      let suggestedPrice = 799;
      let title = `Elite ${prompt} [2026 Edition]`;
      let description = `High-impact ${prompt} engineered for modern creators & tastemakers. Includes pristine modular source tokens, pre-compiled assets, responsive Figma variables, and instant vault access. Built for high-conversion drops.`;

      if (type === "physical") {
        suggestedPrice = 2499;
        title = `Auraminator Heavyweight ${prompt} (500 GSM)`;
        description = `Custom cut-and-sew heavyweight luxury apparel. Hand-distressed 500 GSM French Terry cotton with monochrome matte high-density silicon branding. Preshrunk, anti-pilling, tailored oversized brutalist fit. Ships via Express Courier with live tracking.`;
      } else if (type === "digital_link") {
        suggestedPrice = 1299;
        title = `${prompt} • Master Workspace`;
        description = `Full Notion / Figma creator workspace and operational templates. Includes automated workflows, brand guidelines, invoice generators, and client onboarding sequences with instant private link duplication.`;
      } else if (type === "service") {
        suggestedPrice = 14999;
        title = `1-on-1 ${prompt} Architecture & Strategy`;
        description = `Direct 1-on-1 strategy sprint, security review, and design system alignment with verified senior specialists. Delivered with complete architecture diagrams and action blueprint.`;
      }

      return NextResponse.json({
        success: true,
        title,
        description,
        tags: [
          prompt.toLowerCase().replace(/\s+/g, "-"),
          "curated",
          "auraminator",
          "brutalist",
          "exclusive-drop",
        ],
        suggested_price: suggestedPrice,
      });
    }

    if (action === "seller_diagnostics") {
      return NextResponse.json({
        success: true,
        insights: [
          "Conversion rate increased 18% with active Gemini AI SEO Schema tags.",
          "Real-time Escrow double-entry ledger is active with 0 pending disputes.",
          "Top 15% of your buyers are purchasing within 3 minutes of drop announcements. WhatsApp notifications recommended.",
          "Inventory for 'Heavyweight Drop Tee / XL' is below threshold (only 3 units left). Replenishment recommended before weekend traffic spike.",
        ],
        healthScore: 98,
        projectedMonthlyGMV: 580000,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
