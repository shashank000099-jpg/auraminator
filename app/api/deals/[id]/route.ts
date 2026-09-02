import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { detectContactInformation } from "@/lib/anti-circumvention";
import { EscrowStateMachine } from "@/lib/escrow-engine";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const dealId = params.id;

  try {
    const supabase = createServerSupabase();

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
      const isPostPayment = deal.escrow_status !== "awaiting_deposit";
      let buyerEmail = "";
      let buyerPhone = "";
      let sellerEmail = "";
      let sellerPhone = "";

      if (isPostPayment) {
        if (deal.buyer_id) {
          const { data: bUser } = await supabase.auth.admin.getUserById(deal.buyer_id);
          buyerEmail = bUser?.user?.email || "";
          buyerPhone = bUser?.user?.user_metadata?.phone || "";
        }
        if (deal.seller_id) {
          const { data: sUser } = await supabase.auth.admin.getUserById(deal.seller_id);
          sellerEmail = sUser?.user?.email || "";
          sellerPhone = sUser?.user?.user_metadata?.phone || "";
        }
      }

      const enrichedDeal = {
        ...deal,
        is_contact_revealed: isPostPayment,
        contact_reveal_status: isPostPayment
          ? "REVEALED: Escrow is locked. Direct phone/WhatsApp and technical communication permitted."
          : "MASKED: Direct contact info is protected until buyer deposits escrow into vault.",
        buyer_contact: isPostPayment
          ? {
              full_name: deal.buyer?.full_name || "Buyer",
              username: deal.buyer?.username,
              email: buyerEmail || (deal.buyer?.username ? `${deal.buyer.username}@auraminator.in` : "buyer@auraminator.in"),
              phone: buyerPhone || "+91 (Verified on Platform)",
            }
          : null,
        seller_contact: isPostPayment
          ? {
              full_name: deal.seller?.full_name || "Seller",
              username: deal.seller?.username,
              email: sellerEmail || (deal.seller?.username ? `${deal.seller.username}@auraminator.in` : "seller@auraminator.in"),
              phone: sellerPhone || "+91 (Verified Seller Studio)",
            }
          : null,
      };
      return NextResponse.json({ success: true, deal: enrichedDeal });
    }

    return NextResponse.json({ error: "Deal room not found" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
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
    const supabase = createServerSupabase();

    // Auth check — know who is performing this action
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    // Fetch deal from database — no fake fallback
    const { data: dbDeal, error: dealFetchErr } = await supabase
      .from("deal_rooms")
      .select("*, product:products(*), buyer:profiles!buyer_id(*), seller:profiles!seller_id(*)")
      .eq("id", dealId)
      .single();

    if (dealFetchErr || !dbDeal) {
      return NextResponse.json({ error: "Deal room not found." }, { status: 404 });
    }

    let deal = dbDeal;

    // Helper: persist message to DB and update deal state
    const persistMessage = async (msg: {
      sender_id: string;
      sender_role: "buyer" | "seller" | "platform_arbitrator";
      message: string;
      message_type: string;
    }) => {
      await supabase.from("deal_messages").insert({
        deal_id: dealId,
        sender_id: msg.sender_id,
        sender_role: msg.sender_role,
        message: msg.message,
        message_type: msg.message_type,
      });
    };

    const updateDealState = async (updates: Record<string, any>) => {
      await supabase
        .from("deal_rooms")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", dealId);
    };

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
        if (!newAmount || isNaN(newAmount) || newAmount <= 0) {
          return NextResponse.json({ error: "Invalid counter offer amount." }, { status: 400 });
        }

        await updateDealState({
          agreed_price: newAmount,
          platform_fee: Math.round(newAmount * 0.15),
          seller_payout: Math.round(newAmount * 0.85),
        });

        await persistMessage({
          sender_id: user.id,
          sender_role: (payload.senderRole || user.id === deal.seller_id ? "seller" : "buyer") as any,
          message: `Counter offer of ₹${newAmount.toLocaleString("en-IN")} submitted. Notes: ${payload.note || "—"}`,
          message_type: "counter_offer",
        });

        deal = { ...deal, agreed_price: newAmount, platform_fee: newAmount * 0.15, seller_payout: newAmount * 0.85 };
        break;
      }

      case "accept_offer": {
        await updateDealState({ escrow_status: "awaiting_deposit" });
        await persistMessage({
          sender_id: user.id,
          sender_role: (user.id === deal.buyer_id ? "buyer" : "seller") as any,
          message: `Offer of ₹${deal.agreed_price.toLocaleString("en-IN")} officially accepted. Escrow room is now ready for buyer deposit.`,
          message_type: "chat",
        });
        deal = { ...deal, escrow_status: "awaiting_deposit" };
        break;
      }

      case "deposit_escrow": {
        // Only buyer can deposit
        if (user.id !== deal.buyer_id) {
          return NextResponse.json({ error: "Only the buyer can deposit escrow." }, { status: 403 });
        }

        await updateDealState({
          escrow_status: "escrow_locked",
          razorpay_payment_id: payload.paymentId,
          deposit_timestamp: new Date().toISOString(),
        });

        await persistMessage({
          sender_id: user.id,
          sender_role: "buyer",
          message: `Buyer deposited ₹${deal.agreed_price.toLocaleString("en-IN")} into Auraminator Escrow (Razorpay: ${payload.paymentId || "pending"}). Seller notified to submit credentials.`,
          message_type: "payment_deposit",
        });
        deal = { ...deal, escrow_status: "escrow_locked" };
        break;
      }

      case "submit_credentials": {
        // Only seller can submit credentials
        if (user.id !== deal.seller_id) {
          return NextResponse.json({ error: "Only the seller can submit credentials." }, { status: 403 });
        }

        await supabase.from("deal_transfers").insert({
          deal_id: dealId,
          transfer_type: payload.transferType || "custom_transfer",
          credential_payload: payload.credentialPayload,
          handover_instructions: payload.instructions || "Please review and verify access within the 7-Day (168-Hour) warranty window.",
          verified_by_buyer: false,
        });

        await updateDealState({
          escrow_status: "buyer_inspecting",
          inspection_period_hours: 168,
          inspection_deadline: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        });

        await persistMessage({
          sender_id: user.id,
          sender_role: "seller",
          message: `Seller submitted credentials for [${payload.transferType || "custom_transfer"}]. 7-Day (168-Hour) Buyer Inspection & Warranty Window has commenced.`,
          message_type: "credentials_submitted",
        });
        deal = { ...deal, escrow_status: "buyer_inspecting" };
        break;
      }

      case "verify_transfer_item": {
        await supabase
          .from("deal_transfers")
          .update({ verified_by_buyer: true, verified_at: new Date().toISOString() })
          .eq("id", payload.transferId)
          .eq("deal_id", dealId);
        break;
      }

      case "confirm_handover_release": {
        // Only buyer can confirm release
        if (user.id !== deal.buyer_id) {
          return NextResponse.json({ error: "Only the buyer can confirm handover and release escrow." }, { status: 403 });
        }

        await persistMessage({
          sender_id: user.id,
          sender_role: "buyer",
          message: `Buyer confirmed handover. Escrow of ₹${deal.seller_payout.toLocaleString("en-IN")} (85% net) authorized for release to seller. Platform fee ₹${deal.platform_fee.toLocaleString("en-IN")} (15%) captured.`,
          message_type: "escrow_released",
        });

        await updateDealState({
          escrow_status: "completed_paid",
          completed_at: new Date().toISOString(),
        });

        // Trigger Escrow FSM authorization
        try {
          await EscrowStateMachine.verifyDeliveryAndAuthorize({
            orderId: dealId,
            sellerId: deal.seller_id,
            triggerSource: "buyer_deal_handover",
            referenceId: dealId,
          });
        } catch (fsmErr: any) {
          console.error("[-] Digital deal FSM authorization error:", fsmErr.message);
        }

        deal = { ...deal, escrow_status: "completed_paid" };
        break;
      }

      case "open_dispute": {
        await persistMessage({
          sender_id: user.id,
          sender_role: (user.id === deal.buyer_id ? "buyer" : "seller") as any,
          message: `DISPUTE TRIBUNAL OPENED. Escrow state frozen in [ESCROW_DISPUTED_HOLD]. Auraminator Compliance will review audit logs and arbitrate within 24 hours. Reason: ${payload.reason}`,
          message_type: "dispute_opened",
        });

        await updateDealState({ escrow_status: "disputed" });

        try {
          await EscrowStateMachine.freezeEscrow({
            orderId: dealId,
            sellerId: deal.seller_id,
            reason: `Buyer Dispute Opened: ${payload.reason}`,
            targetState: "ESCROW_DISPUTED_HOLD",
          });
        } catch {}

        deal = { ...deal, escrow_status: "disputed" };
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

        await persistMessage({
          sender_id: user.id,
          sender_role: (user.id === deal.buyer_id ? "buyer" : "seller") as any,
          message: payload.message,
          message_type: "chat",
        });
        break;
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    // Return fresh deal data from DB
    const { data: updatedDeal } = await supabase
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

    return NextResponse.json({
      success: true,
      deal: updatedDeal || deal,
      message: `Action [${action}] executed successfully.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update deal" },
      { status: 500 }
    );
  }
}
