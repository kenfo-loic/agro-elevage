/**
 * AgroElevage Link — Full Frontend Application Logic
 * Gestion intégrale des 20 Écrans du Mockup Officiel
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  let currentRole = 'vendeur'; // 'vendeur' | 'acheteur'
  let orderQuantityKg = 100;
  const unitPriceFcfa = 250;
  const deliveryFeeFcfa = 2000;
  let leafletMap = null;
  let salesChart = null;

  // DOM Elements
  const toast = document.getElementById('appToast');
  const webSidebar = document.getElementById('webSidebar');
  const webSidebarBackdrop = document.getElementById('webSidebarBackdrop');
  const btnToggleMobileMenu = document.getElementById('btnToggleMobileMenu');
  const webCurrentPageTitle = document.getElementById('webCurrentPageTitle');

  // Toast Helper
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }

  const viewTitles = {
    'view-welcome': 'Accueil & Présentation',
    'view-register': 'Inscription & Rôle',
    'view-otp': 'Vérification OTP',
    'view-seller-dashboard': 'Tableau de Bord Vendeur',
    'view-buyer-dashboard': 'Tableau de Bord Acheteur',
    'view-marketplace': 'Marketplace B2B',
    'view-product-detail': 'Détail du Produit',
    'view-map': 'Carte & Producteurs Géolocalisés',
    'view-add-product': 'Ajouter un Produit',
    'view-my-products': 'Mes Produits & Inventaire',
    'view-order-summary': 'Passer une Commande',
    'view-payment-escrow': 'Paiement Séquestre Mobile Money',
    'view-order-tracking': 'Suivi des Commandes',
    'view-ai-diag': 'NaturIA Expert IA (Diagnostic & Agronomie)',
    'view-ai-translate': 'NaturIA Expert IA',
    'view-notifications': 'Centre de Notifications',
    'view-profile': 'Profil & Paramètres'
  };

  const viewHtmlPages = {
    'view-marketplace': 'marketplace.html',
    'view-inventory': 'mes_produits.html',
    'view-my-products': 'mes_produits.html',
    'view-add-product': 'ajouter_produit.html',
    'view-order-summary': 'passer_commande.html',
    'view-payment-escrow': 'paiement_escrow.html',
    'view-ai-expert': 'naturia_expert.html',
    'view-ai-diag': 'ia_diagnostic.html',
    'view-map': 'carte_et_geoloc.html',
    'view-notifications': 'notifications.html',
    'view-profile-settings': 'profil.html',
    'view-profile': 'profil.html'
  };

  // --- DIRECT HTML PAGE ROUTING ---
  function showView(viewId) {
    if (viewHtmlPages[viewId]) {
      window.location.href = viewHtmlPages[viewId];
      return;
    }

    const allViews = document.querySelectorAll('.screen-view');
    const targetView = document.getElementById(viewId);
    if (!targetView) return;

    allViews.forEach(v => v.classList.remove('active'));
    targetView.classList.add('active');

    // Scroll window / main content to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update Topbar Title
    if (webCurrentPageTitle && viewTitles[viewId]) {
      webCurrentPageTitle.textContent = viewTitles[viewId];
    }
  }

  // --- Sidebar Drawer Handlers (Desktop & Mobile) ---
  const btnCloseSidebar = document.getElementById('btnCloseSidebar');
  const btnWelcomeOpenMenu = document.getElementById('btnWelcomeOpenMenu');

  function openMobileSidebar() {
    if (webSidebar) webSidebar.classList.add('open');
    if (webSidebarBackdrop) {
      webSidebarBackdrop.classList.add('active');
      webSidebarBackdrop.classList.add('open');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeMobileSidebar() {
    if (webSidebar) webSidebar.classList.remove('open');
    if (webSidebarBackdrop) {
      webSidebarBackdrop.classList.remove('active');
      webSidebarBackdrop.classList.remove('open');
    }
    document.body.style.overflow = '';
  }

  if (btnToggleMobileMenu) btnToggleMobileMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    openMobileSidebar();
  });
  if (btnCloseSidebar) btnCloseSidebar.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMobileSidebar();
  });
  if (btnWelcomeOpenMenu) btnWelcomeOpenMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    openMobileSidebar();
  });
  if (webSidebarBackdrop) webSidebarBackdrop.addEventListener('click', closeMobileSidebar);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileSidebar();
  });

  // Épinglage du menu latéral est géré de manière centralisée par js/layout.js

  // Bind all clickable elements with data-target
  document.querySelectorAll('[data-target]').forEach(elem => {
    elem.addEventListener('click', (e) => {
      const target = elem.dataset.target;
      if (target) {
        showView(target);
        closeMobileSidebar();
      }
    });
  });

  // Back Navigation Buttons
  document.querySelectorAll('.nav-back-btn[data-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      const backTarget = btn.dataset.back;
      if (backTarget) showView(backTarget);
    });
  });

  // =========================================================================
  // 01. ÉCRAN DE BIENVENUE — LOGIN MODAL
  // =========================================================================
  const btnWelcomeLogin = document.getElementById('btnWelcomeLogin');
  const btnWelcomeRegister = document.getElementById('btnWelcomeRegister');
  const loginModalBackdrop = document.getElementById('loginModalBackdrop');
  const loginModalCard = document.getElementById('loginModalCard');
  const btnCloseLoginModal = document.getElementById('btnCloseLoginModal');
  const btnSubmitLogin = document.getElementById('btnSubmitLogin');
  const btnTogglePassword = document.getElementById('btnTogglePassword');
  const loginPassword = document.getElementById('loginPassword');
  const btnForgotPassword = document.getElementById('btnForgotPassword');
  const btnGoRegisterFromLogin = document.getElementById('btnGoRegisterFromLogin');

  function openLoginModal() {
    if (loginModalBackdrop) loginModalBackdrop.classList.add('open');
    if (loginModalCard) loginModalCard.classList.add('open');
  }

  function closeLoginModal() {
    if (loginModalBackdrop) loginModalBackdrop.classList.remove('open');
    if (loginModalCard) loginModalCard.classList.remove('open');
  }

  if (btnWelcomeLogin) btnWelcomeLogin.addEventListener('click', openLoginModal);

  if (btnCloseLoginModal) btnCloseLoginModal.addEventListener('click', closeLoginModal);
  if (loginModalBackdrop) loginModalBackdrop.addEventListener('click', closeLoginModal);

  // Toggle password visibility (Eye Icon)
  document.querySelectorAll('.login-toggle-pwd').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const wrap = btn.closest('.login-input-wrap') || btn.parentElement;
      const input = wrap ? wrap.querySelector('input') : null;
      if (input) {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.innerHTML = isPassword
          ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
          : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
      }
    });
  });

  // Submit login form
  // Submit login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const loginId = (document.getElementById('loginEmail')?.value || '').trim();
      const pwd = (document.getElementById('loginPassword')?.value || '').trim();
      const remember = document.getElementById('loginRememberMe')?.checked;

      if (!loginId || !pwd) {
        showToast('Veuillez entrer votre identifiant et votre mot de passe.');
        return;
      }

      // Call API Login
      let loginSuccess = false;
      let loggedUser = null;

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: loginId, phone: loginId, email: loginId, password: pwd })
        });
        const data = await res.json();
        if (data.success) {
          loginSuccess = true;
          loggedUser = data.user;
          if (data.token) localStorage.setItem('agroelevage_token', data.token);
        }
      } catch (err) {
        console.warn('API connection offline, checking local user database');
      }

      // Fallback check against Local Registered Users Store
      if (!loginSuccess) {
        const regUsers = JSON.parse(localStorage.getItem('agroelevage_registered_users') || '[]');
        const match = regUsers.find(u => 
          (u.email === loginId || u.phone === loginId || u.name === loginId) && 
          (u.password === pwd)
        );

        if (match) {
          loginSuccess = true;
          loggedUser = match;
        }
      }

      if (!loginSuccess) {
        alert('Connexion refusée : Nom/Téléphone ou mot de passe incorrect. Veuillez vérifier vos identifiants enregistrés.');
        showToast('Erreur : Identifiant ou mot de passe incorrect.');
        return;
      }

      if (remember) localStorage.setItem('ago_remembered_email', loginId);

      localStorage.setItem('agroelevage_user', JSON.stringify(loggedUser));
      localStorage.setItem('ago_logged_in', 'true');

      closeLoginModal();
      showToast(`Connexion réussie ! Bienvenue ${loggedUser.name || ''}.`);
      showView((loggedUser.role || currentRole) === 'vendeur' ? 'view-seller-dashboard' : 'view-buyer-dashboard');
    });
  }

  // Auto-fill remembered email
  const rememberedEmail = localStorage.getItem('ago_remembered_email');
  if (rememberedEmail) {
    const emailField = document.getElementById('loginEmail');
    const rememberCheck = document.getElementById('loginRememberMe');
    if (emailField) emailField.value = rememberedEmail;
    if (rememberCheck) rememberCheck.checked = true;
  }

  // Mot de passe oublié
  if (btnForgotPassword) {
    btnForgotPassword.addEventListener('click', () => {
      showToast('Un e-mail de réinitialisation vous sera envoyé.');
    });
  }

  // Lien "Créer un compte" depuis la modal login
  if (btnGoRegisterFromLogin) {
    btnGoRegisterFromLogin.addEventListener('click', () => {
      closeLoginModal();
      openRegisterModal();
    });
  }

  if (btnWelcomeRegister) {
    btnWelcomeRegister.addEventListener('click', () => {
      openRegisterModal();
    });
  }

  // Fermer la modal avec Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (loginModalCard && loginModalCard.classList.contains('open')) closeLoginModal();
      if (registerModalCard && registerModalCard.classList.contains('open')) closeRegisterModal();
    }
  });

  // =========================================================================
  // REGISTER MODAL
  // =========================================================================
  const registerModalBackdrop = document.getElementById('registerModalBackdrop');
  const registerModalCard = document.getElementById('registerModalCard');
  const btnCloseRegisterModal = document.getElementById('btnCloseRegisterModal');
  const btnGoLoginFromRegister = document.getElementById('btnGoLoginFromRegister');

  function openRegisterModal() {
    if (registerModalBackdrop) registerModalBackdrop.classList.add('open');
    if (registerModalCard) registerModalCard.classList.add('open');
  }

  function closeRegisterModal() {
    if (registerModalBackdrop) registerModalBackdrop.classList.remove('open');
    if (registerModalCard) registerModalCard.classList.remove('open');
  }

  if (btnCloseRegisterModal) btnCloseRegisterModal.addEventListener('click', closeRegisterModal);
  if (registerModalBackdrop) registerModalBackdrop.addEventListener('click', closeRegisterModal);

  if (btnGoLoginFromRegister) {
    btnGoLoginFromRegister.addEventListener('click', () => {
      closeRegisterModal();
      openLoginModal();
    });
  }

  const registerModalForm = document.getElementById('registerModalForm');
  if (registerModalForm) {
    registerModalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nom = (document.getElementById('regNom')?.value || '').trim();
      const prenom = (document.getElementById('regPrenom')?.value || '').trim();
      const email = (document.getElementById('regEmail')?.value || '').trim();
      const phone = (document.getElementById('regPhone')?.value || '').trim();
      const location = (document.getElementById('regLocation')?.value || 'Yaoundé, Cameroun').trim();
      const pwd = (document.getElementById('regModalPassword')?.value || '').trim();
      const confirmPwd = (document.getElementById('regModalConfirmPassword')?.value || '').trim();

      if (!nom || !prenom || !phone || !pwd) {
        showToast('Veuillez remplir tous les champs obligatoires.');
        return;
      }

      // 1. Password length check: Must be at least 6 characters (digits, letters, or both)
      if (pwd.length < 6) {
        alert('Le mot de passe doit contenir au moins 6 caractères (lettres ou chiffres).');
        showToast('Erreur : Le mot de passe doit contenir au moins 6 caractères.');
        return;
      }

      // 2. Password and Confirm Password MUST match exactly
      if (pwd !== confirmPwd) {
        alert('Les mots de passe ne correspondent pas. La confirmation doit être identique au mot de passe.');
        showToast('Erreur : Mots de passe non identiques.');
        return;
      }

      const fullName = `${prenom} ${nom}`.trim();
      const newUser = {
        id: 'usr_' + Date.now(),
        name: fullName,
        email,
        phone,
        password: pwd,
        role: currentRole || 'vendeur',
        sub_role: 'agriculteur',
        location,
        wallet_balance: 0,
        escrow_balance: 0,
        createdAt: new Date().toISOString()
      };

      // Save to SQLite database via API
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone,
            name: fullName,
            email,
            password: pwd,
            confirm_password: confirmPwd,
            role: currentRole || 'vendeur',
            location
          })
        });

        const data = await res.json();
        if (!data.success) {
          alert('Échec de la création du compte : ' + data.error);
          showToast(data.error);
          return;
        }

        if (data.token) localStorage.setItem('agroelevage_token', data.token);
      } catch (err) {
        console.warn('Network API offline, using local storage database store');
      }

      // Save to LocalStorage User Store for Client-Side Offline Persistence
      let regUsers = JSON.parse(localStorage.getItem('agroelevage_registered_users') || '[]');
      regUsers.push(newUser);
      localStorage.setItem('agroelevage_registered_users', JSON.stringify(regUsers));
      localStorage.setItem('agroelevage_user', JSON.stringify(newUser));
      localStorage.setItem('ago_logged_in', 'true');

      if (typeof window.addUserNotification === 'function') {
        window.addUserNotification('Création de Compte', `Bienvenue ${fullName} ! Votre compte a été enregistré en base de données avec succès.`, 'user');
      }

      closeRegisterModal();
      showToast(`Bienvenue ${fullName} ! Votre compte a été créé avec succès.`);
      showView(currentRole === 'vendeur' ? 'view-seller-dashboard' : 'view-buyer-dashboard');
    });
  }

  // =========================================================================
  // 02. INSCRIPTION & 03. OTP & 04. CHOIX RÔLE
  // =========================================================================
  const tabRoleVendeur = document.getElementById('tabRoleVendeur');
  const tabRoleAcheteur = document.getElementById('tabRoleAcheteur');
  const btnSubmitRegister = document.getElementById('btnSubmitRegister');
  const btnVerifyOtp = document.getElementById('btnVerifyOtp');
  const btnChangeNumber = document.getElementById('btnChangeNumber');
  const btnConfirmRole = document.getElementById('btnConfirmRole');
  const roleCardPickVendeur = document.getElementById('roleCardPickVendeur');
  const roleCardPickAcheteur = document.getElementById('roleCardPickAcheteur');

  function setAppRole(role) {
    currentRole = role;
    if (tabRoleVendeur && tabRoleAcheteur) {
      tabRoleVendeur.classList.toggle('active', role === 'vendeur');
      tabRoleAcheteur.classList.toggle('active', role === 'acheteur');
    }
    if (roleCardPickVendeur && roleCardPickAcheteur) {
      roleCardPickVendeur.classList.toggle('selected', role === 'vendeur');
      roleCardPickAcheteur.classList.toggle('selected', role === 'acheteur');
    }
  }

  if (tabRoleVendeur) tabRoleVendeur.addEventListener('click', () => setAppRole('vendeur'));
  if (tabRoleAcheteur) tabRoleAcheteur.addEventListener('click', () => setAppRole('acheteur'));

  if (btnSubmitRegister) {
    btnSubmitRegister.addEventListener('click', () => {
      const phone = document.getElementById('inputRegPhone')?.value || '+237 693 412 317';
      const otpPhone = document.getElementById('otpTargetPhone');
      if (otpPhone) otpPhone.textContent = phone;
      showToast('Code SMS envoyé !');
      showView('view-otp');
    });
  }

  // OTP inputs auto-advance
  const otpInputs = document.querySelectorAll('.otp-box-input');
  otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      if (e.target.value.length === 1 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });
  });

  if (btnVerifyOtp) {
    btnVerifyOtp.addEventListener('click', () => {
      showToast('Numéro validé avec succès ! ');
      showView(currentRole === 'vendeur' ? 'view-seller-dashboard' : 'view-buyer-dashboard');
    });
  }

  if (btnChangeNumber) {
    btnChangeNumber.addEventListener('click', () => showView('view-register'));
  }

  // =========================================================================
  // 05. TABLEAU DE BORD VENDEUR & 06. TABLEAU DE BORD ACHETEUR
  // =========================================================================
  // Quick Actions Vendeur
  document.getElementById('actSellerAddProd')?.addEventListener('click', () => showView('view-add-product'));
  document.getElementById('actSellerMyProds')?.addEventListener('click', () => showView('view-my-products'));
  document.getElementById('actSellerOrders')?.addEventListener('click', () => showView('view-order-tracking'));
  document.getElementById('actSellerNaturIA')?.addEventListener('click', () => showView('view-ai-diag'));
  document.getElementById('btnSellerNotif')?.addEventListener('click', () => showView('view-notifications'));

  // Quick Actions Acheteur
  document.getElementById('actBuyerSearch')?.addEventListener('click', () => showView('view-marketplace'));
  document.getElementById('actBuyerOrders')?.addEventListener('click', () => showView('view-order-tracking'));
  document.getElementById('actBuyerFavorites')?.addEventListener('click', () => showView('view-marketplace'));
  document.getElementById('actBuyerNaturIA')?.addEventListener('click', () => showView('view-ai-diag'));
  document.getElementById('btnBuyerNotif')?.addEventListener('click', () => showView('view-notifications'));
  document.getElementById('cardBuyerRecentOrder')?.addEventListener('click', () => showView('view-order-tracking'));

  // Chart.js Sales Graph
  function initSalesChart() {
    const ctx = document.getElementById('sellerSalesChartCanvas');
    if (!ctx) return;
    if (salesChart) return; // already initialized

    salesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        datasets: [{
          label: 'Ventes (FCFA)',
          data: [120000, 160000, 190000, 210000, 230000, 250000],
          borderColor: '#15803d',
          backgroundColor: 'rgba(34, 197, 94, 0.15)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#15803d'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { ticks: { font: { size: 9 } } }
        }
      }
    });
  }

  // =========================================================================
  // 07. MARKETPLACE & 08. DÉTAIL PRODUIT
  // =========================================================================
  document.querySelectorAll('.product-item-card').forEach(card => {
    card.addEventListener('click', () => {
      showView('view-product-detail');
    });
  });

  // Category Filter Pills
  document.querySelectorAll('#marketCategoryChips .cat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#marketCategoryChips .cat-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      showToast(`Catégorie : ${chip.textContent}`);
    });
  });

  // Product Detail Actions
  document.getElementById('btnOrderProduct')?.addEventListener('click', () => showView('view-order-summary'));

  // =========================================================================
  // 09. CARTE & GÉOLOCALISATION (LEAFLET)
  // =========================================================================
  // =========================================================================
  // 09. CARTE & GÉOLOCALISATION (LEAFLET)
  // =========================================================================
  function initLeafletMap() {
    const mapContainer = document.getElementById('leafletMapContainer');
    if (!mapContainer || leafletMap) return;

    // Center around Yaoundé, Cameroun
    leafletMap = L.map('leafletMapContainer').setView([3.8667, 11.5167], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(leafletMap);

    const locationsData = [
      // Fermes & Producteurs
      { name: 'Ferme de la Vallée', sub: 'Tomates, Piments, Maïs', lat: 3.8967, lng: 11.5167, color: '#15803d', badge: 'Producteur Agricole' },
      { name: 'Élevage Avicole Mbouda', sub: 'Poulets Goliath, Œufs', lat: 3.8480, lng: 11.5021, color: '#15803d', badge: 'Élevage Avicole' },
      { name: 'Plantations du Noun', sub: 'Avocats, Ananas, Papayes', lat: 3.9150, lng: 11.5300, color: '#15803d', badge: 'Plantation Fruitière' },
      { name: 'GIC Tubercules & Racines', sub: 'Manioc, Igname, Patate douce', lat: 3.8200, lng: 11.4800, color: '#15803d', badge: 'Coopérative Tubercules' },
      { name: 'Ferme Porcine & Piscicole du Nyong', sub: 'Porcs, Tilapia, Clarias', lat: 3.8150, lng: 11.5100, color: '#15803d', badge: 'Porcin & Pisciculture' },

      // Hôtels B2B
      { name: 'Hôtel Hilton Yaoundé', sub: 'Acheteur B2B Fruits, Légumes & Viandes', lat: 3.8642, lng: 11.5175, color: '#2563eb', badge: 'Hôtel 5 Etoiles (B2B)' },
      { name: 'Hôtel Mont Febe', sub: 'Restauration & Volailles bio', lat: 3.9020, lng: 11.4980, color: '#2563eb', badge: 'Hôtel & Restauration' },
      { name: 'Djeuga Palace Hôtel', sub: 'Approvisionnement hebdomadaire', lat: 3.8680, lng: 11.5130, color: '#2563eb', badge: 'Hôtel 4 Etoiles' },
      { name: 'Kribi Beach Resort & Spa', sub: 'Acheteur Poissons & Fruits', lat: 3.8350, lng: 11.5250, color: '#2563eb', badge: 'Complexe Hôtelier' },

      // Restaurants B2B
      { name: 'Restaurant Le Gourmet', sub: 'Achats réguliers Tomates & Légumes', lat: 3.8820, lng: 11.5140, color: '#d97706', badge: 'Restaurant Gastronomique' },
      { name: 'La Chaumière Gourmande', sub: 'Viandes fraîches & Plantains', lat: 3.8690, lng: 11.5210, color: '#d97706', badge: 'Spécialités Grillades' },
      { name: 'Le Baffou Restaurant B2B', sub: 'Restauration collective', lat: 3.8750, lng: 11.5270, color: '#d97706', badge: 'Traiteur & Restauration' },
      { name: 'Chez Wou Traiteur', sub: 'Légumes frais & Herbes aromatiques', lat: 3.8880, lng: 11.5110, color: '#d97706', badge: 'Restaurant Fusion' },

      // Transformation Agro
      { name: 'SOCATRA (Usine Manioc)', sub: 'Achat Manioc brut (10-50 Tonnes)', lat: 3.8310, lng: 11.5050, color: '#9333ea', badge: 'Transformation Manioc' },
      { name: 'Agro-Industrie du Cameroun', sub: 'Transformation Ananas & Papayes', lat: 3.8550, lng: 11.5450, color: '#9333ea', badge: 'Jus & Conserves' },
      { name: 'CAMAGRI Cacao & Café Export', sub: 'Séchage & Conditionnement Cacao', lat: 3.9050, lng: 11.5220, color: '#9333ea', badge: 'Conditionnement Cacao' },
      { name: 'LaitCAM (Transformation Laitière)', sub: 'Collecte Lait frais & Yaourts', lat: 3.8710, lng: 11.4680, color: '#9333ea', badge: 'Laiterie Industrielle' },

      // Logistique
      { name: 'Entrepôt Frigorifique AgroLink', sub: 'Stockage sous chaîne de froid 500T', lat: 3.8250, lng: 11.5190, color: '#0d9488', badge: 'Entrepôt Frigorifique' }
    ];

    locationsData.forEach(loc => {
      const marker = L.circleMarker([loc.lat, loc.lng], {
        radius: 9,
        fillColor: loc.color,
        color: "#ffffff",
        weight: 2.5,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(leafletMap);

      marker.bindPopup(`
        <div style="font-family: var(--font-body);">
          <span style="font-size: 10px; font-weight: 800; color: ${loc.color}; text-transform: uppercase;">${loc.badge}</span>
          <h4 style="font-size: 13px; font-weight: 800; margin: 2px 0; color: #1e293b;">${loc.name}</h4>
          <p style="font-size: 11.5px; color: #64748b; margin-bottom: 6px;">${loc.sub}</p>
        </div>
      `);
    });
  }



  function loadSpaUserProducts() {
    const userProducts = JSON.parse(localStorage.getItem('agroelevage_products') || '[]');
    const spaMarketGrid = document.querySelector('#view-marketplace .products-grid');
    if (spaMarketGrid && userProducts.length > 0) {
      userProducts.forEach(p => {
        const cleanWa = (p.whatsapp || '+237690123456').replace(/[^\d+]/g, '');
        const card = document.createElement('div');
        card.className = 'web-card product-item-card';
        card.setAttribute('data-cat', p.category || 'maraichage');
        card.style.cssText = 'padding: 14px; display: flex; flex-direction: column; cursor: pointer; border: 2px solid var(--primary-soft);';
        card.innerHTML = `
          <div style="position: relative; height: 160px; border-radius: 12px; overflow: hidden; margin-bottom: 12px;">
            <img src="${p.image}" style="width: 100%; height: 100%; object-fit: cover;" alt="${p.name}" />
            <span style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.7); color: #fff; font-size: 10.5px; font-weight: 700; padding: 3px 8px; border-radius: 6px;">${p.categoryLabel || p.category}</span>
            <span style="position: absolute; top: 10px; right: 10px; background: #16a34a; color: #ffffff; font-size: 10.5px; font-weight: 800; padding: 3px 8px; border-radius: 6px;">Nouveau</span>
          </div>
          <div style="flex: 1; display: flex; flex-direction: column;">
            <div style="font-family: var(--font-heading); font-size: 15px; font-weight: 800; color: var(--text-main); margin-bottom: 2px;" class="prod-title">${p.name}</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">${p.location}</div>
            <div style="display: flex; gap: 8px; margin-top: auto; padding-top: 10px; border-top: 1px solid var(--border-subtle); align-items: center; justify-content: space-between;">
              <div>
                <div style="font-family: var(--font-heading); font-size: 15px; font-weight: 800; color: var(--primary);">${p.price} FCFA <span style="font-size: 11px; font-weight: 500; color: var(--text-muted);">/ kg</span></div>
                <div style="font-size: 11px; color: var(--text-muted);">Stock : ${p.quantity} kg</div>
              </div>
              <div style="display: flex; gap: 6px; align-items: center;">
                <a href="https://wa.me/${cleanWa}?text=${encodeURIComponent('Bonjour, je suis intéressé par votre produit ' + p.name + ' sur AgroElevage Link.')}" target="_blank" class="btn-secondary" style="width: auto; height: 32px; padding: 0 10px; font-size: 12px; font-weight: 700; background: #25d366; color: #ffffff; text-decoration: none; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px;" onclick="event.stopPropagation()">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> WhatsApp
                </a>
              </div>
            </div>
          </div>
        `;
        spaMarketGrid.prepend(card);
      });
    }
  }
  loadSpaUserProducts();

  // =========================================================================
  // 11. AJOUT DE PRODUIT & 12. MES PRODUITS
  // =========================================================================
  document.getElementById('btnPublishProduct')?.addEventListener('click', () => {
    showToast('Produit publié avec succès sur la Marketplace ! ');
    showView('view-my-products');
  });
  document.getElementById('btnGoAddProductTop')?.addEventListener('click', () => showView('view-add-product'));
  document.getElementById('btnFloatAddProduct')?.addEventListener('click', () => showView('view-add-product'));

  // =========================================================================
  // 13. COMMANDE, 14. PAIEMENT ESCROW & 15. SUIVI
  // =========================================================================
  const btnQtyMinus = document.getElementById('btnQtyMinus');
  const btnQtyPlus = document.getElementById('btnQtyPlus');
  const orderQtyDisplay = document.getElementById('orderQtyDisplay');
  const orderSubtotal = document.getElementById('orderSubtotal');
  const orderTotal = document.getElementById('orderTotal');

  function updateOrderBill() {
    if (!orderQtyDisplay) return;
    orderQtyDisplay.textContent = `${orderQuantityKg}kg`;
    const subtotal = orderQuantityKg * unitPriceFcfa;
    const total = subtotal + deliveryFeeFcfa;
    if (orderSubtotal) orderSubtotal.textContent = `${subtotal.toLocaleString()} FCFA`;
    if (orderTotal) orderTotal.textContent = `${total.toLocaleString()} FCFA`;
  }

  if (btnQtyMinus) {
    btnQtyMinus.addEventListener('click', () => {
      if (orderQuantityKg > 10) {
        orderQuantityKg -= 10;
        updateOrderBill();
      }
    });
  }

  if (btnQtyPlus) {
    btnQtyPlus.addEventListener('click', () => {
      orderQuantityKg += 10;
      updateOrderBill();
    });
  }

  document.getElementById('btnConfirmOrder')?.addEventListener('click', () => showView('view-payment-escrow'));

  // Payment method selection
  document.querySelectorAll('.payment-method-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });

  document.getElementById('btnPayNow')?.addEventListener('click', () => {
    showToast('Paiement sécurisé validé sous séquestre Escrow ! ');
    showView('view-order-tracking');
  });

  document.getElementById('btnOrderFinished')?.addEventListener('click', () => {
    showToast('Suivi de livraison mis à jour.');
  });

  // Invoice Modal Handlers
  const invoiceModal = document.getElementById('invoiceModal');
  document.getElementById('btnOpenInvoiceModal')?.addEventListener('click', () => {
    if (invoiceModal) invoiceModal.classList.add('open');
  });
  document.getElementById('btnCloseInvoiceModal')?.addEventListener('click', () => {
    if (invoiceModal) invoiceModal.classList.remove('open');
  });

  // =========================================================================
  // 16 & 18. IA DIAGNOSTIC & NATURIA EXPERT
  // =========================================================================
  document.getElementById('btnRunAiDiagnostic')?.addEventListener('click', () => {
    showToast('Analyse de la pathologie par NaturIA Expert...');
    setTimeout(() => {
      showView('view-ai-diag');
    }, 800);
  });
  document.getElementById('btnSeeSuppliers')?.addEventListener('click', () => {
    showView('view-marketplace');
    showToast('Fournisseurs de produits recommandés listés');
  });

  // =========================================================================
  // 18. IA TRADUCTION & VOIX (Remplacé par NaturIA Expert via iframe)
  // =========================================================================

  // =========================================================================
  // 19 & 20. NOTIFICATIONS & PROFIL
  // =========================================================================
  document.getElementById('btnMarkAllNotifs')?.addEventListener('click', () => {
    showToast('Toutes les notifications sont marquées comme lues.');
  });

  document.getElementById('btnLogoutApp')?.addEventListener('click', () => {
    localStorage.removeItem('ago_logged_in');
    localStorage.removeItem('agroelevage_user');
    localStorage.removeItem('agroelevage_token');
    showToast('Déconnexion effectuée. À bientôt !');
    showView('view-welcome');
  });
});
