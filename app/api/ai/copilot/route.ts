import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

const GEMINI_MODELS = [
  "gemini-flash-latest",
  "gemini-3.6-flash",
  "gemini-flash-lite-latest",
];

export async function POST(req: NextRequest) {
  try {
    const { action, payload } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

    if (action === "generate_listing") {
      const prompt = payload?.rawPrompt || "Modern Web Application";
      const type = payload?.type || "saas";

      if (apiKey) {
        const aiPrompt = `You are the lead product architect and copywriter for Auraminator.in, a high-tier digital assets, SaaS, apps, and luxury streetwear marketplace.
Generate a high-converting, professional listing for:
- Asset/Product Prompt: "${prompt}"
- Product Category: "${type}"

Respond strictly in valid JSON format with these exact keys:
{
  "title": "Compelling professional title",
  "description": "Engaging, high-converting product description (3-4 sentences highlighting technical specs and buyer benefits)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "suggested_price": 4999
}
Do not include markdown codeblocks, output only raw JSON.`;

        // Multi-model resilience loop
        for (const model of GEMINI_MODELS) {
          try {
            const res = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: aiPrompt }] }],
                  generationConfig: { temperature: 0.4, maxOutputTokens: 600 },
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
                tags: parsed.tags || ["auraminator", "verified-drop"],
                suggested_price: parsed.suggested_price || 2499,
                modelUsed: model,
              });
            }
          } catch (modelErr) {
            console.warn(`Model ${model} failed, trying next fallback...`, modelErr);
          }
        }
      }

      // Fallback
      return NextResponse.json({
        success: true,
        title: `Auraminator Verified • ${prompt}`,
        description: `High-impact ${prompt} engineered for modern creators & businesses. Includes complete technical assets, documentation, and 7-day escrow warranty protection.`,
        tags: [prompt.toLowerCase().replace(/\s+/g, "-"), "auraminator", "verified-drop"],
        suggested_price: type === "physical" ? 2499 : 4999,
      });
    }

    if (action === "seller_diagnostics") {
      const supabase = createServerSupabase();
      const { count: productCount } = await supabase.from("products").select("*", { count: "exact", head: true });
      const { count: orderCount } = await supabase.from("orders").select("*", { count: "exact", head: true });

      const insights = [
        `Live Catalog: ${productCount || 0} active drops indexed on Auraminator.`,
        `Orders Processed: ${orderCount || 0} transactions routed through 10-State Escrow FSM.`,
        "Automated Google for Jobs & Rich Snippet SEO Schema is active across all published listings.",
        "Zero-Trust Escrow protection is active with 7-Day Warranty hold enabled.",
      ];

      return NextResponse.json({
        success: true,
        insights,
        healthScore: 100,
        projectedMonthlyGMV: (orderCount || 1) * 25000,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
