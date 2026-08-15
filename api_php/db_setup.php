<?php
/**
 * Initialisation automatique des tables de la Base de Données PHP
 */
require_once __DIR__ . '/config.php';

try {
    $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);

    if ($driver === 'sqlite') {
        $sql = "
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            phone TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            location TEXT DEFAULT 'Yaoundé, Cameroun',
            wallet_balance REAL DEFAULT 0.0,
            escrow_balance REAL DEFAULT 0.0,
            is_verified INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            seller_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            unit TEXT DEFAULT 'kg',
            stock_quantity REAL DEFAULT 0,
            location TEXT DEFAULT 'Cameroun',
            image_url TEXT,
            is_available INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number TEXT UNIQUE NOT NULL,
            buyer_id INTEGER NOT NULL,
            seller_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity REAL NOT NULL,
            unit_price REAL NOT NULL,
            total_amount REAL NOT NULL,
            delivery_address TEXT NOT NULL,
            status TEXT DEFAULT 'EN_ATTENTE_PAIEMENT',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        ";
    } else {
        $sql = file_get_contents(__DIR__ . '/schema.sql');
    }

    $pdo->exec($sql);

    echo json_encode([
        'success' => true,
        'message' => 'Base de données PHP (' . strtoupper($driver) . ') initialisée avec succès ! Toutes les tables sont prêtes.'
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur lors de l\'initialisation des tables : ' . $e->getMessage()
    ]);
}
?>
