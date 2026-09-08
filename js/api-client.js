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
          console.log('[Supabase] Client initialisé avec succès.');
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
        url: localStorage.getItem(SB_URL_KEY) || '',
        key: localStorage.getItem(SB_KEY_KEY) || '',
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

    // --- Authentication & User Endpoints (Supabase + Local fallback) ---
    async register(data) {
      // 1. Try Supabase if connected
      if (this.supabase) {
        try {
          const { data: sbUser, error } = await this.supabase
            .from('users')
            .insert([{
              phone: data.phone,
              name: data.name,
              email: data.email || null,
              password_hash: data.password || 'password123',
              role: data.role || 'vendeur',
              location: data.location || 'Yaoundé, Cameroun'
            }])
            .select()
            .single();

          if (!error && sbUser) {
            this.setCurrentUser(sbUser);
            localStorage.setItem('ago_logged_in', 'true');
            return { success: true, user: sbUser };
          }
        } catch (e) {
          console.warn('[Supabase Register Error]', e.message);
        }
      }

      // 2. Try Node REST Backend
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
        // 3. Local fallback persistence
        const fallbackUser = {
          id: 'usr_' + Date.now(),
          phone: data.phone,
          name: data.name,
          email: data.email,
          role: data.role || 'vendeur',
          location: data.location || 'Yaoundé, Cameroun'
        };
        this.setCurrentUser(fallbackUser);
        localStorage.setItem('ago_logged_in', 'true');
        return { success: true, user: fallbackUser };
      }
    }

    async login(phoneOrEmail, password) {
      // 1. Try Supabase if connected
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

      // 2. Try Node REST Backend
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

      // Save locally
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

    // --- Admin Users (Supabase + Local Sync) ---
    async getAdminUsers() {
      if (this.supabase) {
        try {
          const { data, error } = await this.supabase.from('users').select('*').order('id', { ascending: false });
          if (!error && data) return data;
        } catch (e) {}
      }
      return JSON.parse(localStorage.getItem('agroelevage_admin_users') || '[]');
    }

    async deleteAdminUser(id, phone) {
      if (this.supabase) {
        try {
          if (id) await this.supabase.from('users').delete().eq('id', id);
          else if (phone) await this.supabase.from('users').delete().eq('phone', phone);
        } catch (e) {}
      }
      return { success: true };
    }
  }

  // Export globally
  window.AgroApi = new AgroApiClient();
})(window);
