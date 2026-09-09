-- ===================================================================
-- SCHÉMA DE BASE DE DONNÉES MYSQL / MARIADB POUR AGROELEVAGE LINK
-- ===================================================================

CREATE DATABASE IF NOT EXISTS `agroelevage_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `agroelevage_db`;

-- 1. Table des Utilisateurs
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NULL UNIQUE,
  `phone` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `location` VARCHAR(150) DEFAULT 'Yaoundé, Cameroun',
  `wallet_balance` DECIMAL(12,2) DEFAULT 0.00,
  `escrow_balance` DECIMAL(12,2) DEFAULT 0.00,
  `is_verified` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Table des Produits Marketplace
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `seller_id` INT NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  `unit` VARCHAR(50) DEFAULT 'kg',
  `stock_quantity` DECIMAL(10,2) DEFAULT 0,
  `location` VARCHAR(150) DEFAULT 'Cameroun',
  `image_url` VARCHAR(255) NULL,
  `is_available` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Table des Commandes
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `buyer_id` INT NOT NULL,
  `seller_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` DECIMAL(10,2) NOT NULL,
  `unit_price` DECIMAL(12,2) NOT NULL,
  `total_amount` DECIMAL(12,2) NOT NULL,
  `delivery_address` TEXT NOT NULL,
  `status` VARCHAR(50) DEFAULT 'EN_ATTENTE_PAIEMENT',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Table des Transactions Séquestre (Escrow)
CREATE TABLE IF NOT EXISTS `escrow_transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `buyer_id` INT NOT NULL,
  `seller_id` INT NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'HELD',
  `payment_operator` VARCHAR(50) DEFAULT 'MTN_MOMO',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Table des Notifications Utilisateurs
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(250) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(50) DEFAULT 'system',
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Données de Test Initiales (Compte Administrateur Principal)
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `location`) VALUES
(1, 'Kenfo Loic (Admin)', 'kenfoloic3@gmail.com', '+237693412317', '$2a$10$c7ZzP7mQvF5PZ0TfLw7n8O8oN8.sC3qW5eU8iO.p8E8aO.g3h4I5k', 'Yaoundé, Cameroun')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

INSERT INTO `products` (`id`, `seller_id`, `name`, `category`, `price`, `unit`, `stock_quantity`, `location`, `image_url`) VALUES
(1, 1, 'Tomates fraîches Roma (Cagettes 20kg)', 'maraichage', 12500.00, 'cagette', 120, 'Foumbot, Ouest', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500'),
(2, 2, 'Poulets Goliath fermiers vivants', 'elevage', 3500.00, 'u', 50, 'Bafoussam, Ouest', 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=500'),
(3, 3, 'Maïs Blanc Séché (Sacs 50kg)', 'cereales', 12000.00, 'sac', 300, 'Garoua, Nord', 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500'),
(4, 4, 'Poivre Blanc de Penja IGP (Sacs 5kg)', 'maraichage', 35000.00, 'sac', 45, 'Njombé-Penja, Moungo', 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500'),
(5, 5, 'Poivrons Verts & Jaunes Bio', 'maraichage', 850.00, 'kg', 150, 'Yaoundé, Cameroun', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500'),
(6, 1, 'Pommes de Terre de Dschang (Sacs 25kg)', 'tubercules', 8000.00, 'sac', 200, 'Dschang, Ouest', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500'),
(7, 4, 'Régimes de Banane Plantain Gros Michel', 'fruits', 4500.00, 'u', 90, 'Njombé, Moungo', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500'),
(8, 2, 'Ananas Pain de Sucre doux (Cartons 10kg)', 'fruits', 6000.00, 'carton', 110, 'Awae, Centre', 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=500'),
(9, 3, 'Bâtons de Manioc & Gari Blanc (Sacs 50kg)', 'tubercules', 14000.00, 'sac', 180, 'Sa\'a, Centre', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `price`=VALUES(`price`), `stock_quantity`=VALUES(`stock_quantity`);
