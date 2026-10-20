import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LocationData } from '@a2b/core';
import type { NewLoadInput } from '@/lib/loads';

/** A customs document scanned on the phone, kept until the load is posted. */
export interface DraftDocument {
  name: string;
  size: string;
  uri?: string;
}

/**
 * An import load the shipper has started but not posted (documents still to
 * scan). It holds the same fields as the create-load request, so resuming it
 * can't lose any of them.
 */
export interface LoadDraft extends NewLoadInput {
  /** Scans by customs requirement id. */
  documents: Record<string, DraftDocument | null>;
  /** Set when the shipper leaves the document vault with "Save draft"; drives the home banner. */
  savedAt?: string;
}

/**
 * Local state for the post-a-load wizard only. Posted loads live on the API
 * (see lib/loads.ts); this keeps the in-progress route and an unfinished import
 * draft so the shipper can resume after leaving the document vault.
 */
interface ShipmentState {
  draft: LoadDraft | null;

  currentStep: number;
  pickupLocation: LocationData | null;
  dropoffLocation: LocationData | null;
  isImportFlow: boolean;

  setDraft: (draft: LoadDraft | null) => void;
  clearDraft: () => void;

  setCurrentStep: (step: number) => void;
  setPickupLocation: (location: LocationData | null) => void;
  setDropoffLocation: (location: LocationData | null) => void;
  resetRouteState: () => void;

  clearAll: () => void;
}

const emptyRoute = {
  currentStep: 1,
  pickupLocation: null,
  dropoffLocation: null,
  isImportFlow: false,
};

/** v2 stored places with snake_case `is_port`. */
function migratePlace(place: (LocationData & { is_port?: boolean }) | null): LocationData | null {
  if (!place) return null;
  const { id, name, latitude, longitude } = place;
  return { id, name, latitude, longitude, isPort: place.isPort ?? !!place.is_port };
}

export const useShipmentStore = create<ShipmentState>()(
  persist(
    (set) => ({
      draft: null,
      ...emptyRoute,

      setDraft: (draft) => set({ draft }),
      clearDraft: () => set({ draft: null }),

      setCurrentStep: (step) => set({ currentStep: step }),

      setPickupLocation: (location) => set({
        pickupLocation: location,
        isImportFlow: location ? location.isPort : false
      }),

      setDropoffLocation: (location) => set({ dropoffLocation: location }),

      resetRouteState: () => set(emptyRoute),

      clearAll: () => set({ draft: null, ...emptyRoute }),
    }),
    {
      name: 'shipment-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 3,
      migrate: (persisted, version) => {
        const state = persisted as ShipmentState & {
          pickupLocation: LocationData & { is_port?: boolean };
          dropoffLocation: LocationData & { is_port?: boolean };
        };
        if (version < 3) {
          // v0–v2 drafts used the old display shape and could be missing the
          // offer price, so they can't be posted reliably: start fresh.
          return {
            ...state,
            draft: null,
            pickupLocation: migratePlace(state.pickupLocation),
            dropoffLocation: migratePlace(state.dropoffLocation),
          };
        }
        return state;
      },
    }
  )
);
