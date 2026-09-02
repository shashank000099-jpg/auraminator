export interface ShiprocketOrderPayload {
  order_id: string;
  order_date: string;
  pickup_location?: string;
  billing_customer_name: string;
  billing_last_name?: string;
  billing_address: string;
  billing_address_2?: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email?: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  order_items: Array<{
    name: string;
    sku: string;
    units: number;
    selling_price: number;
  }>;
  payment_method: "Prepaid" | "COD";
  sub_total: number;
  length?: number;
  breadth?: number;
  height?: number;
  weight?: number;
}

export class ShiprocketClient {
  private token: string | null = null;
  private email: string;
  private password: string;

  constructor() {
    this.email = process.env.SHIPROCKET_EMAIL || "fulfillment@auraminator.in";
    this.password = process.env.SHIPROCKET_PASSWORD || "placeholder-password";
  }

  private async authenticate(): Promise<string> {
    if (this.token) return this.token;
    if (this.password === "placeholder-password" || !process.env.SHIPROCKET_PASSWORD) {
      this.token = "mock_shiprocket_jwt_token";
      return this.token;
    }

    try {
      const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: this.email, password: this.password }),
      });
      const data = await res.json();
      this.token = data.token;
      return this.token || "mock_shiprocket_jwt_token";
    } catch {
      return "mock_shiprocket_jwt_token";
    }
  }

  /**
   * DYNAMIC PIN-TO-PIN SHIPPING RATE ESTIMATOR
   * Calculates dynamic rate from Seller Warehouse PIN ➔ Customer Delivery PIN + Weight
   */
  async checkServiceabilityAndRate(params: {
    pickupPincode: string;
    deliveryPincode: string;
    weightInKg?: number;
    cod?: boolean;
  }) {
    const token = await this.authenticate();
    const { pickupPincode, deliveryPincode, weightInKg = 0.85, cod = false } = params;

    // Smart Rule-Based Fallback if in Simulation Mode
    if (token === "mock_shiprocket_jwt_token") {
      const cleanPickup = (pickupPincode || "110020").trim();
      const cleanDest = (deliveryPincode || "560038").trim();

      const isLocal = cleanPickup.slice(0, 2) === cleanDest.slice(0, 2);
      const isRegional = cleanPickup.slice(0, 1) === cleanDest.slice(0, 1);

      let estimatedRate = 149;
      let courierName = "Delhivery Surface Express";
      let estimatedDays = 3;

      if (isLocal) {
        estimatedRate = 69;
        courierName = "Delhivery Local Express";
        estimatedDays = 1;
      } else if (isRegional) {
        estimatedRate = 99;
        courierName = "BlueDart Regional Express";
        estimatedDays = 2;
      }

      return {
        success: true,
        rate: estimatedRate,
        courier_name: courierName,
        etd_days: estimatedDays,
        is_serviceable: true,
      };
    }

    try {
      const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&weight=${weightInKg}&cod=${cod ? 1 : 0}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const availableCouriers = data?.data?.available_courier_companies || [];
      if (availableCouriers.length > 0) {
        const best = availableCouriers.reduce((prev: any, curr: any) =>
          prev.rate < curr.rate ? prev : curr
        );
        return {
          success: true,
          rate: Math.ceil(best.rate),
          courier_name: best.courier_name,
          etd_days: best.estimated_delivery_days || 3,
          is_serviceable: true,
        };
      }

      return {
        success: true,
        rate: 149,
        courier_name: "Delhivery Surface",
        etd_days: 3,
        is_serviceable: true,
      };
    } catch {
      return {
        success: true,
        rate: 149,
        courier_name: "Delhivery Surface",
        etd_days: 3,
        is_serviceable: true,
      };
    }
  }

  async createAdhocOrder(payload: ShiprocketOrderPayload) {
    const token = await this.authenticate();
    if (token === "mock_shiprocket_jwt_token") {
      return {
        order_id: Math.floor(100000 + Math.random() * 900000),
        shipment_id: Math.floor(200000 + Math.random() * 900000),
        status: "NEW",
        status_code: 1,
        awb_code: `SR${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        courier_name: "Delhivery Surface",
      };
    }

    const res = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    return await res.json();
  }

  /**
   * CANCEL ORDER IN SHIPROCKET
   * Cancels pickup booking so courier van is stopped from arriving at seller warehouse.
   */
  async cancelOrder(orderIds: Array<string | number>) {
    const token = await this.authenticate();
    if (token === "mock_shiprocket_jwt_token") {
      return {
        status: 200,
        message: "Order pickup successfully cancelled in Shiprocket.",
      };
    }

    try {
      const res = await fetch("https://apiv2.shiprocket.in/v1/external/orders/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: orderIds }),
      });

      return await res.json();
    } catch (err: any) {
      return { error: err.message };
    }
  }

  /**
   * CANCEL SHIPMENT BY AWB CODES
   */
  async cancelShipmentByAwb(awbs: string[]) {
    const token = await this.authenticate();
    if (token === "mock_shiprocket_jwt_token") {
      return {
        status: 200,
        message: "Shipment AWB cancelled in Shiprocket.",
      };
    }

    try {
      const res = await fetch("https://apiv2.shiprocket.in/v1/external/orders/cancel/shipment/awbs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ awbs }),
      });

      return await res.json();
    } catch (err: any) {
      return { error: err.message };
    }
  }

  async getTrackingDetails(awbOrOrderId: string) {
    const token = await this.authenticate();
    if (token === "mock_shiprocket_jwt_token") {
      return {
        tracking_data: {
          track_status: 1,
          shipment_status: 6,
          shipment_track: [
            {
              id: 1,
              current_status: "In-Transit",
              origin: "Bangalore Hub",
              destination: "Mumbai Hub",
              scans: [
                {
                  date: new Date().toISOString(),
                  activity: "Package sorted at regional distribution facility",
                  location: "Bengaluru Sort Center",
                },
                {
                  date: new Date(Date.now() - 86400000).toISOString(),
                  activity: "Manifest generated and picked up by courier",
                  location: "Merchant Warehouse",
                },
              ],
            },
          ],
        },
      };
    }

    const res = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbOrOrderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await res.json();
  }
}

export const shiprocket = new ShiprocketClient();
