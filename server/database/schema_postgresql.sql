-- ============================================================================
-- AgroElevage Link — Schéma Complet Base de Données PostgreSQL
-- Production-Ready, Haute Performance, Multi-Utilisateurs & Séquestre Mobile Money
-- ============================================================================

-- 1. Extensions Requises
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Types ENUM Personnalisés
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('vendeur', 'acheteur', 'transporteur', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
        'EN_ATTENTE_PAIEMENT',
        'PAIEMENT_BLOQUE_ESCROW',
        'EN_PREPARATION',
        'EN_LIVRAISON',
        'LIVRE',
        'VALIDE_PAR_ACHETEUR',
        'FONDS_LIBERES',
        'LITIGE',
        'ANNULE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE escrow_status AS ENUM ('PENDING', 'HELD', 'RELEASED', 'REFUNDED', 'DISPUTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_operator AS ENUM ('MTN_MOMO', 'ORANGE_MONEY', 'CARTE_BANCAIRE', 'VIREMENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Fonction pour mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- TABLE: users (Comptes Utilisateurs, Agriculteurs, Acheteurs, Transporteurs)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    phone VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'vendeur',
    sub_role VARCHAR(60) DEFAULT 'agriculteur',
    avatar VARCHAR(500) DEFAULT 'assets/images/user-default.png',
    location VARCHAR(200) DEFAULT 'Yaoundé, Cameroun',
    region VARCHAR(100) DEFAULT 'Centre',
    latitude NUMERIC(10, 7) DEFAULT 3.8480000,
    longitude NUMERIC(10, 7) DEFAULT 11.5021000,
    wallet_balance NUMERIC(14, 2) DEFAULT 0.00 CHECK (wallet_balance >= 0),
    escrow_balance NUMERIC(14, 2) DEFAULT 0.00 CHECK (escrow_balance >= 0),
    is_verified BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    otp_code VARCHAR(10),
    otp_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE: product_categories (Catégories Normalisées)
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_categories (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(60) UNIQUE NOT NULL,
    label VARCHAR(100) NOT NULL,
    icon VARCHAR(60) DEFAULT 'leaf',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE: products (Catalogue & Récoltes Publiées par les Vendeurs)
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    seller_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(60) NOT NULL DEFAULT 'maraichage',
    description TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    unit VARCHAR(30) NOT NULL DEFAULT 'kg',
    stock_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    min_order_quantity NUMERIC(12, 2) DEFAULT 1 CHECK (min_order_quantity >= 0),
    location VARCHAR(200) DEFAULT 'Cameroun',
    latitude NUMERIC(10, 7) DEFAULT 3.8480000,
    longitude NUMERIC(10, 7) DEFAULT 11.5021000,
    image_url VARCHAR(500),
    is_organic BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    views_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE: orders (Commandes Marchandes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    buyer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    seller_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(14, 2) NOT NULL CHECK (subtotal >= 0),
    delivery_fee NUMERIC(12, 2) DEFAULT 0.00 CHECK (delivery_fee >= 0),
    commission_fee NUMERIC(12, 2) DEFAULT 0.00 CHECK (commission_fee >= 0),
    total_amount NUMERIC(14, 2) NOT NULL CHECK (total_amount >= 0),
    delivery_address TEXT NOT NULL,
    buyer_notes TEXT,
    status order_status NOT NULL DEFAULT 'EN_ATTENTE_PAIEMENT',
    payment_method VARCHAR(50) DEFAULT 'MTN_MOMO',
    payment_phone VARCHAR(30),
    tracking_code VARCHAR(100),
    paid_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE: escrow_transactions (Séquestre Financier Sécurisé Mobile Money)
-- ============================================================================
CREATE TABLE IF NOT EXISTS escrow_transactions (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    buyer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    seller_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    commission_fee NUMERIC(12, 2) DEFAULT 0.00 CHECK (commission_fee >= 0),
    status escrow_status NOT NULL DEFAULT 'HELD',
    payment_reference VARCHAR(120),
    payment_operator payment_operator DEFAULT 'MTN_MOMO',
    locked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    released_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE: escrow_disputes (Gestion des Litiges et Arbitrage)
-- ============================================================================
CREATE TABLE IF NOT EXISTS escrow_disputes (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    opened_by BIGINT NOT NULL REFERENCES users(id),
    reason TEXT NOT NULL,
    evidence_images TEXT[],
    resolution_status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, RESOLVED_SELLER, RESOLVED_BUYER
    admin_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE: notifications (Centre de Notifications Push / In-App)
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'system',
    reference_id VARCHAR(100),
    target_url VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE: ai_diagnostics (Diagnostique Agronomique & Vétérinaire NaturIA)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_diagnostics (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    target_type VARCHAR(50) NOT NULL, -- 'plante' ou 'animal'
    crop_or_animal VARCHAR(100),
    symptoms TEXT NOT NULL,
    image_url VARCHAR(500),
    diagnosis_title VARCHAR(255) NOT NULL,
    severity VARCHAR(30) DEFAULT 'moyen', -- 'faible', 'moyen', 'eleve', 'critique'
    recommendations TEXT NOT NULL,
    organic_treatment TEXT,
    conventional_treatment TEXT,
    preventive_measures TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE: chat_messages (Historique IA & Messagerie Instantanée)
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES DE PERFORMANCE & OPTIMISATION
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_product ON orders(product_id);

CREATE INDEX IF NOT EXISTS idx_escrow_order ON escrow_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON escrow_transactions(status);

CREATE INDEX IF NOT EXISTS idx_notifs_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_messages(session_id);
