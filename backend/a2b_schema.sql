-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('shipper', 'driver', 'admin');
CREATE TYPE load_status AS ENUM ('OPEN', 'MATCHED', 'SECURED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED');
CREATE TYPE vehicle_type AS ENUM ('BODA', 'TUKTUK', 'PICKUP', 'BOX_TRUCK', 'FLATBED', 'TRAILER');
CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
CREATE TYPE image_type AS ENUM ('ITEM_PHOTO', 'PICKUP_PROOF', 'DELIVERY_PROOF');

-- -----------------------------------------------------------------------------
-- 1. CORE & AUTH
-- -----------------------------------------------------------------------------

-- PROFILES
-- Linked to auth.users. Everyone has a profile.
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    full_name TEXT,
    phone TEXT, -- E.164 format recommended
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DRIVER STATS
-- Separate table for aggregate data, cleaner and safer.
CREATE TABLE driver_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating_avg DECIMAL(3, 2) DEFAULT 0.00, -- e.g. 4.85
    total_trips INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(driver_id)
);

-- SAVED LOCATIONS
-- For Shippers to reuse addresses
CREATE TABLE saved_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "Home", "Warehouse A"
    address TEXT NOT NULL,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. FLEET
-- -----------------------------------------------------------------------------
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plate_number TEXT NOT NULL,
    vehicle_type vehicle_type NOT NULL,
    capacity_kg INTEGER,
    photo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. LOAD MANAGEMENT (The Core)
-- -----------------------------------------------------------------------------

-- LOADS (The Public "Index Card")
-- Visible to all authenticated drivers (for matching) and the owner shipper.
CREATE TABLE loads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipper_id UUID NOT NULL REFERENCES profiles(id),
    driver_id UUID REFERENCES profiles(id), -- Null initially, set when MATCHED
    
    status load_status DEFAULT 'OPEN',
    
    -- Public Info
    summary_origin TEXT NOT NULL,      -- e.g. "Ntinda, Kampala" (Not exact house #)
    summary_destination TEXT NOT NULL, -- e.g. "Entebbe Town"
    distance_km DECIMAL(6, 2),
    price_offer DECIMAL(12, 2),        -- UGX
    vehicle_type_needed vehicle_type NOT NULL,
    load_description TEXT,             -- "20 boxes of electronics"
    
    -- Timestamps for Logging
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,            -- When status -> IN_TRANSIT
    completed_at TIMESTAMPTZ           -- When status -> COMPLETED
);

-- LOAD SENSITIVE DETAILS (The "Vault")
-- STRICTLY CONTROLLED ACCESS.
CREATE TABLE load_sensitive_details (
    load_id UUID PRIMARY KEY REFERENCES loads(id) ON DELETE CASCADE,
    
    -- Precise Locations
    exact_pickup_address TEXT NOT NULL,
    pickup_lat DECIMAL(10, 8),
    pickup_lng DECIMAL(11, 8),
    pickup_contact_name TEXT,
    pickup_contact_phone TEXT,
    
    exact_dropoff_address TEXT NOT NULL,
    dropoff_lat DECIMAL(10, 8),
    dropoff_lng DECIMAL(11, 8),
    receiver_contact_name TEXT,
    receiver_contact_phone TEXT,
    
    pickup_time TIMESTAMPTZ
);

-- LOAD SECURITY (The "Black Box")
-- Holds the delivery code hash.
-- Drivers NEVER see this table. Shippers only verify via function/RPC.
CREATE TABLE load_security (
    load_id UUID PRIMARY KEY REFERENCES loads(id) ON DELETE CASCADE,
    delivery_code_hash TEXT, -- Bcrypt hash of the 6-digit code
    wrong_attempts INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOAD ITEMS
-- Specific cargo manifest
CREATE TABLE load_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    load_id UUID NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    dimensions TEXT, -- "2x2x2m"
    weight_approx_kg DECIMAL(8, 2)
);

-- LOAD IMAGES
-- Photos of items, proof of pickup/delivery
CREATE TABLE load_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    load_id UUID NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
    details_id UUID REFERENCES load_items(id), -- Optional link to specific item
    uploader_id UUID NOT NULL REFERENCES profiles(id),
    image_url TEXT NOT NULL,
    image_type image_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. FINANCIALS & TRUST
-- -----------------------------------------------------------------------------

-- PAYMENTS
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    load_id UUID NOT NULL REFERENCES loads(id),
    shipper_id UUID NOT NULL REFERENCES profiles(id),
    amount DECIMAL(12, 2) NOT NULL,
    provider_ref TEXT, -- Mobile Money Transaction ID
    status payment_status DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    load_id UUID NOT NULL REFERENCES loads(id),
    reviewer_id UUID NOT NULL REFERENCES profiles(id), -- Who wrote it
    reviewee_id UUID NOT NULL REFERENCES profiles(id), -- Who it's about
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(load_id, reviewer_id) -- One review per load per person
);


-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_sensitive_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_security ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;


-- 1. PROFILES
-- Publicly visible (needed for showing driver name etc). 
-- Editable only by self.
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. LOADS (Public Card)
-- Visible to:
--  - The Shipper (owner)
--  - Any Driver (if status is OPEN/MATCHED to them)
--  - The Assigned Driver
CREATE POLICY "Loads are viewable by everyone" ON loads
    FOR SELECT USING (true); 
    -- Broad select for Marketplace. 
    -- Refinement: Could limit to 'OPEN' for strangers, but 'history' needs broader access.

CREATE POLICY "Shippers can insert loads" ON loads
    FOR INSERT WITH CHECK (auth.uid() = shipper_id);

CREATE POLICY "Shippers can update their loads" ON loads
    FOR UPDATE USING (auth.uid() = shipper_id);

CREATE POLICY "Drivers can update status assigned to them" ON loads
    FOR UPDATE USING (auth.uid() = driver_id);


-- 3. LOAD SENSITIVE DETAILS (The Critical Rule)
-- Shipper: Always sees.
-- Driver: Sees ONLY if status is SECURED, IN_TRANSIT, or COMPLETED.
-- NOT generated for OPEN or MATCHED.
CREATE POLICY "Shipper sees own sensitive details" ON load_sensitive_details
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM loads WHERE loads.id = load_sensitive_details.load_id AND loads.shipper_id = auth.uid())
    );

CREATE POLICY "Driver sees details only when SECURED" ON load_sensitive_details
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM loads 
            WHERE loads.id = load_sensitive_details.load_id 
            AND loads.driver_id = auth.uid()
            AND loads.status IN ('SECURED', 'IN_TRANSIT', 'COMPLETED')
        )
    );

CREATE POLICY "Shipper inserts details" ON load_sensitive_details
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM loads WHERE loads.id = load_sensitive_details.load_id AND loads.shipper_id = auth.uid())
    );

-- 4. LOAD SECURITY
-- NO DIRECT SELECT ACCESS FOR ANYONE via API.
-- Only accessible via SECURITY DEFINER functions (PostgreSQL RPCs).
-- (No policies created = Default deny all)


-- 5. LOAD ITEMS / IMAGES
-- Generally follow the Load visibility, or slightly broader.
CREATE POLICY "Items visible with load" ON load_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM loads WHERE loads.id = load_items.load_id) -- Public info usually
    );

-- -----------------------------------------------------------------------------
-- END
-- -----------------------------------------------------------------------------
