export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      loads: {
        Row: Load
        Insert: LoadInsert
        Update: LoadUpdate
      }
      load_sensitive_details: {
        Row: LoadSensitiveDetails
        Insert: LoadSensitiveDetailsInsert
        Update: LoadSensitiveDetailsUpdate
      }
      vehicles: {
        Row: Vehicle
        Insert: VehicleInsert
        Update: VehicleUpdate
      }
      driver_stats: {
        Row: DriverStats
        Insert: DriverStatsInsert
        Update: DriverStatsUpdate
      }
      load_items: {
        Row: LoadItem
        Insert: LoadItemInsert
        Update: LoadItemUpdate
      }
      payments: {
        Row: Payment
        Insert: PaymentInsert
        Update: PaymentUpdate
      }
    }
    Enums: {
      user_role: UserRole
      load_status: LoadStatus
      vehicle_type: VehicleType
      image_type: ImageType
      payment_status: PaymentStatus
    }
  }
}

// ---------------------------------------------------------
// ENUMS
// ---------------------------------------------------------
export type UserRole = 'shipper' | 'driver' | 'admin'
export type LoadStatus = 'OPEN' | 'MATCHED' | 'SECURED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED'
export type VehicleType = 'BODA' | 'TUKTUK' | 'PICKUP' | 'BOX_TRUCK' | 'FLATBED' | 'TRAILER'
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
export type ImageType = 'ITEM_PHOTO' | 'PICKUP_PROOF' | 'DELIVERY_PROOF'

// ---------------------------------------------------------
// ENTITIES
// ---------------------------------------------------------

export interface Profile {
  id: string
  role: UserRole
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type ProfileInsert = Partial<Profile> & { id: string; role: UserRole }
export type ProfileUpdate = Partial<Profile>

export interface DriverStats {
  id: string
  driver_id: string
  rating_avg: number
  total_trips: number
  is_verified: boolean
  last_active: string | null
}

export type DriverStatsInsert = Omit<DriverStats, 'id' | 'rating_avg' | 'total_trips'>
export type DriverStatsUpdate = Partial<DriverStats>

export interface Vehicle {
  id: string
  driver_id: string
  plate_number: string
  vehicle_type: VehicleType
  capacity_kg: number | null
  photo_url: string | null
  is_active: boolean
  created_at: string
}

export type VehicleInsert = Omit<Vehicle, 'id' | 'created_at'>
export type VehicleUpdate = Partial<Vehicle>

export interface Load {
  id: string
  shipper_id: string
  driver_id: string | null
  status: LoadStatus
  summary_origin: string
  summary_destination: string
  distance_km: number | null
  price_offer: number | null
  vehicle_type_needed: VehicleType
  load_description: string | null
  created_at: string
  updated_at: string
  started_at: string | null
  completed_at: string | null
}

export type LoadInsert = Omit<Load, 'id' | 'created_at' | 'updated_at' | 'driver_id' | 'status' | 'started_at' | 'completed_at'>
export type LoadUpdate = Partial<Load>

export interface LoadSensitiveDetails {
  load_id: string
  exact_pickup_address: string
  pickup_lat: number | null
  pickup_lng: number | null
  pickup_contact_name: string | null
  pickup_contact_phone: string | null
  exact_dropoff_address: string
  dropoff_lat: number | null
  dropoff_lng: number | null
  receiver_contact_name: string | null
  receiver_contact_phone: string | null
  pickup_time: string | null
}

export type LoadSensitiveDetailsInsert = LoadSensitiveDetails
export type LoadSensitiveDetailsUpdate = Partial<LoadSensitiveDetails>

export interface LoadItem {
  id: string
  load_id: string
  name: string
  quantity: number
  dimensions: string | null
  weight_approx_kg: number | null
}

export type LoadItemInsert = Omit<LoadItem, 'id'>
export type LoadItemUpdate = Partial<LoadItem>

export interface Payment {
  id: string
  load_id: string
  shipper_id: string
  amount: number
  provider_ref: string | null
  status: PaymentStatus
  created_at: string
}

export type PaymentInsert = Omit<Payment, 'id' | 'created_at' | 'status'>
export type PaymentUpdate = Partial<Payment>

// ---------------------------------------------------------
// COMPOSITE TYPES (Likely used in UI)
// ---------------------------------------------------------
export interface LoadWithDetails extends Load {
  details?: LoadSensitiveDetails | null // Might be null if Driver doesn't have access yet
  items: LoadItem[]
  shipper?: Profile
  driver?: Profile
}
