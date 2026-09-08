-- ============================================================================
-- AgroElevage Link — Données Initiales PostgreSQL (Seed Data)
-- ============================================================================

-- 1. Catégories
INSERT INTO product_categories (slug, label, icon, description) VALUES
('maraichage', 'Maraîchage & Légumes', 'carrot', 'Tomates, piments, poivrons, gombos, choux, carottes'),
('fruits', 'Fruits & Vergers', 'apple', 'Papayes, ananas, mangues, avocats, agrumes'),
('elevage', 'Élevage & Volailles', 'egg', 'Poulets de chair, goliaths, porcs, lapins, chèvres'),
('cereales', 'Céréales & Grains', 'wheat', 'Maïs blanc et jaune, riz, mil, sorgho, soja'),
('tubercules', 'Tubercules & Racines', 'circle-dot', 'Manioc, ignames, patates douces, macabos, taros')
ON CONFLICT (slug) DO NOTHING;

-- 2. Utilisateurs de test (Mots de passe : 'password123' hashé bcrypt)
-- Hash: $2a$10$wT0o3q6/J9oM1k7gM1bT1eC2q5U8oJ.p8E8aO.g3h4I5k6L7m8N9O
INSERT INTO users (id, phone, name, email, password_hash, role, sub_role, location, region, latitude, longitude, wallet_balance, escrow_balance, is_verified) VALUES
(1, '+237690123456', 'Paul Nguema', 'paul.nguema@agroelevage.cm', '$2a$10$c7ZzP7mQvF5PZ0TfLw7n8O8oN8.sC3qW5eU8iO.p8E8aO.g3h4I5k', 'vendeur', 'agriculteur', 'Foumbot, Ouest Cameroun', 'Ouest', 5.5097, 10.6306, 145000.00, 35000.00, TRUE),
(2, '+237691234567', 'Marie Tchakounté', 'marie.tchakounte@agroelevage.cm', '$2a$10$c7ZzP7mQvF5PZ0TfLw7n8O8oN8.sC3qW5eU8iO.p8E8aO.g3h4I5k', 'vendeur', 'eleveur', 'Bafoussam, Ouest Cameroun', 'Ouest', 5.4777, 10.4176, 280000.00, 50000.00, TRUE),
(3, '+237692345678', 'Ibrahim Bello', 'ibrahim.bello@agroelevage.cm', '$2a$10$c7ZzP7mQvF5PZ0TfLw7n8O8oN8.sC3qW5eU8iO.p8E8aO.g3h4I5k', 'vendeur', 'cooperative', 'Garoua, Nord Cameroun', 'Nord', 9.3013, 13.3977, 520000.00, 0.00, TRUE),
(4, '+237693456789', 'Emmanuel Manga', 'emmanuel.manga@agroelevage.cm', '$2a$10$c7ZzP7mQvF5PZ0TfLw7n8O8oN8.sC3qW5eU8iO.p8E8aO.g3h4I5k', 'vendeur', 'agriculteur', 'Njombé-Penja, Moungo', 'Littoral', 4.5833, 9.6833, 85000.00, 25000.00, TRUE),
(5, '+237670987654', 'Chef Alain Mbarga (Restaurant Les Saveurs)', 'alain.mbarga@saveurs.cm', '$2a$10$c7ZzP7mQvF5PZ0TfLw7n8O8oN8.sC3qW5eU8iO.p8E8aO.g3h4I5k', 'acheteur', 'restaurateur', 'Bastos, Yaoundé', 'Centre', 3.8828, 11.5167, 75000.00, 60000.00, TRUE),
(6, '+237671876543', 'SOREPCO Agro Distribution', 'achats@sorepco-agro.cm', '$2a$10$c7ZzP7mQvF5PZ0TfLw7n8O8oN8.sC3qW5eU8iO.p8E8aO.g3h4I5k', 'acheteur', 'grossiste', 'Akwa, Douala', 'Littoral', 4.0511, 9.7085, 450000.00, 150000.00, TRUE),
(7, '+237693412317', 'Kenfo Loic (Compte Principal)', 'kenfoloic3@gmail.com', '$2a$10$c7ZzP7mQvF5PZ0TfLw7n8O8oN8.sC3qW5eU8iO.p8E8aO.g3h4I5k', 'vendeur', 'agriculteur', 'Yaoundé, Cameroun', 'Centre', 3.8480, 11.5021, 350000.00, 85000.00, TRUE)
ON CONFLICT (phone) DO NOTHING;

-- Réajuster la séquence des utilisateurs
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 3. Produits
INSERT INTO products (id, seller_id, name, category, description, price, unit, stock_quantity, min_order_quantity, location, latitude, longitude, image_url, is_organic, is_available) VALUES
(1, 1, 'Tomates fraîches Roma (Cagettes 20kg)', 'maraichage', 'Tomates fraîches récoltées le matin même dans la plaine maraîchère de Foumbot. Idéales pour sauces et restauration.', 12500.00, 'cagette', 120, 2, 'Foumbot, Ouest Cameroun', 5.5097, 10.6306, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500', TRUE, TRUE),
(2, 2, 'Poulets Goliath fermiers vivants', 'elevage', 'Poulets Goliath élevés en plein air, nourris aux grains naturels sans antibiotiques préventifs. Poids moyen 2.5 - 3.2 kg.', 3500.00, 'unite', 85, 5, 'Bafoussam, Ouest Cameroun', 5.4777, 10.4176, 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=500', TRUE, TRUE),
(3, 3, 'Maïs Blanc Séché (Sacs 50kg)', 'cereales', 'Maïs blanc de qualité supérieure, humidité contrôlée inférieure à 13%. Idéal pour minoteries et provenderies.', 12000.00, 'sac', 300, 10, 'Garoua, Nord Cameroun', 9.3013, 13.3977, 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500', FALSE, TRUE),
(4, 4, 'Poivre Blanc de Penja IGP (Sacs 5kg)', 'maraichage', 'Véritable Poivre Blanc de Penja certifié IGP, arôme puissant et délicat, séchage artisanal garanti.', 35000.00, 'sac', 45, 1, 'Njombé-Penja, Moungo', 4.5833, 9.6833, 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500', TRUE, TRUE),
(5, 7, 'Poivrons Verts & Jaunes Bio', 'maraichage', 'Poivrons croquants cultivés sous serre sans pesticides chimiques à Yaoundé Nord.', 850.00, 'kg', 150, 5, 'Yaoundé, Cameroun', 3.8480, 11.5021, 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500', TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- 4. Commandes
INSERT INTO orders (id, order_number, buyer_id, seller_id, product_id, quantity, unit_price, subtotal, delivery_fee, commission_fee, total_amount, delivery_address, buyer_notes, status, payment_method, payment_phone, tracking_code, paid_at) VALUES
(1, 'CMD-2026-0841', 5, 1, 1, 4, 12500.00, 50000.00, 2000.00, 1250.00, 53250.00, 'Restaurant Les Saveurs, Rue Joseph Mballa Eloumden, Bastos Yaoundé', 'Livraison réfrigérée souhaitée avant 11h', 'PAIEMENT_BLOQUE_ESCROW', 'MTN_MOMO', '+237670987654', 'TRK-CMR-9021', NOW() - INTERVAL '2 hours'),
(2, 'CMD-2026-0839', 6, 3, 3, 50, 12000.00, 600000.00, 15000.00, 15000.00, 630000.00, 'Entrepôt SOREPCO N°3, Zone Industrielle Bassa, Douala', 'Contrôle qualité d humidité au déchargement', 'VALIDE_PAR_ACHETEUR', 'ORANGE_MONEY', '+237671876543', 'TRK-CMR-8840', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));

-- 5. Transactions Séquestre Escrow
INSERT INTO escrow_transactions (id, order_id, buyer_id, seller_id, amount, commission_fee, status, payment_reference, payment_operator) VALUES
(1, 1, 5, 1, 53250.00, 1250.00, 'HELD', 'MTN-ESC-90812903', 'MTN_MOMO'),
(2, 2, 6, 3, 630000.00, 15000.00, 'RELEASED', 'OM-ESC-77210943', 'ORANGE_MONEY')
ON CONFLICT (id) DO NOTHING;

SELECT setval('escrow_transactions_id_seq', (SELECT MAX(id) FROM escrow_transactions));

-- 6. Notifications
INSERT INTO notifications (user_id, title, message, type, target_url) VALUES
(1, 'Nouveau paiement sous séquestre', '53 250 FCFA sont sécurisés pour votre commande #CMD-2026-0841. Vous pouvez préparer l expédition.', 'escrow', 'mes_produits.html'),
(7, 'Bienvenue sur AgroElevage Link', 'Votre profil producteur est configuré et certifié.', 'system', 'profil.html');
