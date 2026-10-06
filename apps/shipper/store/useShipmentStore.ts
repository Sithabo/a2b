import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  CargoDetails,
  CargoType,
  LoadStatus,
  LocationData,
  MachinerySector,
  Shipment,
} from '@a2b/core';

export type { Shipment, LocationData, CargoDetails, CargoType, MachinerySector };
export type ShipmentStatus = LoadStatus;

/**
 * Local state for the post-a-load wizard only. Posted loads live on the API
 * (see lib/loads.ts); this keeps the in-progress route and an unfinished import
 * draft so the shipper can resume after leaving the document vault.
 */
interface ShipmentState {
  draftShipment: (Partial<Shipment> & { containerId?: string; documents?: any }) | null;

  currentStep: number;
  pickupLocation: LocationData | null;
  dropoffLocation: LocationData | null;
  isImportFlow: boolean;

  setDraftShipment: (draft: (Partial<Shipment> & { containerId?: string; documents?: any }) | null) => void;
  clearDraftShipment: () => void;

  setCurrentStep: (step: number) => void;
  setPickupLocation: (location: LocationData | null) => void;
  setDropoffLocation: (location: LocationData | null) => void;
  resetRouteState: () => void;

  clearAll: () => void;
}

export const useShipmentStore = create<ShipmentState>()(
  persist(
    (set) => ({
      draftShipment: null,
      currentStep: 1,
      pickupLocation: null,
      dropoffLocation: null,
      isImportFlow: false,

      setDraftShipment: (draft) => set({ draftShipment: draft }),

      clearDraftShipment: () => set({ draftShipment: null }),

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
      version: 2,
      // v0/v1 kept a local list of (mock) shipments; loads now come from the API.
      migrate: (persisted: any) => {
        if (persisted) delete persisted.shipments;
        return persisted;
      },
    }
  )
);
