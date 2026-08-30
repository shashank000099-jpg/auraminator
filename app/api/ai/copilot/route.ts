import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { action, payload } = await req.json();

    if (action === "generate_listing") {
      const prompt = payload?.rawPrompt || "Brutalist Streetwear Drop";
      const type = payload?.type || "digital_file";

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
          "Conversion rate dropped 4% on mobile views. Consider simplifying description formatting and adding higher contrast media.",
          "High cart drop-off at checkout. Offering a 10% coupon code (e.g. AURA10) could recover ₹8,400 in pending carts.",
          "Top 15% of your buyers are purchasing within 3 minutes of drop announcements. Enable instant WhatsApp notifications for next release.",
          "Inventory for 'Heavyweight Drop Tee / XL' is below threshold (only 3 units left). Replenishment recommended before weekend traffic spike.",
        ],
        healthScore: 94,
        projectedMonthlyGMV: 480000,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
