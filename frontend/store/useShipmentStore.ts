import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ShipmentStatus = 'OPEN' | 'MATCHED' | 'SECURED' | 'ACTIVE' | 'COMPLETED';

export interface Shipment {
  id: string;
  pickup: string;
  delivery: string;
  cargoType: string;
  weight: string;
  offerPrice: string;
  status: ShipmentStatus;
  createdAt: string;
}

interface ShipmentState {
  shipments: Shipment[];
  addShipment: (shipment: Omit<Shipment, 'id' | 'createdAt'>) => void;
  deleteShipment: (id: string) => void;
  updateShipmentStatus: (id: string, newStatus: ShipmentStatus) => void;
  clearAll: () => void; // Useful for testing
}

export const useShipmentStore = create<ShipmentState>()(
  persist(
    (set) => ({
      shipments: [],
      addShipment: (shipmentData) => set((state) => ({
        shipments: [
          ...state.shipments,
          {
            ...shipmentData,
            id: Math.random().toString(36).substring(2, 9),
            createdAt: new Date().toISOString(),
          }
        ]
      })),
      deleteShipment: (id) => set((state) => ({
        shipments: state.shipments.filter(s => s.id !== id)
      })),
      updateShipmentStatus: (id, newStatus) => set((state) => ({
        shipments: state.shipments.map(s => 
          s.id === id ? { ...s, status: newStatus } : s
        )
      })),
      clearAll: () => set({ shipments: [] }),
    }),
    {
      name: 'shipment-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
