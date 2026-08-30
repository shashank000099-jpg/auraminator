import { create } from "zustand";
import { Product, ProductVariant } from "@/lib/types";

export interface CartItemState {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

interface CartStore {
  items: CartItemState[];
  isOpen: boolean;
  reservationExpiry: number | null; // timestamp
  anonymousSessionId: string;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  setReservationExpiry: (timestamp: number | null) => void;
  getTotalCount: () => number;
  getTotalAmount: () => number;
}

function getStoredSessionId(): string {
  if (typeof window === "undefined") return "anon_sess_init";
  let sid = localStorage.getItem("aura_anon_sid");
  if (!sid) {
    sid = `sess_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    localStorage.setItem("aura_anon_sid", sid);
  }
  return sid;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  reservationExpiry: null,
  anonymousSessionId: typeof window !== "undefined" ? getStoredSessionId() : "anon_sess_init",

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  addItem: (product, variant, quantity = 1) => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (item) => item.product.id === product.id && item.variant?.id === variant?.id
      );

      let newItems = [...state.items];
      if (existingIndex > -1) {
        newItems[existingIndex].quantity += quantity;
      } else {
        newItems.push({ product, variant, quantity });
      }

      // Start 15-minute reservation timer if not active
      const newExpiry = state.reservationExpiry || Date.now() + 15 * 60 * 1000;

      return {
        items: newItems,
        isOpen: true,
        reservationExpiry: newExpiry,
      };
    });
  },

  removeItem: (productId, variantId) => {
    set((state) => {
      const newItems = state.items.filter(
        (item) => !(item.product.id === productId && item.variant?.id === variantId)
      );
      return {
        items: newItems,
        reservationExpiry: newItems.length === 0 ? null : state.reservationExpiry,
      };
    });
  },

  updateQuantity: (productId, quantity, variantId) => {
    set((state) => {
      if (quantity <= 0) {
        const newItems = state.items.filter(
          (item) => !(item.product.id === productId && item.variant?.id === variantId)
        );
        return {
          items: newItems,
          reservationExpiry: newItems.length === 0 ? null : state.reservationExpiry,
        };
      }

      const newItems = state.items.map((item) => {
        if (item.product.id === productId && item.variant?.id === variantId) {
          return { ...item, quantity };
        }
        return item;
      });

      return { items: newItems };
    });
  },

  clearCart: () => set({ items: [], reservationExpiry: null }),
  setReservationExpiry: (timestamp) => set({ reservationExpiry: timestamp }),

  getTotalCount: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalAmount: () => {
    return get().items.reduce((total, item) => {
      const price = item.variant ? item.variant.price : item.product.base_price;
      return total + price * item.quantity;
    }, 0);
  },
}));
