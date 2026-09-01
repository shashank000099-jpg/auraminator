import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { MOCK_DEAL_ROOMS, MOCK_PRODUCTS } from "@/lib/mock-data";
import { detectContactInformation } from "@/lib/anti-circumvention";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const dealId = params.id;

  try {
    const supabase = createServerSupabase();
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const { data: deal, error } = await supabase
        .from("deal_rooms")
        .select(`
          *,
          product:products(*),
          buyer:profiles!buyer_id(*),
          seller:profiles!seller_id(*),
          transfers:deal_transfers(*),
          messages:deal_messages(*, sender:profiles!sender_id(*))
        `)
        .eq("id", dealId)
        .single();

      if (!error && deal) {
        return NextResponse.json({ success: true, deal });
      }
    }

    const mockDeal = MOCK_DEAL_ROOMS.find((d) => d.id === dealId) || MOCK_DEAL_ROOMS[0];
    return NextResponse.json({ success: true, deal: mockDeal });
  } catch (err: any) {
    const mockDeal = MOCK_DEAL_ROOMS.find((d) => d.id === dealId) || MOCK_DEAL_ROOMS[0];
    return NextResponse.json({ success: true, deal: mockDeal });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const dealId = params.id;

  try {
    const body = await request.json();
    const { action, payload } = body;

    let deal = MOCK_DEAL_ROOMS.find((d) => d.id === dealId) || { ...MOCK_DEAL_ROOMS[0], id: dealId };

    switch (action) {
      case "counter_offer": {
        // Pre-payment contact filtering on counter note
        if (deal.escrow_status === "awaiting_deposit" && payload.note) {
          const check = detectContactInformation(payload.note);
          if (check.isBlocked) {
            return NextResponse.json(
              {
                error: check.reason || "Sharing phone numbers, emails, WhatsApp, or direct contact is prohibited before payment.",
                isBlocked: true,
                detectedType: check.detectedType,
              },
              { status: 400 }
            );
          }
        }

        const newAmount = parseFloat(payload.amount);
        const counterMessage = {
          id: `msg-${Date.now()}`,
          deal_id: dealId,
          sender_id: payload.senderId || "seller-004",
          sender_role: (payload.senderRole || "seller") as "buyer" | "seller" | "platform_arbitrator",
          message: `${payload.senderRole === "seller" ? "Seller" : "Buyer"} countered the price to ₹${newAmount.toLocaleString("en-IN")}. Notes: ${payload.note || "No notes provided."}`,
          message_type: "counter_offer" as const,
          created_at: new Date().toISOString(),
        };

        deal = {
          ...deal,
          agreed_price: newAmount,
          platform_fee: newAmount * 0.15,
          seller_payout: newAmount * 0.85,
          messages: [...(deal.messages || []), counterMessage],
        };
        break;
      }

      case "accept_offer": {
        const acceptMessage = {
          id: `msg-${Date.now()}`,
          deal_id: dealId,
          sender_id: payload.senderId || "buyer-001",
          sender_role: (payload.senderRole || "buyer") as "buyer" | "seller" | "platform_arbitrator",
          message: `Offer of ₹${deal.agreed_price.toLocaleString("en-IN")} officially accepted. Escrow room is now ready for buyer deposit.`,
          message_type: "chat" as const,
          created_at: new Date().toISOString(),
        };

        deal = {
          ...deal,
          escrow_status: "awaiting_deposit",
          messages: [...(deal.messages || []), acceptMessage],
        };
        break;
      }

      case "deposit_escrow": {
        const depositMessage = {
          id: `msg-${Date.now()}`,
          deal_id: dealId,
          sender_id: payload.senderId || "buyer-001",
          sender_role: "buyer" as const,
          message: `Buyer successfully deposited ₹${deal.agreed_price.toLocaleString("en-IN")} into Auraminator Escrow (Razorpay Route ID: ${payload.paymentId || "pay_mock_99281"}). Seller is notified to submit transfer credentials.`,
          message_type: "payment_deposit" as const,
          created_at: new Date().toISOString(),
        };

        deal = {
          ...deal,
          escrow_status: "escrow_locked",
          razorpay_payment_id: payload.paymentId || "pay_mock_99281",
          deposit_timestamp: new Date().toISOString(),
          messages: [...(deal.messages || []), depositMessage],
        };
        break;
      }

      case "submit_credentials": {
        const newTransfer = {
          id: `trf-${Date.now()}`,
          deal_id: dealId,
          transfer_type: payload.transferType || "custom_transfer",
          credential_payload: payload.credentialPayload,
          handover_instructions: payload.instructions || "Please review and verify access within 48 hours.",
          verified_by_buyer: false,
          created_at: new Date().toISOString(),
        };

        const submitMessage = {
          id: `msg-${Date.now()}`,
          deal_id: dealId,
          sender_id: payload.senderId || "seller-004",
          sender_role: "seller" as const,
          message: `Seller submitted credentials for [${payload.transferType}]. 48-Hour Buyer Inspection Window has commenced.`,
          message_type: "credentials_submitted" as const,
          created_at: new Date().toISOString(),
        };

        deal = {
          ...deal,
          escrow_status: "buyer_inspecting",
          inspection_deadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
          transfers: [...(deal.transfers || []), newTransfer],
          messages: [...(deal.messages || []), submitMessage],
        };
        break;
      }

      case "verify_transfer_item": {
        deal = {
          ...deal,
          transfers: (deal.transfers || []).map((t) =>
            t.id === payload.transferId
              ? { ...t, verified_by_buyer: true, verified_at: new Date().toISOString() }
              : t
          ),
        };
        break;
      }

      case "confirm_handover_release": {
        const releaseMessage = {
          id: `msg-${Date.now()}`,
          deal_id: dealId,
          sender_id: payload.senderId || "buyer-001",
          sender_role: "buyer" as const,
          message: `Buyer verified all assets and confirmed handover. Auraminator Escrow released ₹${deal.seller_payout.toLocaleString("en-IN")} (85% net payout) to seller's bank account. Platform fee of ₹${deal.platform_fee.toLocaleString("en-IN")} (15%) captured. Deal completed successfully.`,
          message_type: "escrow_released" as const,
          created_at: new Date().toISOString(),
        };

        deal = {
          ...deal,
          escrow_status: "completed_paid",
          completed_at: new Date().toISOString(),
          messages: [...(deal.messages || []), releaseMessage],
        };
        break;
      }

      case "open_dispute": {
        const disputeMessage = {
          id: `msg-${Date.now()}`,
          deal_id: dealId,
          sender_id: payload.senderId || "buyer-001",
          sender_role: (payload.senderRole || "buyer") as "buyer" | "seller" | "platform_arbitrator",
          message: `DISPUTE TRIBUNAL OPENED. Escrow funds frozen. Auraminator Compliance Lead will review credential audit logs and arbitrate within 24 hours. Reason: ${payload.reason}`,
          message_type: "dispute_opened" as const,
          created_at: new Date().toISOString(),
        };

        deal = {
          ...deal,
          escrow_status: "disputed",
          messages: [...(deal.messages || []), disputeMessage],
        };
        break;
      }

      case "send_message": {
        // Pre-payment contact filtering on chat message
        const isPrePayment = deal.escrow_status === "awaiting_deposit";
        if (isPrePayment) {
          const check = detectContactInformation(payload.message);
          if (check.isBlocked) {
            return NextResponse.json(
              {
                error: check.reason || "Sharing contact details (phone, WhatsApp, email, social IDs) is prohibited before escrow payment.",
                isBlocked: true,
                detectedType: check.detectedType,
              },
              { status: 400 }
            );
          }
        }

        const chatMessage = {
          id: `msg-${Date.now()}`,
          deal_id: dealId,
          sender_id: payload.senderId || "buyer-001",
          sender_role: (payload.senderRole || "buyer") as "buyer" | "seller" | "platform_arbitrator",
          message: payload.message,
          message_type: "chat" as const,
          created_at: new Date().toISOString(),
        };

        deal = {
          ...deal,
          messages: [...(deal.messages || []), chatMessage],
        };
        break;
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      deal,
      message: `Action [${action}] executed successfully.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update deal" },
      { status: 500 }
    );
  }
}
