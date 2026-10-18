-- ==============================================================================
-- Arya Link (آریا لینک) - Enterprise NFC Digital Business Card & Link-in-Bio Platform
-- PostgreSQL / Supabase Complete Database Architecture
-- Version: 1.0.0
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. ENUMS & DOMAINS
-- ==============================================================================

CREATE TYPE app_role AS ENUM (
    'super_admin',
    'b2b_org_admin',
    'b2b_org_manager',
    'employee',
    'individual_user'
);

CREATE TYPE profile_type AS ENUM (
    'personal',
    'business',
    'creator'
);

CREATE TYPE link_module_type AS ENUM (
    'standard_link',
    'social_profile',
    'whatsapp_direct',
    'youtube_embed',
    'vcf_contact_card',
    'pdf_catalog',
    'image_gallery',
    'appointment_booking',
    'clinic_map_hours',
    'restaurant_menu',
    'custom_html'
);

CREATE TYPE lead_status AS ENUM (
    'new',
    'contacted',
    'in_progress',
    'qualified',
    'converted',
    'archived'
);

CREATE TYPE card_material AS ENUM (
    'pvc_matte',
    'pvc_glossy',
    'epoxy_sticker',
    'metal_black_matte',
    'metal_gold',
    'metal_silver',
    'bamboo_wood'
);

CREATE TYPE nfc_chip_type AS ENUM (
    'ntag213',
    'ntag215',
    'ntag216'
);

CREATE TYPE nfc_card_status AS ENUM (
    'unassigned',
    'active',
    'suspended',
    'lost'
);

CREATE TYPE order_status AS ENUM (
    'pending_payment',
    'payment_confirmed',
    'in_production',
    'quality_check',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
);

CREATE TYPE payment_method AS ENUM (
    'hesabpay',
    'afghan_mobile_wallet',
    'cash_on_delivery',
    'bank_transfer',
    'card_international'
);

CREATE TYPE payment_status AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded'
);

CREATE TYPE device_type AS ENUM (
    'mobile',
    'desktop',
    'tablet',
    'bot_or_crawler',
    'other'
);

-- ==============================================================================
-- 3. CORE USERS & ORGANIZATIONS (B2B ARCHITECTURE)
-- ==============================================================================

-- 3.1 Users Table (Extended from auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email CITEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    avatar_url TEXT,
    system_role app_role DEFAULT 'individual_user' NOT NULL,
    preferred_language VARCHAR(10) DEFAULT 'fa' NOT NULL, -- 'fa' (Dari), 'ps' (Pashto), 'en'
    is_suspended BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3.2 Organizations Table (B2B Multi-tenancy)
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug CITEXT UNIQUE NOT NULL,
    legal_name TEXT,
    logo_url TEXT,
    brand_color_primary VARCHAR(10) DEFAULT '#0F172A',
    brand_color_secondary VARCHAR(10) DEFAULT '#38BDF8',
    is_brand_locked BOOLEAN DEFAULT FALSE NOT NULL, -- Locks layout & colors for employees
    locked_brand_template JSONB DEFAULT '{}'::JSONB NOT NULL,
    billing_email CITEXT NOT NULL,
    contact_phone TEXT,
    country VARCHAR(50) DEFAULT 'Afghanistan',
    city TEXT,
    street_address TEXT,
    max_seats INTEGER DEFAULT 10 NOT NULL,
    crm_webhook_url TEXT, -- For Salesforce, HubSpot, or custom webhook dispatch
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3.3 Organization Memberships
CREATE TABLE public.organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    org_role app_role DEFAULT 'employee' NOT NULL,
    job_title TEXT,
    department TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    invited_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    joined_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT unique_user_org UNIQUE (organization_id, user_id)
);

-- ==============================================================================
-- 4. PROFILES & TEMPLATES
-- ==============================================================================

-- 4.1 Profiles Table (Supports Multi-profile per user & B2B profiles)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    
    -- Routing & Aliases
    alias CITEXT UNIQUE NOT NULL, -- e.g. aryalink.af/ahmad
    custom_domain TEXT UNIQUE, -- e.g. card.dr-ahmad.af
    
    -- Profile Essentials
    profile_type profile_type DEFAULT 'personal' NOT NULL,
    display_name TEXT NOT NULL,
    headline TEXT, -- e.g. "متخصص جراحی قلب و عروق"
    bio TEXT,
    occupation_category VARCHAR(50) DEFAULT 'general', -- 'doctor', 'restaurant', 'corporate', 'real_estate', etc.
    
    -- Visual Assets
    avatar_url TEXT,
    cover_photo_url TEXT,
    company_logo_url TEXT,
    
    -- Contact Information
    contact_email CITEXT,
    contact_phone TEXT,
    whatsapp_number TEXT,
    telegram_handle TEXT,
    location_address TEXT,
    location_coordinates POINT, -- (latitude, longitude)
    company_name TEXT,
    job_title TEXT,
    
    -- Direct Mode (Bypasses profile screen directly to URL)
    direct_mode_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    direct_mode_url TEXT,
    
    -- Lead Capture Form Config
    lead_capture_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    lead_capture_headline TEXT DEFAULT 'اطلاعات خود را به اشتراک بگذارید',
    lead_capture_fields JSONB DEFAULT '{"require_name": true, "require_phone": true, "require_email": false, "require_note": true}'::JSONB NOT NULL,
    
    -- Styling & Theme Customization (Glassmorphism, Dark mode, Fonts)
    theme_preset VARCHAR(50) DEFAULT 'modern_glass' NOT NULL,
    theme_custom_config JSONB DEFAULT '{
        "background_type": "gradient",
        "background_value": "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        "card_blur": "backdrop-blur-md",
        "accent_color": "#06B6D4",
        "text_color": "#FFFFFF",
        "font_family": "Vazirmatn",
        "button_style": "rounded-2xl"
    }'::JSONB NOT NULL,
    
    -- VCF & Wallet Config
    vcard_config JSONB DEFAULT '{}'::JSONB NOT NULL,
    apple_wallet_pass_url TEXT,
    google_wallet_pass_url TEXT,
    
    -- Dynamic QR Code Styling
    qr_config JSONB DEFAULT '{
        "color_dark": "#000000",
        "color_light": "#FFFFFF",
        "logo_embedded": true,
        "style": "dots"
    }'::JSONB NOT NULL,
    
    -- Status & Controls
    is_locked_by_org BOOLEAN DEFAULT FALSE NOT NULL, -- Enforced by B2B Org Admin
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    views_count BIGINT DEFAULT 0 NOT NULL,
    leads_count BIGINT DEFAULT 0 NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ==============================================================================
-- 5. LINK MODULES & ADVANCED URL MANAGEMENT
-- ==============================================================================

-- 5.1 Profile Links & Rich Modules
CREATE TABLE public.profile_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    module_type link_module_type DEFAULT 'standard_link' NOT NULL,
    
    title TEXT NOT NULL,
    destination_url TEXT,
    icon_name VARCHAR(50), -- Lucide or Brand icon identifier
    thumbnail_url TEXT,
    
    -- Module Specific Data (Polymorphic JSONB for Extensibility)
    -- e.g. for clinic: {"working_days": "شنبه الی پنجشنبه", "hours": "14:00 - 20:00"}
    -- e.g. for restaurant: {"menu_pdf_url": "...", "specialties": [...]}
    -- e.g. for youtube: {"video_id": "dQw4w9WgXcQ"}
    module_metadata JSONB DEFAULT '{}'::JSONB NOT NULL,
    
    -- Smart Expiration & Limits (Linko feature set)
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    expires_at TIMESTAMPTZ,
    max_clicks_allowed INTEGER,
    click_count BIGINT DEFAULT 0 NOT NULL,
    
    -- Security (Google Safe Browsing & Anti-abuse)
    is_safe BOOLEAN DEFAULT TRUE NOT NULL,
    safe_browsing_checked_at TIMESTAMPTZ,
    safety_details JSONB DEFAULT '{}'::JSONB NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ==============================================================================
-- 6. CONTACTS & LEAD CAPTURE (MINI-CRM)
-- ==============================================================================

-- 6.1 Leads Table (Exchanged Contacts from NFC Taps)
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    
    -- Contact details submitted by visitor
    visitor_name TEXT NOT NULL,
    visitor_phone TEXT NOT NULL,
    visitor_email CITEXT,
    visitor_company TEXT,
    visitor_job_title TEXT,
    visitor_note TEXT,
    custom_form_data JSONB DEFAULT '{}'::JSONB NOT NULL,
    
    -- Metadata
    lead_source VARCHAR(50) DEFAULT 'nfc_tap' NOT NULL, -- 'nfc_tap', 'qr_scan', 'direct_web'
    status lead_status DEFAULT 'new' NOT NULL,
    is_exported_to_crm BOOLEAN DEFAULT FALSE NOT NULL,
    exported_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ==============================================================================
-- 7. NFC HARDWARE ASSETS & CHIP PROVISIONING
-- ==============================================================================

-- 7.1 Physical NFC Cards & Tags
CREATE TABLE public.nfc_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_uid TEXT UNIQUE NOT NULL, -- Physical NFC Chip serial (Hex string)
    activation_code TEXT UNIQUE NOT NULL, -- Scratched/secret claiming code
    qr_secret_hash TEXT NOT NULL,
    
    assigned_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    
    material card_material DEFAULT 'pvc_matte' NOT NULL,
    chip_type nfc_chip_type DEFAULT 'ntag216' NOT NULL,
    status nfc_card_status DEFAULT 'unassigned' NOT NULL,
    
    tap_count BIGINT DEFAULT 0 NOT NULL,
    last_tapped_at TIMESTAMPTZ,
    
    batch_number VARCHAR(50),
    manufactured_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    activated_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ==============================================================================
-- 8. E-COMMERCE & 3D CUSTOM NFC STUDIO
-- ==============================================================================

-- 8.1 NFC Hardware Products
CREATE TABLE public.ecom_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    title_fa TEXT NOT NULL,
    title_ps TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description_fa TEXT,
    description_ps TEXT,
    description_en TEXT,
    
    material card_material NOT NULL,
    chip_type nfc_chip_type DEFAULT 'ntag216' NOT NULL,
    
    base_price_afn NUMERIC(12, 2) NOT NULL, -- Afghani
    base_price_usd NUMERIC(10, 2) NOT NULL, -- International USD
    discount_percentage NUMERIC(5, 2) DEFAULT 0.00,
    
    stock_quantity INTEGER DEFAULT 0 NOT NULL,
    is_customizable BOOLEAN DEFAULT TRUE NOT NULL,
    supports_3d_preview BOOLEAN DEFAULT TRUE NOT NULL,
    
    primary_image_url TEXT NOT NULL,
    gallery_image_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    mockup_3d_model_url TEXT, -- .glb / .gltf 3D asset for Three.js studio
    
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 8.2 Customer Orders
CREATE TABLE public.ecom_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL, -- e.g. AL-AF-2026-1049
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    
    -- Customer Contact & Shipping Details
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email CITEXT,
    shipping_province TEXT NOT NULL, -- e.g. Kabul, Herat, Mazar, etc.
    shipping_city TEXT NOT NULL,
    shipping_street_address TEXT NOT NULL,
    shipping_postal_code VARCHAR(20),
    shipping_notes TEXT,
    
    -- Financials
    currency VARCHAR(5) DEFAULT 'AFN' NOT NULL,
    subtotal_amount NUMERIC(12, 2) NOT NULL,
    shipping_fee NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    
    -- Payment & Afghan Integrations (HesabPay, Cash on Delivery, etc.)
    payment_method payment_method DEFAULT 'cash_on_delivery' NOT NULL,
    payment_status payment_status DEFAULT 'pending' NOT NULL,
    payment_transaction_id TEXT,
    payment_metadata JSONB DEFAULT '{}'::JSONB NOT NULL,
    
    -- Fulfillment
    order_status order_status DEFAULT 'pending_payment' NOT NULL,
    courier_name TEXT,
    tracking_number TEXT,
    estimated_delivery_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 8.3 Order Line Items (Includes 3D Studio Mockup Customization Data)
CREATE TABLE public.ecom_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.ecom_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.ecom_products(id) ON DELETE RESTRICT,
    quantity INTEGER DEFAULT 1 NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    line_total NUMERIC(12, 2) NOT NULL,
    
    -- 3D Mockup Studio Data for Card Printing
    customization_payload JSONB DEFAULT '{
        "printed_name": "",
        "printed_title": "",
        "front_logo_url": null,
        "back_qr_code_enabled": true,
        "base_material_color": "#111827",
        "foil_finish": "gold",
        "mockup_preview_image_url": null,
        "print_ready_pdf_url": null
    }'::JSONB NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ==============================================================================
-- 9. HIGH-PERFORMANCE ANALYTICS & EVENT LOGGING
-- ==============================================================================

-- 9.1 Raw Analytics Events (Partition-ready, immutable append-only)
CREATE TABLE public.analytics_events (
    id BIGSERIAL PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    link_id UUID REFERENCES public.profile_links(id) ON DELETE CASCADE,
    nfc_card_id UUID REFERENCES public.nfc_cards(id) ON DELETE SET NULL,
    
    event_type VARCHAR(30) NOT NULL, -- 'profile_view', 'nfc_tap', 'link_click', 'contact_download_vcf', 'lead_form_submitted', 'direct_redirect'
    
    -- Visitor Telemetry
    device device_type DEFAULT 'mobile' NOT NULL,
    browser VARCHAR(50),
    os VARCHAR(50),
    ip_hash VARCHAR(64) NOT NULL, -- SHA-256 hashed IP for unique visitor counting without PII
    
    -- Geolocation
    country_code VARCHAR(10) DEFAULT 'AF',
    city TEXT,
    
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    user_agent TEXT,
    
    timestamp TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 9.2 Daily Rollup Cache (For instant analytics dashboards)
CREATE TABLE public.analytics_daily_rollups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    total_views INTEGER DEFAULT 0 NOT NULL,
    unique_visitors INTEGER DEFAULT 0 NOT NULL,
    nfc_taps INTEGER DEFAULT 0 NOT NULL,
    link_clicks INTEGER DEFAULT 0 NOT NULL,
    leads_captured INTEGER DEFAULT 0 NOT NULL,
    device_breakdown JSONB DEFAULT '{"mobile": 0, "desktop": 0, "tablet": 0}'::JSONB NOT NULL,
    country_breakdown JSONB DEFAULT '{}'::JSONB NOT NULL,
    city_breakdown JSONB DEFAULT '{}'::JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT unique_profile_daily_rollup UNIQUE (profile_id, report_date)
);

-- ==============================================================================
-- 10. INDEXES FOR LIGHTNING SPEED (TARGET < 1s LOAD TIME)
-- ==============================================================================

-- Profile fast resolution by alias (Critical for 3G Afghan mobile network)
CREATE UNIQUE INDEX idx_profiles_alias_lower ON public.profiles (LOWER(alias));
CREATE UNIQUE INDEX idx_profiles_custom_domain ON public.profiles (custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX idx_profiles_user_id ON public.profiles (user_id);
CREATE INDEX idx_profiles_org_id ON public.profiles (organization_id);
CREATE INDEX idx_profiles_active ON public.profiles (is_active) WHERE is_active = TRUE;

-- Links ordering
CREATE INDEX idx_profile_links_profile_order ON public.profile_links (profile_id, sort_order) WHERE is_active = TRUE;
CREATE INDEX idx_profile_links_safe ON public.profile_links (is_safe);

-- NFC lookup
CREATE UNIQUE INDEX idx_nfc_cards_uid ON public.nfc_cards (card_uid);
CREATE UNIQUE INDEX idx_nfc_cards_activation ON public.nfc_cards (activation_code);
CREATE INDEX idx_nfc_cards_assigned_profile ON public.nfc_cards (assigned_profile_id);

-- Analytics fast range scanning
CREATE INDEX idx_analytics_profile_timestamp ON public.analytics_events (profile_id, timestamp DESC);
CREATE INDEX idx_analytics_link_timestamp ON public.analytics_events (link_id, timestamp DESC);
CREATE INDEX idx_analytics_event_type ON public.analytics_events (event_type);

-- Leads by profile
CREATE INDEX idx_leads_profile_id ON public.leads (profile_id, created_at DESC);
CREATE INDEX idx_leads_org_id ON public.leads (organization_id, created_at DESC);

-- Orders
CREATE INDEX idx_orders_user_id ON public.ecom_orders (user_id, created_at DESC);
CREATE INDEX idx_orders_status ON public.ecom_orders (order_status);

-- ==============================================================================
-- 11. AUTOMATIC TRIGGERS & STORED PROCEDURES
-- ==============================================================================

-- 11.1 Universal Updated At Trigger Function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply updated_at triggers
CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_organizations_updated_at BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_profile_links_updated_at BEFORE UPDATE ON public.profile_links
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_leads_updated_at BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_nfc_cards_updated_at BEFORE UPDATE ON public.nfc_cards
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_ecom_products_updated_at BEFORE UPDATE ON public.ecom_products
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_ecom_orders_updated_at BEFORE UPDATE ON public.ecom_orders
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 11.2 Auto Provision User Profile on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    default_alias TEXT;
    alias_count INTEGER;
BEGIN
    -- Insert into public.users
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );

    -- Generate a clean unique alias based on username or email prefix
    default_alias := REGEXP_REPLACE(LOWER(SPLIT_PART(NEW.email, '@', 1)), '[^a-z0-9_]', '', 'g');
    IF default_alias = '' THEN
        default_alias := 'user_' || SUBSTRING(NEW.id::TEXT, 1, 8);
    END IF;

    SELECT COUNT(*) INTO alias_count FROM public.profiles WHERE alias = default_alias;
    IF alias_count > 0 THEN
        default_alias := default_alias || '_' || SUBSTRING(NEW.id::TEXT, 1, 4);
    END IF;

    -- Automatically create initial Personal Profile
    INSERT INTO public.profiles (
        user_id,
        alias,
        display_name,
        profile_type,
        bio
    )
    VALUES (
        NEW.id,
        default_alias,
        COALESCE(NEW.raw_user_meta_data->>'full_name', default_alias),
        'personal',
        'خوش آمدید! این پروفایل دیجیتال آریا لینک من است.'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 11.3 Atomically Increment Link Click Counter with Expiry & Cap Check
CREATE OR REPLACE FUNCTION public.record_link_click(target_link_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_is_active BOOLEAN;
    v_expires_at TIMESTAMPTZ;
    v_max_clicks INTEGER;
    v_current_clicks BIGINT;
BEGIN
    SELECT is_active, expires_at, max_clicks_allowed, click_count
    INTO v_is_active, v_expires_at, v_max_clicks, v_current_clicks
    FROM public.profile_links
    WHERE id = target_link_id;

    IF NOT FOUND OR NOT v_is_active THEN
        RETURN FALSE;
    END IF;

    -- Check expiration
    IF v_expires_at IS NOT NULL AND NOW() > v_expires_at THEN
        UPDATE public.profile_links SET is_active = FALSE WHERE id = target_link_id;
        RETURN FALSE;
    END IF;

    -- Check click cap
    IF v_max_clicks IS NOT NULL AND v_current_clicks >= v_max_clicks THEN
        UPDATE public.profile_links SET is_active = FALSE WHERE id = target_link_id;
        RETURN FALSE;
    END IF;

    -- Increment atomically
    UPDATE public.profile_links
    SET click_count = click_count + 1
    WHERE id = target_link_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 12. ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfc_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecom_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecom_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecom_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_rollups ENABLE ROW LEVEL SECURITY;

-- Helper security function to verify Super Admin status
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND system_role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper security function to verify Organization Admin status
CREATE OR REPLACE FUNCTION public.is_org_admin(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = org_id 
          AND user_id = auth.uid() 
          AND org_role IN ('b2b_org_admin', 'b2b_org_manager')
    ) OR public.is_super_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users Policies
CREATE POLICY "Users can view their own profile or public directory"
    ON public.users FOR SELECT
    USING (auth.uid() = id OR public.is_super_admin());

CREATE POLICY "Users can update their own account details"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Profiles Policies
CREATE POLICY "Public can view active profiles"
    ON public.profiles FOR SELECT
    USING (is_active = TRUE OR auth.uid() = user_id OR public.is_super_admin());

CREATE POLICY "Users can insert their own profiles"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profiles unless locked by org"
    ON public.profiles FOR UPDATE
    USING (
        auth.uid() = user_id OR 
        (organization_id IS NOT NULL AND public.is_org_admin(organization_id)) OR
        public.is_super_admin()
    );

CREATE POLICY "Users can delete their own profiles"
    ON public.profiles FOR DELETE
    USING (auth.uid() = user_id OR public.is_super_admin());

-- Profile Links Policies
CREATE POLICY "Public can view active safe links of active profiles"
    ON public.profile_links FOR SELECT
    USING (
        is_active = TRUE AND is_safe = TRUE OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = profile_links.profile_id AND profiles.user_id = auth.uid()
        ) OR public.is_super_admin()
    );

CREATE POLICY "Profile owners can insert and manage links"
    ON public.profile_links FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = profile_links.profile_id AND (
                profiles.user_id = auth.uid() OR 
                (profiles.organization_id IS NOT NULL AND public.is_org_admin(profiles.organization_id))
            )
        ) OR public.is_super_admin()
    );

-- Leads CRM Policies
CREATE POLICY "Anyone can submit a lead contact"
    ON public.leads FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Profile owners and Org Admins can read their leads"
    ON public.leads FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = leads.profile_id AND (
                profiles.user_id = auth.uid() OR
                (leads.organization_id IS NOT NULL AND public.is_org_admin(leads.organization_id))
            )
        ) OR public.is_super_admin()
    );

CREATE POLICY "Profile owners and Org Admins can update/archive leads"
    ON public.leads FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = leads.profile_id AND (
                profiles.user_id = auth.uid() OR
                (leads.organization_id IS NOT NULL AND public.is_org_admin(leads.organization_id))
            )
        ) OR public.is_super_admin()
    );

-- Organizations Policies
CREATE POLICY "Members and admins can view their organization"
    ON public.organizations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = organizations.id AND user_id = auth.uid()
        ) OR public.is_super_admin()
    );

CREATE POLICY "Org Admins can update organization profile"
    ON public.organizations FOR UPDATE
    USING (public.is_org_admin(id));

-- Products & Shop
CREATE POLICY "Active products are visible to all users"
    ON public.ecom_products FOR SELECT
    USING (is_active = TRUE OR public.is_super_admin());

CREATE POLICY "Only super admins can modify products"
    ON public.ecom_products FOR ALL
    USING (public.is_super_admin());

-- Orders Policies
CREATE POLICY "Users can view their own orders"
    ON public.ecom_orders FOR SELECT
    USING (auth.uid() = user_id OR public.is_super_admin());

CREATE POLICY "Users can create orders"
    ON public.ecom_orders FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can view order items of their own orders"
    ON public.ecom_order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.ecom_orders
            WHERE ecom_orders.id = ecom_order_items.order_id AND (
                ecom_orders.user_id = auth.uid() OR public.is_super_admin()
            )
        )
    );

-- Analytics Policies
CREATE POLICY "Public can log analytics events anonymously"
    ON public.analytics_events FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Profile owners and Org Admins can view analytics"
    ON public.analytics_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = analytics_events.profile_id AND (
                profiles.user_id = auth.uid() OR
                (profiles.organization_id IS NOT NULL AND public.is_org_admin(profiles.organization_id))
            )
        ) OR public.is_super_admin()
    );
