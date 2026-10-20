import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * A saved card, for display only. Full card numbers and CVCs are never kept
 * on the device; when card payments go live, the payment provider's token
 * is stored here in their place.
 */
export interface SavedCard {
  id: string;
  brand?: string; // e.g. "visa", "mastercard"
  last4: string;
  expiry: string;
  isDefault: boolean;
}

export interface BusinessAddress {
  id: string;
  title: string;
  address: string;
  isDefault: boolean;
}

interface BillingState {
  cards: SavedCard[];
  addresses: BusinessAddress[];
  addCard: (card: Omit<SavedCard, "id">) => void;
  updateCard: (id: string, updates: Partial<SavedCard>) => void;
  removeCard: (id: string) => void;
  setDefaultCard: (id: string) => void;

  addAddress: (address: Omit<BusinessAddress, "id">) => void;
  updateAddress: (id: string, updates: Partial<BusinessAddress>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  /** Forget everything (on sign-out, so the next person on this phone starts clean). */
  reset: () => void;
}

/** The v0 persisted card, which held the full number and CVC. */
interface LegacyCard {
  id: string;
  number?: string;
  type?: string;
  expiry?: string;
  isDefault?: boolean;
}

const newId = () => Math.random().toString(36).substring(2, 9);

/** Keeps exactly one default, falling back to the first item. */
function withDefault<T extends { id: string; isDefault: boolean }>(items: T[], defaultId?: string): T[] {
  const id = defaultId ?? items.find((i) => i.isDefault)?.id ?? items[0]?.id;
  return items.map((i) => ({ ...i, isDefault: i.id === id }));
}

export const useBillingStore = create<BillingState>()(
  persist(
    (set) => ({
      cards: [],
      addresses: [],

      addCard: (card) =>
        set((state) => {
          const newCard = { ...card, id: newId() };
          const isDefault = state.cards.length === 0 || card.isDefault;
          return { cards: withDefault([...state.cards, newCard], isDefault ? newCard.id : undefined) };
        }),

      updateCard: (id, updates) =>
        set((state) => {
          const cards = state.cards.map((c) => (c.id === id ? { ...c, ...updates } : c));
          return { cards: withDefault(cards, updates.isDefault ? id : undefined) };
        }),

      removeCard: (id) => set((state) => ({ cards: withDefault(state.cards.filter((c) => c.id !== id)) })),

      setDefaultCard: (id) => set((state) => ({ cards: withDefault(state.cards, id) })),

      addAddress: (address) =>
        set((state) => {
          const newAddress = { ...address, id: newId() };
          const isDefault = state.addresses.length === 0 || address.isDefault;
          return {
            addresses: withDefault([...state.addresses, newAddress], isDefault ? newAddress.id : undefined),
          };
        }),

      updateAddress: (id, updates) =>
        set((state) => {
          const addresses = state.addresses.map((a) => (a.id === id ? { ...a, ...updates } : a));
          return { addresses: withDefault(addresses, updates.isDefault ? id : undefined) };
        }),

      removeAddress: (id) =>
        set((state) => ({ addresses: withDefault(state.addresses.filter((a) => a.id !== id)) })),

      setDefaultAddress: (id) => set((state) => ({ addresses: withDefault(state.addresses, id) })),

      reset: () => set({ cards: [], addresses: [] }),
    }),
    {
      name: 'billing-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      // v0 stored full card numbers and CVCs: keep only what the list shows.
      migrate: (persisted, version) => {
        const state = persisted as BillingState;
        if (version >= 1) return state;
        const legacyCards = (persisted as { cards?: LegacyCard[] }).cards ?? [];
        return {
          ...state,
          cards: legacyCards.map((c) => ({
            id: c.id,
            brand: c.type,
            last4: (c.number ?? '').replace(/\D/g, '').slice(-4),
            expiry: c.expiry ?? '',
            isDefault: !!c.isDefault,
          })),
        };
      },
    }
  )
);
