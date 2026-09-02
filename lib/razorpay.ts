import crypto from "crypto";

export interface CreateOrderParams {
  amount: number; // in paise
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
  transfers?: Array<{
    account: string;
    amount: number;
    currency: string;
    on_hold?: number; // 1 = hold until delivery authorization
    notes?: Record<string, string>;
  }>;
}

export interface AuthorizeTransferParams {
  paymentId: string;
  transfers: Array<{
    account: string;
    amount: number; // in paise
    currency: string;
    notes?: Record<string, string>;
  }>;
}

export class RazorpayClient {
  private keyId: string;
  private keySecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "placeholder-razorpay-secret";
  }

  async createOrder(params: CreateOrderParams) {
    if (this.keyId === "rzp_test_placeholder" || !process.env.RAZORPAY_KEY_SECRET) {
      // Mock order generation for compilation & testing safety
      return {
        id: `order_mock_${Math.random().toString(36).substring(2, 12)}`,
        entity: "order",
        amount: params.amount,
        amount_paid: 0,
        amount_due: params.amount,
        currency: params.currency || "INR",
        receipt: params.receipt || `rcpt_${Date.now()}`,
        status: "created",
        attempts: 0,
        notes: params.notes || {},
        created_at: Math.floor(Date.now() / 1000),
      };
    }

    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: params.amount,
        currency: params.currency || "INR",
        receipt: params.receipt,
        notes: params.notes,
        transfers: params.transfers,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Razorpay API error: ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Authorize and dispatch seller payable split to linked account via Route.
   * Razorpay handles the actual banking settlement based on the linked account configuration.
   */
  async authorizeRouteTransfer(params: AuthorizeTransferParams) {
    if (this.keyId === "rzp_test_placeholder" || !process.env.RAZORPAY_KEY_SECRET) {
      return {
        id: `trf_mock_${Math.random().toString(36).substring(2, 12)}`,
        entity: "transfer",
        status: "processed",
        payment_id: params.paymentId,
        items: params.transfers,
      };
    }

    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");
    const response = await fetch(`https://api.razorpay.com/v1/payments/${params.paymentId}/transfers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        transfers: params.transfers,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Razorpay Route Transfer error: ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Process refund to buyer for cancelled orders or approved dispute returns.
   */
  async createRefund(params: {
    paymentId: string;
    amount?: number; // in paise (optional, full refund if omitted)
    notes?: Record<string, string>;
  }) {
    if (this.keyId === "rzp_test_placeholder" || !process.env.RAZORPAY_KEY_SECRET) {
      return {
        id: `rfnd_mock_${Math.random().toString(36).substring(2, 12)}`,
        entity: "refund",
        amount: params.amount || 10000,
        currency: "INR",
        payment_id: params.paymentId,
        status: "processed",
        notes: params.notes || {},
        created_at: Math.floor(Date.now() / 1000),
      };
    }

    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");
    const response = await fetch(`https://api.razorpay.com/v1/payments/${params.paymentId}/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: params.amount,
        notes: params.notes,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Razorpay Refund error: ${errorText}`);
    }

    return await response.json();
  }

  verifyPaymentSignature(params: {
    order_id: string;
    payment_id: string;
    signature: string;
  }): boolean {
    const generatedSignature = crypto
      .createHmac("sha256", this.keySecret)
      .update(`${params.order_id}|${params.payment_id}`)
      .digest("hex");
    return generatedSignature === params.signature;
  }
}

export const razorpay = new RazorpayClient();
