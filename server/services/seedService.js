const bcrypt = require('bcryptjs');
const db = require('../config/db');

function seedDatabase() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) {
    console.log('[Seed] Database already seeded.');
    return;
  }

  console.log('[Seed] Seeding database with initial AgroElevage data...');

  const salt = bcrypt.genSaltSync(10);
  const defaultPassword = bcrypt.hashSync('password123', salt);

  // 1. Insert Users
  const insertUser = db.prepare(`
    INSERT INTO users (phone, name, email, password, role, sub_role, location, latitude, longitude, wallet_balance, escrow_balance, is_verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  const paulId = insertUser.run(
    '+237690123456',
    'Paul Nguema',
    'paul.nguema@agroelevage.cm',
    defaultPassword,
    'vendeur',
    'agriculteur',
    'Foumbot, Ouest Cameroun',
    5.5097,
    10.6306,
    145000,
    35000
  ).lastInsertRowid;

  const marieId = insertUser.run(
    '+237691234567',
    'Marie Tchakounté',
    'marie.tchakounte@agroelevage.cm',
    defaultPassword,
    'vendeur',
    'eleveur',
    'Bafoussam, Ouest Cameroun',
    5.4777,
    10.4176,
    280000,
    50000
  ).lastInsertRowid;

  const ibrahimId = insertUser.run(
    '+237692345678',
    'Ibrahim Bello',
    'ibrahim.bello@agroelevage.cm',
    defaultPassword,
    'vendeur',
    'cooperative',
    'Garoua, Nord Cameroun',
    9.3013,
    13.3977,
    520000,
    0
  ).lastInsertRowid;

  const emmanuelId = insertUser.run(
    '+237693456789',
    'Emmanuel Manga',
    'emmanuel.manga@agroelevage.cm',
    defaultPassword,
    'vendeur',
    'agriculteur',
    'Njombé-Penja, Moungo',
    4.5833,
    9.6833,
    85000,
    25000
  ).lastInsertRowid;

  const alainBuyerId = insertUser.run(
    '+237670987654',
    'Chef Alain Mbarga (Restaurant Les Saveurs)',
    'alain.mbarga@saveurs.cm',
    defaultPassword,
    'acheteur',
    'restaurateur',
    'Bastos, Yaoundé',
    3.8828,
    11.5167,
    75000,
    60000
  ).lastInsertRowid;

  const sorepcoBuyerId = insertUser.run(
    '+237671876543',
    'SOREPCO Agro Distribution',
    'achats@sorepco-agro.cm',
    defaultPassword,
    'acheteur',
    'grossiste',
    'Akwa, Douala',
    4.0511,
    9.7679,
    450000,
    0
  ).lastInsertRowid;

  // 2. Insert Products
  const insertProduct = db.prepare(`
    INSERT INTO products (seller_id, name, category, description, price, unit, stock_quantity, min_order_quantity, location, latitude, longitude, image_url, is_organic, is_available)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  const p1 = insertProduct.run(
    paulId,
    'Tomates Fraîches de Foumbot (Cagette)',
    'maraichage',
    'Tomates fermes récoltées à maturité optimale, idéales pour restaurants, traiteurs et conservation. Variété Cobra F1 résistante et juteuse.',
    12500,
    'cagette 25kg',
    120,
    2,
    'Foumbot, Ouest',
    5.5097,
    10.6306,
    'assets/images/products/tomatoes.jpg',
    1
  ).lastInsertRowid;

  const p2 = insertProduct.run(
    emmanuelId,
    'Banane Plantain Gros Michel (Régime)',
    'tubercules',
    'Régimes de banane plantain bien fournis du Moungo. Doigts fermes, chair savoureuse pour braisé, chips ou pilé traditionnel.',
    4500,
    'régime',
    85,
    5,
    'Njombé, Moungo',
    4.5833,
    9.6833,
    'assets/images/products/plantain.jpg',
    1
  ).lastInsertRowid;

  const p3 = insertProduct.run(
    marieId,
    'Poulets Fermiers de Chair (Poids 2.2kg+)',
    'elevage',
    'Poulets élevés au maïs et aux graines naturelles, abattus ou vivants sur demande. Chair ferme et goût authentique.',
    3800,
    'tête',
    250,
    10,
    'Bafoussam, Ouest',
    5.4777,
    10.4176,
    'assets/images/products/chicken.jpg',
    0
  ).lastInsertRowid;

  const p4 = insertProduct.run(
    ibrahimId,
    'Sac de Maïs Jaune Séché 50kg',
    'cereales',
    'Maïs de première qualité soigneusement trié et séché au soleil de Garoua. Taux d humidité < 12%, parfait pour provenderie et meunerie.',
    17000,
    'sac 50kg',
    300,
    10,
    'Garoua, Nord',
    9.3013,
    13.3977,
    'assets/images/products/corn.jpg',
    0
  ).lastInsertRowid;

  const p5 = insertProduct.run(
    emmanuelId,
    'Sac de Manioc Blanc Frais 50kg',
    'tubercules',
    'Tubercules de manioc doux de terre riche. Idéal pour bâtons de manioc (Bobolo/Miondo), farine ou cossettes.',
    8000,
    'sac 50kg',
    150,
    3,
    'Penja, Moungo',
    4.5833,
    9.6833,
    'assets/images/products/cassava.jpg',
    1
  ).lastInsertRowid;

  const p6 = insertProduct.run(
    marieId,
    'Porc Charcutier Vivant (80-90kg)',
    'elevage',
    'Porcs en excellente santé nourris avec provende équilibrée et suivi vétérinaire strict. Poids moyen vérifié.',
    95000,
    'tête',
    20,
    1,
    'Bafoussam, Ouest',
    5.4777,
    10.4176,
    'assets/images/products/pig.jpg',
    0
  ).lastInsertRowid;

  const p7 = insertProduct.run(
    paulId,
    'Piment Rouge Extra Fort de Penja',
    'maraichage',
    'Piment rouge très aromatique et piquant, cultivé en terre volcanique. Idéal pour sauces et assaisonnements gastronomiques.',
    1500,
    'kg',
    60,
    5,
    'Penja, Littoral',
    4.5833,
    9.6833,
    'assets/images/products/pepper.jpg',
    1
  ).lastInsertRowid;

  const p8 = insertProduct.run(
    marieId,
    'Plateau de 30 Œufs Frais de Table (Calibre L)',
    'elevage',
    'Œufs extra-frais du jour, coquille solide, jaune doré naturel. Conditionnés en alvéoles renforcées.',
    2200,
    'plateau (30)',
    400,
    5,
    'Bafoussam, Ouest',
    5.4777,
    10.4176,
    'assets/images/products/eggs.jpg',
    0
  ).lastInsertRowid;

  // 3. Insert Demo Orders & Escrow Transactions
  const insertOrder = db.prepare(`
    INSERT INTO orders (order_number, buyer_id, seller_id, product_id, quantity, unit_price, subtotal, delivery_fee, commission_fee, total_amount, delivery_address, buyer_notes, status, payment_method, payment_phone, tracking_code, paid_at, shipped_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 days'), datetime('now', '-1 days'))
  `);

  const order1 = insertOrder.run(
    'CMD-2026-0801',
    alainBuyerId,
    paulId,
    p1,
    4,
    12500,
    50000,
    4000,
    1250,
    55250,
    'Restaurant Les Saveurs du Terroir, Rue Joseph Mballa Eloumden, Bastos, Yaoundé',
    'Livraison souhaitée avant 11h le matin svp.',
    'EXPEDIE',
    'MTN_MOMO',
    '+237670987654',
    'TRK-CMR-99482'
  ).lastInsertRowid;

  db.prepare(`
    INSERT INTO escrow_transactions (order_id, buyer_id, seller_id, amount, fee, status, payment_reference, payment_operator, locked_at)
    VALUES (?, ?, ?, ?, ?, 'HELD', 'MOMO-REF-88492019', 'MTN_MOMO', datetime('now', '-2 days'))
  `).run(order1, alainBuyerId, paulId, 55250, 1250);

  // 4. Insert Notifications
  const insertNotif = db.prepare(`
    INSERT INTO notifications (user_id, title, message, type, reference_id, is_read)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertNotif.run(
    alainBuyerId,
    'Commande expédiée 🚚',
    'Votre commande CMD-2026-0801 (Tomates de Foumbot) a été expédiée par Paul Nguema. Fonds sécurisés en séquestre.',
    'order',
    order1,
    0
  );

  insertNotif.run(
    paulId,
    'Séquestre confirmé 🔒',
    '55 250 FCFA sont sécurisés en séquestre pour votre commande CMD-2026-0801. Vous recevrez les fonds dès confirmation de livraison.',
    'escrow',
    order1,
    1
  );

  insertNotif.run(
    paulId,
    'Alerte Météo Ouest 🌦️',
    'Fortes pluies attendues dans la région de Foumbot ce week-end. Pensez à drainer vos parcelles maraîchères.',
    'system',
    null,
    0
  );

  // 5. Insert AI Diagnostics Samples
  db.prepare(`
    INSERT INTO ai_diagnostics (user_id, target_type, crop_or_animal, symptoms, diagnosis_title, severity, recommendations, organic_treatment, conventional_treatment, preventive_measures)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    paulId,
    'plante',
    'Tomate',
    'Taches brunes huileuses sur feuilles et tiges avec pourriture brune sur fruits verts.',
    'Mildiou de la Tomate (Phytophthora infestans)',
    'eleve',
    'Isoler les plants atteints immédiatement, éliminer les feuilles malades au sol et traiter.',
    'Pulvérisation de décoction de prêle ou purin d ortie, bouillie bordelaise dosée à 10g/L.',
    'Fongicide à base de Mancozèbe (2g/L) ou Diméthomorphe.',
    'Éviter l arrosage par aspersion sur le feuillage, espacer les plants pour une bonne aération, pailler le sol.'
  );

  console.log('[Seed] Database successfully seeded with demo data!');
}

module.exports = { seedDatabase };
