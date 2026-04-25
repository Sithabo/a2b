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
  deliveryDate: string;
  acceptedByDriver: boolean;
  driverId?: string;
  driverName?: string;
}

interface ShipmentState {
  shipments: Shipment[];
  addShipment: (shipment: Omit<Shipment, 'id' | 'createdAt'>) => void;
  editShipment: (id: string, updatedData: Partial<Omit<Shipment, 'id' | 'createdAt'>>) => void;
  deleteShipment: (id: string) => void;
  updateShipmentStatus: (id: string, newStatus: ShipmentStatus) => void;
  getAllShipments: () => Shipment[];
  clearAll: () => void;
}

const twoDaysFromNow = new Date();
twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

const initialShipments: Shipment[] = [
  {
    id: "H62J568107",
    pickup: "Kampala, Makindye",
    delivery: "Jinja, Industrial Area",
    cargoType: "General cargo",
    weight: "250",
    offerPrice: "150000",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
    deliveryDate: twoDaysFromNow.toISOString(),
    acceptedByDriver: true,
    driverId: "drv_001",
    driverName: "Guy Hawkins",
  },
  {
    id: "P2AL01Z89",
    pickup: "Entebbe, Airport Road",
    delivery: "Kampala, City Center",
    cargoType: "Fragile cargo",
    weight: "50",
    offerPrice: "80000",
    status: "OPEN",
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    deliveryDate: new Date(Date.now() + 4 * 86400000).toISOString(),
    acceptedByDriver: false,
  }
];

export const useShipmentStore = create<ShipmentState>()(
  persist(
    (set, get) => ({
      shipments: initialShipments,
      
      addShipment: (shipmentData) => set((state) => ({
        shipments: [
          ...state.shipments,
          {
            ...shipmentData,
            id: Math.random().toString(36).substring(2, 10).toUpperCase(),
            createdAt: new Date().toISOString(),
          }
        ]
      })),
      
      editShipment: (id, updatedData) => set((state) => ({
        shipments: state.shipments.map(s =>
          s.id === id ? { ...s, ...updatedData } : s
        )
      })),
      
      deleteShipment: (id) => set((state) => ({
        shipments: state.shipments.filter(s => s.id !== id)
      })),
      
      updateShipmentStatus: (id, newStatus) => set((state) => ({
        shipments: state.shipments.map(s => 
          s.id === id ? { ...s, status: newStatus } : s
        )
      })),
      
      getAllShipments: () => {
        return get().shipments;
      },
      
      clearAll: () => set({ shipments: [] }),
    }),
    {
      name: 'shipment-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
