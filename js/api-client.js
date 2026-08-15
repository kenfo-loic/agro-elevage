/**
 * AgroElevage Link & NaturIA — Frontend API Client
 * Connecte l'interface utilisateur au serveur Back-End REST API & Séquestre
 */

(function(window) {
  const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') || window.location.origin.includes('http')
    ? `${window.location.origin}/api`
    : 'http://localhost:3000/api';

  class AgroApiClient {
    constructor() {
      this.baseUrl = API_BASE;
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
      return !!this.getToken();
    }

    logout() {
      this.setToken(null);
      this.setCurrentUser(null);
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
        console.error(`[API Error] ${endpoint}:`, error);
        throw error;
      }
    }

    // --- Authentication Endpoints ---
    async register(data) {
      const res = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (res.token) {
        this.setToken(res.token);
        this.setCurrentUser(res.user);
      }
      return res;
    }

    async login(phone, password) {
      const res = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password })
      });
      if (res.token) {
        this.setToken(res.token);
        this.setCurrentUser(res.user);
      }
      return res;
    }

    async verifyOtp(phone, otpCode) {
      const res = await this.request('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone, otpCode })
      });
      if (res.token) {
        this.setToken(res.token);
        this.setCurrentUser(res.user);
      }
      return res;
    }

    async getMe() {
      const res = await this.request('/auth/me');
      if (res.user) this.setCurrentUser(res.user);
      return res.user;
    }

    // --- Products Endpoints ---
    async getProducts(params = {}) {
      const query = new URLSearchParams(params).toString();
      return this.request(`/products${query ? '?' + query : ''}`);
    }

    async getProduct(id) {
      return this.request(`/products/${id}`);
    }

    async createProduct(formDataOrJson) {
      const isFormData = formDataOrJson instanceof FormData;
      return this.request('/products', {
        method: 'POST',
        body: isFormData ? formDataOrJson : JSON.stringify(formDataOrJson)
      });
    }

    async getSellerMyProducts() {
      return this.request('/products/seller/my-products');
    }

    async deleteProduct(id) {
      return this.request(`/products/${id}`, { method: 'DELETE' });
    }

    // --- Orders & Escrow Endpoints ---
    async createOrder(orderData) {
      return this.request('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });
    }

    async getOrder(id) {
      return this.request(`/orders/${id}`);
    }

    async getBuyerOrders() {
      return this.request('/orders/buyer');
    }

    async getSellerOrders() {
      return this.request('/orders/seller');
    }

    async payEscrow(orderId, paymentPhone, paymentOperator = 'MTN_MOMO') {
      return this.request('/escrow/pay', {
        method: 'POST',
        body: JSON.stringify({
          order_id: orderId,
          payment_phone: paymentPhone,
          payment_operator: paymentOperator
        })
      });
    }

    async shipOrder(orderId, trackingCode = null) {
      return this.request('/escrow/ship', {
        method: 'POST',
        body: JSON.stringify({ order_id: orderId, tracking_code: trackingCode })
      });
    }

    async releaseEscrowFunds(orderId) {
      return this.request('/escrow/release', {
        method: 'POST',
        body: JSON.stringify({ order_id: orderId })
      });
    }

    async disputeOrder(orderId, reason) {
      return this.request('/escrow/dispute', {
        method: 'POST',
        body: JSON.stringify({ order_id: orderId, reason })
      });
    }

    async getWallet() {
      return this.request('/escrow/wallet');
    }

    // --- Geolocation Endpoints ---
    async getProducers() {
      return this.request('/geo/producers');
    }

    async getMarkets() {
      return this.request('/geo/markets');
    }

    // --- NaturIA AI Endpoints ---
    async aiChat(message, sessionId = 'default', history = []) {
      return this.request('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message, session_id: sessionId, history })
      });
    }

    async aiDiagnose(formDataOrJson) {
      const isFormData = formDataOrJson instanceof FormData;
      return this.request('/ai/diagnose', {
        method: 'POST',
        body: isFormData ? formDataOrJson : JSON.stringify(formDataOrJson)
      });
    }

    // --- Notifications Endpoints ---
    async getNotifications() {
      return this.request('/notifications');
    }

    async markNotificationAsRead(id) {
      return this.request(`/notifications/${id}/read`, { method: 'PUT' });
    }

    // --- Analytics Endpoints ---
    async getSellerAnalytics() {
      return this.request('/analytics/seller');
    }

    async getBuyerAnalytics() {
      return this.request('/analytics/buyer');
    }
  }

  // Export globally
  window.AgroApi = new AgroApiClient();
})(window);
