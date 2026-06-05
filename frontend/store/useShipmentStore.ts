import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ShipmentStatus = 'OPEN' | 'MATCHED' | 'SECURED' | 'ACTIVE' | 'COMPLETED' | 'DRAFT_PENDING_DOCS';

export interface LocationData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  is_port: boolean;
  cargo_restrictions?: string[];
}

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
  is_import?: boolean;
  containerId?: string;
  documents?: { [key: string]: { name: string; size: string } };
}

interface ShipmentState {
  shipments: Shipment[];
  draftShipment: (Partial<Shipment> & { containerId?: string; documents?: any }) | null;
  
  // Route selection & Wizard states
  currentStep: number;
  pickupLocation: LocationData | null;
  dropoffLocation: LocationData | null;
  isImportFlow: boolean;

  addShipment: (shipment: Omit<Shipment, 'id' | 'createdAt'>) => void;
  editShipment: (id: string, updatedData: Partial<Omit<Shipment, 'id' | 'createdAt'>>) => void;
  deleteShipment: (id: string) => void;
  updateShipmentStatus: (id: string, newStatus: ShipmentStatus) => void;
  getAllShipments: () => Shipment[];
  setDraftShipment: (draft: (Partial<Shipment> & { containerId?: string; documents?: any }) | null) => void;
  clearDraftShipment: () => void;
  
  // Wizard actions
  setCurrentStep: (step: number) => void;
  setPickupLocation: (location: LocationData | null) => void;
  setDropoffLocation: (location: LocationData | null) => void;
  resetRouteState: () => void;
  
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
      draftShipment: null,
      
      // Wizard initial state
      currentStep: 1,
      pickupLocation: null,
      dropoffLocation: null,
      isImportFlow: false,

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
      
      setDraftShipment: (draft) => set({ draftShipment: draft }),
      
      clearDraftShipment: () => set({ draftShipment: null }),
      
      // Wizard actions
      setCurrentStep: (step) => set({ currentStep: step }),
      
      setPickupLocation: (location) => set({ 
        pickupLocation: location,
        isImportFlow: location ? location.is_port : false 
      }),
      
      setDropoffLocation: (location) => set({ dropoffLocation: location }),
      
      resetRouteState: () => set({
        currentStep: 1,
        pickupLocation: null,
        dropoffLocation: null,
        isImportFlow: false
      }),
      
      clearAll: () => set({ 
        shipments: [], 
        draftShipment: null,
        currentStep: 1,
        pickupLocation: null,
        dropoffLocation: null,
        isImportFlow: false
      }),
    }),
    {
      name: 'shipment-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
