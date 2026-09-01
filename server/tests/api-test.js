const http = require('http');
const app = require('../app');
const { seedDatabase } = require('../services/seedService');

let server;
let PORT = 0;
let BASE_URL = '';

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const parsed = new URL(url);
    
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (options.body) {
      if (!reqOptions.headers['Content-Type']) {
        reqOptions.headers['Content-Type'] = 'application/json';
      }
    }

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log(' LANCEMENT DES TESTS D\'INTÉGRATION BACK-END AGROELEVAGE');
  console.log('====================================================');

  try {
    seedDatabase();
  } catch (e) {
    console.log('Seed note:', e.message);
  }

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      PORT = server.address().port;
      BASE_URL = `http://localhost:${PORT}/api`;
      console.log(`[Test Server] Prêt sur le port ${PORT}`);
      resolve();
    });
  });

  let testsPassed = 0;
  let testsFailed = 0;

  function assert(condition, testName, extra = '') {
    if (condition) {
      console.log(`   [PASS] ${testName}`);
      testsPassed++;
    } else {
      console.error(`   [FAIL] ${testName} ${extra}`);
      testsFailed++;
    }
  }

  try {
    // Test 1: API Root
    console.log('\n1. Test Route Racine & Santé API');
    const rootRes = await request('');
    assert(rootRes.status === 200 && rootRes.data.success === true, 'GET /api retourne le statut OK');

    // Test 2: Login Vendeur
    console.log('\n2. Test Authentification (Login Vendeur & Acheteur)');
    const loginSellerRes = await request('/auth/login', {
      method: 'POST',
      body: { phone: '+237690123456', password: 'password123' }
    });
    assert(loginSellerRes.status === 200 && !!loginSellerRes.data.token, 'Login Vendeur réussi avec token JWT');
    const sellerToken = loginSellerRes.data?.token;

    // Test 3: Login Acheteur
    const loginBuyerRes = await request('/auth/login', {
      method: 'POST',
      body: { phone: '+237670987654', password: 'password123' }
    });
    assert(loginBuyerRes.status === 200 && !!loginBuyerRes.data.token, 'Login Acheteur réussi avec token JWT');
    const buyerToken = loginBuyerRes.data?.token;

    // Test 4: Register New User
    console.log('\n3. Test Inscription Nouvel Utilisateur');
    const testPhone = `+237699${Math.floor(100000 + Math.random() * 900000)}`;
    const regRes = await request('/auth/register', {
      method: 'POST',
      body: {
        phone: testPhone,
        name: 'Testeur Agro',
        password: 'password123',
        role: 'acheteur',
        location: 'Douala, Cameroun'
      }
    });
    assert(regRes.status === 201 && regRes.data.success === true, 'Inscription nouvel utilisateur');

    // Test 5: Products Marketplace
    console.log('\n4. Test Marketplace & Produits');
    const productsRes = await request('/products');
    assert(productsRes.status === 200 && productsRes.data.products.length > 0, `Marketplace liste ${productsRes.data.products.length} produits`);

    // Test 6: Filter by category
    const catRes = await request('/products?category=maraichage');
    assert(catRes.status === 200 && catRes.data.products.length > 0, 'Filtre produits catégorie maraichage');

    // Test 7: Create Product (Seller)
    console.log('\n5. Test Création de Produit (Vendeur)');
    const createProdRes = await request('/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sellerToken}` },
      body: {
        name: 'Avocats Pur Beurre du Moungo',
        category: 'fruits',
        description: 'Avocats savoureux récoltés à maturité.',
        price: 2500,
        unit: 'cagette',
        stock_quantity: 40,
        min_order_quantity: 2,
        location: 'Penja'
      }
    });
    assert(createProdRes.status === 201 && createProdRes.data.product.name.includes('Avocats'), 'Création de produit par le vendeur');
    const createdProductId = createProdRes.data.product.id;

    // Test 8: Passer Commande
    console.log('\n6. Test Commande & Flux de Séquestre (Escrow)');
    const orderRes = await request('/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${buyerToken}` },
      body: {
        product_id: createdProductId,
        quantity: 4,
        delivery_address: 'Bastos, Yaoundé',
        buyer_notes: 'Appeler à l arrivée svp',
        delivery_fee: 2500
      }
    });
    assert(orderRes.status === 201 && orderRes.data.order.status === 'EN_ATTENTE_PAIEMENT', 'Création de commande (Statut: EN_ATTENTE_PAIEMENT)');
    const testOrderId = orderRes.data.order.id;

    // Test 9: Paiement Séquestre Mobile Money
    console.log('\n7. Test Paiement Séquestre Mobile Money (MTN MoMo)');
    const escrowPayRes = await request('/escrow/pay', {
      method: 'POST',
      headers: { Authorization: `Bearer ${buyerToken}` },
      body: {
        order_id: testOrderId,
        payment_operator: 'MTN_MOMO',
        payment_phone: '+237670987654'
      }
    });
    assert(escrowPayRes.status === 200 && escrowPayRes.data.data.status === 'FONDS_BLOQUES_SEQUESTRE', 'Paiement Escrow validé (Fonds bloqués en séquestre)');

    // Test 10: Expédition Vendeur
    console.log('\n8. Test Expédition par le Vendeur');
    const shipRes = await request('/escrow/ship', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sellerToken}` },
      body: {
        order_id: testOrderId,
        tracking_code: 'TRK-TEST-7788'
      }
    });
    assert(shipRes.status === 200 && shipRes.data.data.status === 'EXPEDIE', 'Vendeur marque la commande comme EXPEDIE');

    // Test 11: Confirmation Réception Acheteur & Déblocage des Fonds
    console.log('\n9. Test Confirmation Livraison & Libération des Fonds');
    const releaseRes = await request('/escrow/release', {
      method: 'POST',
      headers: { Authorization: `Bearer ${buyerToken}` },
      body: {
        order_id: testOrderId
      }
    });
    assert(releaseRes.status === 200 && releaseRes.data?.data?.status === 'FONDS_LIBERES', 'Acheteur valide la réception -> Fonds libérés vers le vendeur', JSON.stringify(releaseRes.data));

    // Test 12: Portefeuille Vendeur
    console.log('\n10. Test Consultation Portefeuille');
    const walletRes = await request('/escrow/wallet', {
      headers: { Authorization: `Bearer ${sellerToken}` }
    });
    assert(walletRes.status === 200 && walletRes.data.wallet.availableBalance > 0, 'Solde disponible du vendeur crédité avec succès');

    // Test 13: Géolocalisation
    console.log('\n11. Test Géolocalisation & Cartographie');
    const geoProducers = await request('/geo/producers');
    assert(geoProducers.status === 200 && geoProducers.data.producers.length > 0, 'Liste des producteurs géolocalisés');

    const geoMarkets = await request('/geo/markets');
    assert(geoMarkets.status === 200 && geoMarkets.data.markets.length > 0, 'Liste des hubs et marchés régionaux');

    // Test 14: NaturIA Chat & Diagnostic
    console.log('\n12. Test NaturIA IA (Chatbot & Diagnostic)');
    const aiChatRes = await request('/ai/chat', {
      method: 'POST',
      body: { message: 'Quels sont les traitements bio contre le mildiou de la tomate ?' }
    });
    assert(aiChatRes.status === 200 && aiChatRes.data.reply.length > 20, 'NaturIA Chat répond avec expertise agronomique');

    const aiDiagRes = await request('/ai/diagnose', {
      method: 'POST',
      body: {
        target_type: 'animal',
        crop_or_animal: 'Poulets de chair',
        symptoms: 'Fientes rouges sanguinolentes, poussins prostrés'
      }
    });
    assert(aiDiagRes.status === 200 && aiDiagRes.data.diagnosis.diagnosis_title.includes('Coccidiose'), 'NaturIA Diagnostic identifie avec succès la Coccidiose');

    // Test 15: Notifications
    console.log('\n13. Test Notifications');
    const notifsRes = await request('/notifications', {
      headers: { Authorization: `Bearer ${sellerToken}` }
    });
    assert(notifsRes.status === 200 && Array.isArray(notifsRes.data.notifications), 'Récupération des notifications utilisateur');

    // Test 16: Analytics Tableaux de Bord
    console.log('\n14. Test Tableaux de Bord Vendeur & Acheteur');
    const sellerAnalytics = await request('/analytics/seller', {
      headers: { Authorization: `Bearer ${sellerToken}` }
    });
    assert(sellerAnalytics.status === 200 && sellerAnalytics.data.summary.totalProducts > 0, 'Analytics Tableau Vendeur calculées');

    const buyerAnalytics = await request('/analytics/buyer', {
      headers: { Authorization: `Bearer ${buyerToken}` }
    });
    assert(buyerAnalytics.status === 200, 'Analytics Tableau Acheteur calculées');

  } catch (error) {
    console.error('Erreur inattendue durant les tests:', error);
    testsFailed++;
  } finally {
    if (server) {
      server.close(() => {
        console.log('\n====================================================');
        console.log(` RÉSULTAT FINAL DES TESTS : ${testsPassed} PASSÉ(S) / ${testsFailed} ÉCHOUÉ(S)`);
        console.log('====================================================');
        if (testsFailed > 0) process.exit(1);
      });
    }
  }
}

runTests();
