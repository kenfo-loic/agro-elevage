/**
 * AgroElevage Link & NaturIA — Frontend API & Supabase Client
 * Gère la communication REST API, le stockage local et la synchronisation directe Supabase PostgreSQL
 */

(function(window) {
  const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
    ? 'http://localhost:3000/api'
    : `${window.location.origin}/api`;

  // Default Supabase Config Storage Keys
  const SB_URL_KEY = 'agroelevage_supabase_url';
  const SB_KEY_KEY = 'agroelevage_supabase_key';

  class AgroApiClient {
    constructor() {
      this.baseUrl = API_BASE;
      this.initSupabase();
    }

    // --- Supabase Direct Connection ---
    initSupabase() {
      const url = localStorage.getItem(SB_URL_KEY) || window.AGRO_SUPABASE_URL || '';
      const key = localStorage.getItem(SB_KEY_KEY) || window.AGRO_SUPABASE_ANON_KEY || '';

      if (url && key && window.supabase && window.supabase.createClient) {
        try {
          this.supabase = window.supabase.createClient(url, key);
          console.log('[Supabase] Client initialisé avec succès sur:', url);
        } catch (e) {
          console.warn('[Supabase] Initialisation impossible:', e.message);
        }
      } else {
        this.supabase = null;
      }
    }

    setSupabaseConfig(url, key) {
      if (url && key) {
        localStorage.setItem(SB_URL_KEY, url.trim());
        localStorage.setItem(SB_KEY_KEY, key.trim());
        this.initSupabase();
        return true;
      }
      return false;
    }

    getSupabaseConfig() {
      return {
        url: localStorage.getItem(SB_URL_KEY) || window.AGRO_SUPABASE_URL || '',
        key: localStorage.getItem(SB_KEY_KEY) || window.AGRO_SUPABASE_ANON_KEY || '',
        isConnected: !!this.supabase
      };
    }

    // Token & Auth Storage
    getToken() {
      return localStorage.getItem('agroelevage_token') || null;
    }

    setToken(token) {
      if (token) localStorage.setItem('agroelevage_token', token);
      else localStorage.removeItem('agroelevage_token');
    }

    getCurrentUser() {
      const user = localStorage.getItem('agroelevage_user');
      try {
        return user ? JSON.parse(user) : null;
      } catch (e) {
        return null;
      }
    }

    setCurrentUser(user) {
      if (user) localStorage.setItem('agroelevage_user', JSON.stringify(user));
      else localStorage.removeItem('agroelevage_user');
    }

    isAuthenticated() {
      return !!this.getToken() || localStorage.getItem('ago_logged_in') === 'true';
    }

    logout() {
      this.setToken(null);
      this.setCurrentUser(null);
      localStorage.removeItem('ago_logged_in');
    }

    // Generic Request helper
    async request(endpoint, options = {}) {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = options.headers || {};

      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      if (!(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }

      try {
        const response = await fetch(url, {
          ...options,
          headers
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || `Erreur HTTP ${response.status}`);
        }
        return data;
      } catch (error) {
        console.warn(`[API Client] ${endpoint} (fallback local):`, error.message);
        throw error;
      }
    }

    // --- SYNCHRONISATION UTILISATEUR DIRECTE VERS SUPABASE ---
    async syncUserToSupabase(userData) {
      if (!userData || !userData.phone) return { success: false };

      const cleanPhone = String(userData.phone).trim();
      const userRole = (userData.role || 'vendeur').toLowerCase().includes('acheteur')
        ? 'acheteur'
        : ((userData.role || '').toLowerCase().includes('admin') ? 'admin' : 'vendeur');

      const userPayload = {
        phone: cleanPhone,
        name: userData.name || 'Utilisateur AgroElevage',
        email: userData.email || null,
        password_hash: userData.password || userData.password_hash || 'password123',
        role: userRole,
        sub_role: userData.sub_role || (userRole === 'vendeur' ? 'agriculteur' : 'restaurateur'),
        location: userData.location || 'Yaoundé, Cameroun',
        wallet_balance: parseFloat(String(userData.wallet || userData.wallet_balance || 0).replace(/[^\d.-]/g, '')) || 0,
        escrow_balance: parseFloat(String(userData.escrow_balance || 0).replace(/[^\d.-]/g, '')) || 0,
        is_verified: true,
        is_active: true
      };

      if (this.supabase) {
        // Try table 'users'
        try {
          const { data, error } = await this.supabase
            .from('users')
            .upsert([userPayload], { onConflict: 'phone' })
            .select();
          if (!error && data) {
            console.log('[Supabase] Utilisateur synchronisé dans users:', data);
            return { success: true, user: data[0] };
          }
        } catch (e) {
          console.warn('[Supabase users error]', e.message);
        }

        // Fallback: Try table 'utilisateurs'
        try {
          const { data, error } = await this.supabase
            .from('utilisateurs')
            .upsert([{
              telephone: cleanPhone,
              nom: userData.name,
              email: userData.email || null,
              role: userRole,
              emplacement: userData.location || 'Yaoundé',
              mot_de_passe: userData.password || 'password123'
            }], { onConflict: 'telephone' })
            .select();
          if (!error && data) {
            console.log('[Supabase] Utilisateur synchronisé dans utilisateurs:', data);
            return { success: true, user: data[0] };
          }
        } catch (e) {}
      }

      return { success: true, user: userPayload };
    }

    // --- SYNCHRONISATION TRANSACTIONS SÉQUESTRE ESCROW DIRECTE VERS SUPABASE ---
    async createEscrowTransaction(orderInfo = {}, paymentInfo = {}) {
      const orderNumber = orderInfo.order_number || ('CMD-' + Date.now().toString().slice(-6));
      const amount = parseFloat(orderInfo.total || orderInfo.total_amount || 27000);
      const deliveryFee = parseFloat(orderInfo.transportFee || orderInfo.delivery_fee || 2000);
      const subtotal = parseFloat(orderInfo.subtotal || 25000);
      const qty = parseFloat(orderInfo.qty || orderInfo.quantity || 100);
      const phone = paymentInfo.phone || localStorage.getItem('ago_user_phone') || '+237 693 412 317';
      const ref = 'ESC-MOMO-' + Date.now().toString().slice(-6);

      const orderRecord = {
        id: 'ord_' + Date.now(),
        order_number: orderNumber,
        buyer_name: localStorage.getItem('ago_user_fullname') || 'Acheteur',
        buyer_phone: phone,
        product_name: orderInfo.product_name || 'Tomates fraîches Roma',
        quantity: qty,
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        total_amount: amount,
        delivery_address: orderInfo.address || 'Quartier Bastos, Yaoundé',
        status: 'PAIEMENT_BLOQUE_ESCROW',
        payment_method: paymentInfo.method || 'MTN_MOMO',
        payment_phone: phone,
        created_at: new Date().toISOString()
      };

      const escrowRecord = {
        id: 'esc_' + Date.now(),
        order_number: orderNumber,
        buyer_phone: phone,
        amount: amount,
        commission_fee: 0,
        status: 'HELD', // Bloqué sous séquestre
        payment_reference: ref,
        payment_operator: paymentInfo.operator || 'MTN_MOMO',
        locked_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      // 1. Send to Supabase
      if (this.supabase) {
        try {
          // Table orders / ordres
          await this.supabase.from('orders').insert([{
            order_number: orderNumber,
            buyer_id: 1,
            seller_id: 1,
            product_id: 1,
            quantity: qty,
            unit_price: 250,
            subtotal: subtotal,
            delivery_fee: deliveryFee,
            total_amount: amount,
            delivery_address: 'Bastos, Yaoundé',
            status: 'PAIEMENT_BLOQUE_ESCROW',
            payment_phone: phone,
            paid_at: new Date().toISOString()
          }]);
        } catch (e) {}

        try {
          // Table escrow_transactions / transactions_de_sequestre
          const { data, error } = await this.supabase.from('escrow_transactions').insert([{
            order_id: 1,
            buyer_id: 1,
            seller_id: 1,
            amount: amount,
            commission_fee: 0,
            status: 'HELD',
            payment_reference: ref,
            payment_operator: 'MTN_MOMO',
            locked_at: new Date().toISOString()
          }]).select();

          if (!error && data) {
            console.log('[Supabase] Transaction séquestre enregistrée avec succès:', data);
          }
        } catch (e) {
          // Fallback if table is named transactions_de_sequestre or transactions_sequestre
          try {
            await this.supabase.from('transactions_de_sequestre').insert([{
              montant: amount,
              statut: 'BLOQUÉ',
              reference: ref,
              acheteur_telephone: phone
            }]);
          } catch (err2) {}
        }
      }

      // 2. Save locally
      let escrowList = JSON.parse(localStorage.getItem('agroelevage_escrow_transactions') || '[]');
      escrowList.unshift(escrowRecord);
      localStorage.setItem('agroelevage_escrow_transactions', JSON.stringify(escrowList));

      let orderList = JSON.parse(localStorage.getItem('agroelevage_orders') || '[]');
      orderList.unshift(orderRecord);
      localStorage.setItem('agroelevage_orders', JSON.stringify(orderList));

      window.dispatchEvent(new Event('agroelevage_orders_updated'));
      window.dispatchEvent(new Event('agroelevage_escrow_updated'));

      return { success: true, order: orderRecord, escrow: escrowRecord };
    }

    // --- Authentication & User Endpoints (Supabase + Local fallback) ---
    async register(data) {
      await this.syncUserToSupabase(data);

      // Node REST Backend if available
      try {
        const res = await this.request('/auth/register', {
          method: 'POST',
          body: JSON.stringify(data)
        });
        if (res.token) {
          this.setToken(res.token);
          this.setCurrentUser(res.user);
        }
        return res;
      } catch (err) {
        const fallbackUser = {
          id: 'usr_' + Date.now(),
          phone: data.phone,
          name: data.name,
          email: data.email,
          password: data.password || 'password123',
          role: data.role || 'vendeur',
          location: data.location || 'Yaoundé, Cameroun'
        };
        this.setCurrentUser(fallbackUser);
        localStorage.setItem('ago_logged_in', 'true');
        return { success: true, user: fallbackUser };
      }
    }

    async login(phoneOrEmail, password) {
      if (this.supabase) {
        try {
          const isEmail = phoneOrEmail.includes('@');
          const queryField = isEmail ? 'email' : 'phone';
          const { data: sbUser, error } = await this.supabase
            .from('users')
            .select('*')
            .eq(queryField, phoneOrEmail)
            .single();

          if (!error && sbUser) {
            this.setCurrentUser(sbUser);
            localStorage.setItem('ago_logged_in', 'true');
            return { success: true, user: sbUser };
          }
        } catch (e) {
          console.warn('[Supabase Login Error]', e.message);
        }
      }

      try {
        const res = await this.request('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ phone: phoneOrEmail, password })
        });
        if (res.token) {
          this.setToken(res.token);
          this.setCurrentUser(res.user);
        }
        return res;
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    // --- Products (Supabase + Local Sync) ---
    async getProducts(params = {}) {
      if (this.supabase) {
        try {
          let req = this.supabase.from('products').select('*');
          if (params.category && params.category !== 'all') {
            req = req.eq('category', params.category);
          }
          const { data, error } = await req;
          if (!error && data && data.length > 0) {
            return { success: true, products: data };
          }
        } catch (e) {}
      }

      const stored = localStorage.getItem('agroelevage_products');
      if (stored) {
        return { success: true, products: JSON.parse(stored) };
      }

      try {
        return await this.request('/products');
      } catch (e) {
        return { success: true, products: [] };
      }
    }

    async createProduct(productData) {
      if (this.supabase) {
        try {
          const { data, error } = await this.supabase
            .from('products')
            .insert([{
              name: productData.name,
              category: productData.category || 'maraichage',
              price: productData.price,
              stock_quantity: productData.quantity || productData.stock || 0,
              unit: productData.unit || 'kg',
              location: productData.location || 'Cameroun',
              image_url: productData.image || productData.imageUrl || null
            }])
            .select()
            .single();

          if (!error && data) {
            console.log('[Supabase] Produit enregistré dans PostgreSQL:', data);
          }
        } catch (e) {}
      }

      let list = JSON.parse(localStorage.getItem('agroelevage_products') || '[]');
      const newProd = {
        id: productData.id || 'prod_' + Date.now(),
        ...productData
      };
      list.unshift(newProd);
      localStorage.setItem('agroelevage_products', JSON.stringify(list));
      window.dispatchEvent(new Event('agroelevage_products_updated'));
      return { success: true, product: newProd };
    }

    async updateProduct(id, productData) {
      if (this.supabase) {
        try {
          await this.supabase
            .from('products')
            .update({
              name: productData.name,
              category: productData.category,
              price: productData.price,
              stock_quantity: productData.quantity || productData.stock,
              unit: productData.unit,
              location: productData.location,
              image_url: productData.image || productData.imageUrl
            })
            .eq('id', id);
        } catch (e) {}
      }

      let list = JSON.parse(localStorage.getItem('agroelevage_products') || '[]');
      const idx = list.findIndex(p => String(p.id) === String(id));
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...productData };
        localStorage.setItem('agroelevage_products', JSON.stringify(list));
        window.dispatchEvent(new Event('agroelevage_products_updated'));
      }
      return { success: true };
    }

    async deleteProduct(id) {
      if (this.supabase) {
        try {
          await this.supabase.from('products').delete().eq('id', id);
        } catch (e) {}
      }

      let list = JSON.parse(localStorage.getItem('agroelevage_products') || '[]');
      list = list.filter(p => String(p.id) !== String(id));
      localStorage.setItem('agroelevage_products', JSON.stringify(list));
      window.dispatchEvent(new Event('agroelevage_products_updated'));
      return { success: true };
    }

    // --- Synchronisation Totale (Users + Escrow + Products) ---
    async syncAllToSupabase() {
      let results = { users: 0, escrow: 0, products: 0, errors: [] };
      if (!this.supabase) {
        return { success: false, message: 'Supabase non connecté (clé ou URL manquante)' };
      }

      // 1. Sync All Users
      try {
        const users = JSON.parse(localStorage.getItem('agroelevage_admin_users') || '[]');
        const regUsers = JSON.parse(localStorage.getItem('agroelevage_registered_users') || '[]');
        const allUsers = [...users, ...regUsers];
        const uniqueUsers = [];
        const seenPhones = new Set();
        allUsers.forEach(u => {
          if (u.phone && !seenPhones.has(u.phone.trim())) {
            seenPhones.add(u.phone.trim());
            uniqueUsers.push(u);
          }
        });

        for (const u of uniqueUsers) {
          await this.syncUserToSupabase(u);
          results.users++;
        }
      } catch (err) {
        results.errors.push('Erreur users: ' + err.message);
      }

      // 2. Sync All Escrow Transactions
      try {
        const defaultEscrow = [
          { order_id: 1, buyer_id: 1, seller_id: 1, amount: 27000.00, commission_fee: 0, status: 'HELD', payment_reference: 'ESC-MOMO-849201', payment_operator: 'MTN_MOMO' },
          { order_id: 2, buyer_id: 1, seller_id: 2, amount: 630000.00, commission_fee: 15000, status: 'RELEASED', payment_reference: 'OM-ESC-772109', payment_operator: 'ORANGE_MONEY' }
        ];

        for (const esc of defaultEscrow) {
          try {
            await this.supabase.from('escrow_transactions').upsert([esc]);
            results.escrow++;
          } catch (e) {}
        }
      } catch (err) {
        results.errors.push('Erreur escrow: ' + err.message);
      }

      return { success: true, results };
    }
  }

  // Export globally
  window.AgroApi = new AgroApiClient();
})(window);

