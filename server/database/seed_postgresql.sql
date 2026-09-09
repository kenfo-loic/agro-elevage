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

-- 2. Utilisateur Administrateur Principal Unique (Email: agro2026elevage@gmail.com / Mot de passe: agroagroagro)
INSERT INTO users (id, phone, name, email, password_hash, role, sub_role, location, region, latitude, longitude, wallet_balance, escrow_balance, is_verified) VALUES
(1, '+237693412317', 'Administrateur Principal', 'agro2026elevage@gmail.com', '$2a$10$c7ZzP7mQvF5PZ0TfLw7n8O8oN8.sC3qW5eU8iO.p8E8aO.g3h4I5k', 'admin', 'administrateur', 'Yaoundé, Cameroun', 'Centre', 3.8480, 11.5021, 350000.00, 85000.00, TRUE)
ON CONFLICT (phone) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role;

-- Réajuster la séquence des utilisateurs
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 3. Produits (9 Produits du Catalogue Marketplace)
INSERT INTO products (id, seller_id, name, category, description, price, unit, stock_quantity, min_order_quantity, location, latitude, longitude, image_url, is_organic, is_available) VALUES
(1, 1, 'Tomates fraîches Roma (Cagettes 20kg)', 'maraichage', 'Tomates fraîches récoltées le matin même dans la plaine maraîchère de Foumbot. Idéales pour sauces et restauration.', 12500.00, 'cagette', 120, 2, 'Foumbot, Ouest Cameroun', 5.5097, 10.6306, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500', TRUE, TRUE),
(2, 2, 'Poulets Goliath fermiers vivants', 'elevage', 'Poulets Goliath élevés en plein air, nourris aux grains naturels sans antibiotiques préventifs. Poids moyen 2.5 - 3.2 kg.', 3500.00, 'u', 50, 5, 'Bafoussam, Ouest Cameroun', 5.4777, 10.4176, 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=500', TRUE, TRUE),
(3, 3, 'Maïs Blanc Séché (Sacs 50kg)', 'cereales', 'Maïs blanc de qualité supérieure, humidité contrôlée inférieure à 13%. Idéal pour minoteries et provenderies.', 12000.00, 'sac', 300, 10, 'Garoua, Nord Cameroun', 9.3013, 13.3977, 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500', FALSE, TRUE),
(4, 4, 'Poivre Blanc de Penja IGP (Sacs 5kg)', 'maraichage', 'Véritable Poivre Blanc de Penja certifié IGP, arôme puissant et délicat, séchage artisanal garanti.', 35000.00, 'sac', 45, 1, 'Njombé-Penja, Moungo', 4.5833, 9.6833, 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500', TRUE, TRUE),
(5, 7, 'Poivrons Verts & Jaunes Bio', 'maraichage', 'Poivrons croquants cultivés sous serre sans pesticides chimiques à Yaoundé Nord.', 850.00, 'kg', 150, 5, 'Yaoundé, Cameroun', 3.8480, 11.5021, 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500', TRUE, TRUE),
(6, 1, 'Pommes de Terre de Dschang (Sacs 25kg)', 'tubercules', 'Pommes de terre fraîches récoltées sur les hauts plateaux de l Ouest Dschang, texture ferme.', 8000.00, 'sac', 200, 2, 'Dschang, Ouest Cameroun', 5.4437, 10.0533, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500', TRUE, TRUE),
(7, 4, 'Régimes de Banane Plantain Gros Michel', 'fruits', 'Bananes plantains mûres à point ou vertes pour braisage et friture, production naturelle du Moungo.', 4500.00, 'u', 90, 3, 'Njombé, Moungo', 4.5833, 9.6833, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500', TRUE, TRUE),
(8, 2, 'Ananas Pain de Sucre doux (Cartons 10kg)', 'fruits', 'Ananas très sucrés, juteux et parfumés, sans traitement chimique post-récolte.', 6000.00, 'carton', 110, 2, 'Awae, Centre Cameroun', 3.9000, 11.8333, 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=500', TRUE, TRUE),
(9, 3, 'Bâtons de Manioc & Gari Blanc (Sacs 50kg)', 'tubercules', 'Farine de manioc et gari blanc fermenté artisanalement, séchage solaire garanti sans sable.', 14000.00, 'sac', 180, 5, 'Sa a, Centre Cameroun', 4.3667, 11.4500, 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', TRUE, TRUE)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  unit = EXCLUDED.unit,
  stock_quantity = EXCLUDED.stock_quantity,
  location = EXCLUDED.location,
  image_url = EXCLUDED.image_url;

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
