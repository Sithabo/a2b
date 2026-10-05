import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CreditCard {
  id: string;
  name: string;
  number: string;
  expiry: string;
  cvc: string;
  type: string; // brand e.g. "visa", "master-card"
  isDefault: boolean;
}

export interface BusinessAddress {
  id: string;
  title: string;
  address: string;
  isDefault: boolean;
}

interface BillingState {
  cards: CreditCard[];
  addresses: BusinessAddress[];
  addCard: (card: Omit<CreditCard, "id">) => void;
  updateCard: (id: string, updates: Partial<CreditCard>) => void;
  removeCard: (id: string) => void;
  setDefaultCard: (id: string) => void;
  
  addAddress: (address: Omit<BusinessAddress, "id">) => void;
  updateAddress: (id: string, updates: Partial<BusinessAddress>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

export const useBillingStore = create<BillingState>()(
  persist(
    (set) => ({
      cards: [],
      addresses: [],
      
      addCard: (card) => set((state) => {
        const isFirst = state.cards.length === 0;
        const newCard = { ...card, id: Math.random().toString(36).substring(2, 9), isDefault: isFirst || card.isDefault };
        let newCards = [...state.cards, newCard];
        
        if (newCard.isDefault) {
          newCards = newCards.map(c => ({ ...c, isDefault: c.id === newCard.id }));
        }
        return { cards: newCards };
      }),
      
      updateCard: (id, updates) => set((state) => {
        let newCards = state.cards.map(c => c.id === id ? { ...c, ...updates } : c);
        if (updates.isDefault) {
          newCards = newCards.map(c => ({ ...c, isDefault: c.id === id }));
        }
        return { cards: newCards };
      }),
      
      removeCard: (id) => set((state) => {
        let newCards = state.cards.filter(c => c.id !== id);
        // If we removed the default, make the first remaining card the default
        if (state.cards.find(c => c.id === id)?.isDefault && newCards.length > 0) {
          newCards[0].isDefault = true;
        }
        return { cards: newCards };
      }),
      
      setDefaultCard: (id) => set((state) => ({
        cards: state.cards.map(c => ({ ...c, isDefault: c.id === id }))
      })),
      
      addAddress: (address) => set((state) => {
        const isFirst = state.addresses.length === 0;
        const newAddress = { ...address, id: Math.random().toString(36).substring(2, 9), isDefault: isFirst || address.isDefault };
        let newAddresses = [...state.addresses, newAddress];
        
        if (newAddress.isDefault) {
          newAddresses = newAddresses.map(a => ({ ...a, isDefault: a.id === newAddress.id }));
        }
        return { addresses: newAddresses };
      }),
      
      updateAddress: (id, updates) => set((state) => {
        let newAddresses = state.addresses.map(a => a.id === id ? { ...a, ...updates } : a);
        if (updates.isDefault) {
          newAddresses = newAddresses.map(a => ({ ...a, isDefault: a.id === id }));
        }
        return { addresses: newAddresses };
      }),
      
      removeAddress: (id) => set((state) => {
        let newAddresses = state.addresses.filter(a => a.id !== id);
        if (state.addresses.find(a => a.id === id)?.isDefault && newAddresses.length > 0) {
          newAddresses[0].isDefault = true;
        }
        return { addresses: newAddresses };
      }),
      
      setDefaultAddress: (id) => set((state) => ({
        addresses: state.addresses.map(a => ({ ...a, isDefault: a.id === id }))
      }))
    }),
    {
      name: 'billing-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
