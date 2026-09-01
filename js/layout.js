// Global Layout & Login Modal Helpers

window.openLoginModal = function() {
  const backdrop = document.getElementById('loginModalBackdrop');
  const card = document.getElementById('loginModalCard');
  if (backdrop) backdrop.classList.add('open');
  if (card) card.classList.add('open');
};

window.closeLoginModal = function() {
  const backdrop = document.getElementById('loginModalBackdrop');
  const card = document.getElementById('loginModalCard');
  if (backdrop) backdrop.classList.remove('open');
  if (card) card.classList.remove('open');
};

const SVG = {
  leaf: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`,
  home: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  dashboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
  buyerDashboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  cart: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
  package: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
  plus: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>`,
  order: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>`,
  shield: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`,
  truck: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18.5" r="2.5"/><circle cx="7" cy="18.5" r="2.5"/></svg>`,
  ai: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`,
  map: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`,
  bell: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
  settings: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  logout: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`,
  user: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  menu: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`,
  pin: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-2.5l-2-2V4h1V2H6v2h1v8.5l-2 2V17z"/></svg>`,
  close: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
};

const webSidebarHTML = `
  <div class="web-sidebar-backdrop" id="webSidebarBackdrop"></div>
  <aside class="web-sidebar" id="webSidebar">
    <div class="web-sidebar-header">
      <div class="web-brand-logo-wrap" style="background: transparent; box-shadow: none; padding: 0;">
        <img src="assets/images/logo.png" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" alt="AgroElevage Logo" />
      </div>
      <div style="flex: 1; min-width: 0;">
        <h1 class="web-brand-title">AgroElevage <span style="color: var(--accent-gold);">Link</span></h1>
      </div>
      <button class="web-sidebar-pin-btn" id="btnPinSidebar" title="Épingler / Garder le menu affiché à l'écran">${SVG.pin}</button>
      <button class="web-sidebar-close-btn" id="btnCloseSidebar" title="Fermer le menu">${SVG.close}</button>
    </div>

    <nav class="web-sidebar-nav" id="sidebarLinks">
      <div class="web-nav-group-title">Navigation Principale</div>
      <a href="index.html" class="web-nav-item" data-page="index.html"><span class="web-nav-icon">${SVG.home}</span> <span>Accueil</span></a>

      <div class="web-nav-group-title">Commerce & Transactions</div>
      <a href="marketplace.html" class="web-nav-item" data-page="marketplace.html"><span class="web-nav-icon">${SVG.cart}</span> <span>Marketplace B2B</span></a>
      <a href="mes_produits.html" class="web-nav-item" data-page="mes_produits.html"><span class="web-nav-icon">${SVG.package}</span> <span>Mes Produits</span></a>
      <a href="ajouter_produit.html" class="web-nav-item" data-page="ajouter_produit.html"><span class="web-nav-icon">${SVG.plus}</span> <span>Ajouter un Produit</span></a>
      <a href="passer_commande.html" class="web-nav-item" data-page="passer_commande.html"><span class="web-nav-icon">${SVG.order}</span> <span>Passer Commande</span></a>
      <a href="paiement_escrow.html" class="web-nav-item" data-page="paiement_escrow.html"><span class="web-nav-icon">${SVG.shield}</span> <span>Paiement Séquestre</span></a>

      <div class="web-nav-group-title">Localisation & Logistique</div>
      <a href="carte_et_geoloc.html" class="web-nav-item" data-page="carte_et_geoloc.html"><span class="web-nav-icon">${SVG.map}</span> <span>Carte & Géoloc</span></a>

      <div class="web-nav-group-title">Mon Compte</div>
      <a href="notifications.html" class="web-nav-item" data-page="notifications.html"><span class="web-nav-icon">${SVG.bell}</span> <span>Notifications</span> <span class="web-nav-notif-badge" id="sidebarNotifBadge"></span></a>
      <a href="profil.html" class="web-nav-item" data-page="profil.html"><span class="web-nav-icon">${SVG.settings}</span> <span>Profil & Paramètres</span></a>
    </nav>

    <div class="web-sidebar-footer">
      <div class="web-user-profile-summary">
        <div class="web-user-avatar-img" id="sidebarUserAvatarImg" style="width: 36px; height: 36px; border-radius: 50%; background: var(--primary-soft); color: var(--primary-dark); display: flex; align-items: center; justify-content: center; border: 1.5px solid var(--primary-border); flex-shrink: 0;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div class="web-user-info-text">
          <span class="web-user-name-txt">Kenfo Loic</span>
          <span class="web-user-role-txt">Producteur Certifié</span>
        </div>
      </div>
      <a href="index.html" class="web-logout-btn" title="Déconnexion">${SVG.logout}</a>
    </div>
  </aside>

  <!-- Mobile Sticky Bottom Navigation (Touch optimized for phones & small tablets) -->
  <nav class="mobile-bottom-nav" id="mobileBottomNav">
    <a href="index.html" class="mobile-nav-btn" data-mobile="index.html">
      <span class="icon">${SVG.home}</span>
      <span>Accueil</span>
    </a>
    <a href="marketplace.html" class="mobile-nav-btn" data-mobile="marketplace.html">
      <span class="icon">${SVG.cart}</span>
      <span>Marché</span>
    </a>
    <a href="mes_produits.html" class="mobile-nav-btn" data-mobile="mes_produits.html">
      <span class="icon">${SVG.package}</span>
      <span>Produits</span>
    </a>
    <a href="carte_et_geoloc.html" class="mobile-nav-btn" data-mobile="carte_et_geoloc.html">
      <span class="icon">${SVG.map}</span>
      <span>Carte</span>
    </a>
    <a href="profil.html" class="mobile-nav-btn" data-mobile="profil.html">
      <span class="icon">${SVG.user}</span>
      <span>Profil</span>
    </a>
  </nav>
`;

const loginModalHTML = `
  <div class="login-modal-backdrop" id="loginModalBackdrop"></div>
  <div class="login-modal-card" id="loginModalCard" aria-modal="true" role="dialog" aria-labelledby="loginModalTitle">
    <button class="login-modal-close" id="btnCloseLoginModal" title="Fermer">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>

    <div class="login-modal-logo">
      <img src="assets/images/logo.png" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;" alt="Logo" />
    </div>

    <h2 class="login-modal-title" id="loginModalTitle">Bon retour !</h2>
    <p class="login-modal-subtitle">Connectez-vous à votre espace AgroElevage Link</p>

    <form class="login-modal-form" id="loginForm" onsubmit="event.preventDefault();">
      <div class="login-field-group">
        <label class="login-field-label" for="loginEmail">Adresse e-mail</label>
        <div class="login-input-wrap">
          <span class="login-input-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          </span>
          <input type="email" id="loginEmail" name="email" class="login-input-field" placeholder="exemple@domaine.com" value="kenfoloic3@gmail.com" autocomplete="email" required />
        </div>
      </div>

      <div class="login-field-group">
        <label class="login-field-label" for="loginPassword">Mot de passe</label>
        <div class="login-input-wrap">
          <span class="login-input-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </span>
          <input type="password" id="loginPassword" name="password" class="login-input-field" placeholder="Votre mot de passe" value="••••••••" autocomplete="current-password" required />
          <button type="button" class="login-toggle-pwd" id="btnTogglePassword" title="Afficher/Masquer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </div>

      <div class="login-options-row">
        <label class="login-remember-label">
          <input type="checkbox" id="loginRememberMe" class="login-checkbox" checked />
          <span class="login-checkbox-custom"></span>
          <span>Se souvenir de moi</span>
        </label>
        <button type="button" class="login-forgot-link" id="btnForgotPassword">Mot de passe oublié ?</button>
      </div>

      <button type="submit" class="login-submit-btn" id="btnSubmitLogin">
        <span>Se connecter</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </button>

      <div style="text-align: center; margin-top: 14px; font-size: 13px; color: var(--text-muted);">
        Pas encore de compte ? <a href="inscription.html" style="color: var(--primary); font-weight: 700; text-decoration: none;">Créer un compte</a>
      </div>
    </form>
  </div>
`;

document.addEventListener('DOMContentLoaded', () => {
  // Inject Login Modal if not present
  if (!document.getElementById('loginModalCard')) {
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = loginModalHTML;
    document.body.appendChild(modalContainer);
  }

  // Apply saved theme mode globally
  const savedTheme = localStorage.getItem('ago_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.body.setAttribute('data-theme', savedTheme);

  // Apply saved profile avatar image globally
  const savedAvatar = localStorage.getItem('ago_user_avatar');
  if (savedAvatar) {
    const sidebarAvatar = document.getElementById('sidebarUserAvatarImg');
    if (sidebarAvatar) sidebarAvatar.src = savedAvatar;
  }

  // Inject Sidebar and Mobile Bottom Nav if placeholder present
  const sidebarRoot = document.getElementById('sidebar-root');
  if (sidebarRoot) {
    sidebarRoot.innerHTML = webSidebarHTML;
    // Re-check avatar after injection
    if (savedAvatar) {
      const avatarAfterInject = document.getElementById('sidebarUserAvatarImg');
      if (avatarAfterInject) avatarAfterInject.src = savedAvatar;
    }
  }

  // Highlight active sidebar item according to current page
  const currentPage = window.location.pathname.split('/').pop().toLowerCase() || 'index.html';
  
  document.querySelectorAll('.web-nav-item').forEach(item => {
    const pageAttr = item.getAttribute('data-page');
    if (pageAttr && currentPage.includes(pageAttr.toLowerCase())) {
      item.classList.add('active');
    }
  });

  document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
    const mobAttr = btn.getAttribute('data-mobile');
    if (mobAttr && currentPage.includes(mobAttr.toLowerCase())) {
      btn.classList.add('active');
    }
  });

  // Sidebar Drawer & Pin Handlers
  const btnToggleMobile = document.getElementById('btnToggleMobileMenu');
  const btnFloatingMenu = document.getElementById('btnFloatingMenu');
  const btnCloseSidebar = document.getElementById('btnCloseSidebar');
  const btnPinSidebar = document.getElementById('btnPinSidebar');
  const webSidebar = document.getElementById('webSidebar');
  const webBackdrop = document.getElementById('webSidebarBackdrop');
  const appShell = document.querySelector('.web-app-shell');

  // Initialize Pin Mode from localStorage (Default unpinned unless explicitly pinned by user)
  const isPinned = localStorage.getItem('ago_menu_pinned') === 'true';
  if (isPinned && appShell && window.innerWidth >= 768) {
    appShell.classList.add('sidebar-pinned');
    if (webSidebar) webSidebar.classList.add('open');
    if (btnPinSidebar) {
      btnPinSidebar.classList.add('pinned');
      btnPinSidebar.title = 'Désépingler le menu';
    }
  }

  function openNav() {
    if (webSidebar) webSidebar.classList.add('open');
    if (webBackdrop && (!appShell || !appShell.classList.contains('sidebar-pinned'))) {
      webBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeNav() {
    if (appShell && appShell.classList.contains('sidebar-pinned') && window.innerWidth >= 768) {
      return; // Keep visible if pinned
    }
    if (webSidebar) webSidebar.classList.remove('open');
    if (webBackdrop) webBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  function togglePin() {
    if (!appShell) return;
    const isNowPinned = appShell.classList.toggle('sidebar-pinned');
    localStorage.setItem('ago_menu_pinned', isNowPinned ? 'true' : 'false');
    if (btnPinSidebar) {
      btnPinSidebar.classList.toggle('pinned', isNowPinned);
      btnPinSidebar.title = isNowPinned ? 'Désépingler le menu' : 'Épingler le menu';
    }

    if (isNowPinned) {
      if (webSidebar) webSidebar.classList.add('open');
      if (webBackdrop) webBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    } else {
      // Unpinned: Retract sidebar
      if (webSidebar) webSidebar.classList.remove('open');
      if (webBackdrop) webBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (btnToggleMobile) {
    btnToggleMobile.addEventListener('click', (e) => {
      e.stopPropagation();
      openNav();
    });
  }

  if (btnFloatingMenu) {
    btnFloatingMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      openNav();
    });
  }

  if (btnCloseSidebar) {
    btnCloseSidebar.addEventListener('click', (e) => {
      e.stopPropagation();
      if (appShell && appShell.classList.contains('sidebar-pinned')) {
        togglePin();
      }
      closeNav();
    });
  }

  if (btnPinSidebar) {
    btnPinSidebar.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePin();
    });
  }

  if (webBackdrop) {
    webBackdrop.addEventListener('click', closeNav);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeNav();
    }
  });

  // Universal Topbar Global Search Handler across all pages
  document.querySelectorAll('.web-global-search-input').forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = input.value.trim();
        if (query) {
          const currentPage = window.location.pathname.split('/').pop().toLowerCase();
          if (!currentPage.includes('marketplace.html')) {
            window.location.href = `marketplace.html?search=${encodeURIComponent(query)}`;
          }
        }
      }
    });
  });

  // Login Modal Event Listeners
  const btnCloseModal = document.getElementById('btnCloseLoginModal');
  const modalBackdrop = document.getElementById('loginModalBackdrop');
  const btnTogglePwd = document.getElementById('btnTogglePassword');
  const pwdInput = document.getElementById('loginPassword');
  const loginForm = document.getElementById('loginForm');

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
      window.closeLoginModal();
    });
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', () => {
      window.closeLoginModal();
    });
  }

  // Universal Event Delegation for Show/Hide Password Eye Toggle
  document.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('.login-toggle-pwd');
    if (!toggleBtn) return;

    e.preventDefault();
    e.stopPropagation();

    const wrap = toggleBtn.closest('.login-input-wrap') || toggleBtn.parentElement;
    const input = wrap ? wrap.querySelector('input') : null;
    if (input) {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      toggleBtn.innerHTML = isPassword
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
    }
  });

  // --- DYNAMIC USER PROFILE SYNC ACROSS ALL PAGES ---
  window.syncUserProfileUI = function() {
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem('agroelevage_user') || 'null');
    } catch (e) {}

    const name = localStorage.getItem('ago_user_fullname') || user?.name || 'Kenfo Loic';
    const role = localStorage.getItem('ago_user_role') || user?.role || 'Producteur Certifié';
    const email = localStorage.getItem('ago_user_email') || user?.email || 'kenfoloic3@gmail.com';
    const phone = localStorage.getItem('ago_user_phone') || user?.phone || '+237 693 412 317';
    const location = localStorage.getItem('ago_user_location') || user?.location || 'Yaoundé, Cameroun';
    const avatar = localStorage.getItem('ago_user_avatar') || user?.avatar || '';

    // 1. Update Sidebar Name, Role and Avatar
    document.querySelectorAll('.web-user-name-txt').forEach(el => el.textContent = name);
    document.querySelectorAll('.web-user-role-txt').forEach(el => el.textContent = role);
    document.querySelectorAll('.web-user-avatar-img').forEach(el => {
      if (avatar && el.tagName === 'IMG') el.src = avatar;
    });

    // 2. Update Profile Page Cards & Header Displays
    const profileDisplayName = document.getElementById('profileDisplayName');
    const profileDisplayRole = document.getElementById('profileDisplayRole');
    const profileDisplayLocation = document.getElementById('profileDisplayLocation');
    const profileAvatarImg = document.getElementById('profileAvatarImg');

    if (profileDisplayName) profileDisplayName.textContent = name;
    if (profileDisplayRole) profileDisplayRole.textContent = role;
    if (profileDisplayLocation) profileDisplayLocation.textContent = location;
    if (profileAvatarImg && avatar) profileAvatarImg.src = avatar;

    // 3. Update Profile Form Inputs if present (and not currently focused)
    const inputName = document.getElementById('profileFullName');
    const inputPhone = document.getElementById('profilePhone');
    const inputEmail = document.getElementById('profileEmail');
    const inputLocation = document.getElementById('profileLocation');

    if (inputName && !inputName.matches(':focus')) inputName.value = name;
    if (inputPhone && !inputPhone.matches(':focus')) inputPhone.value = phone;
    if (inputEmail && !inputEmail.matches(':focus')) inputEmail.value = email;
    if (inputLocation && !inputLocation.matches(':focus')) inputLocation.value = location;
  };

  // Perform initial UI sync
  window.syncUserProfileUI();

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const loginVal = document.getElementById('loginEmail')?.value.trim() || '';

      let regUsers = [];
      try {
        regUsers = JSON.parse(localStorage.getItem('agroelevage_registered_users') || '[]');
      } catch (err) {}

      let matched = regUsers.find(u => 
        u.email?.toLowerCase() === loginVal.toLowerCase() || 
        u.phone === loginVal || 
        u.name?.toLowerCase() === loginVal.toLowerCase()
      );

      let finalName = '';
      let finalRole = 'Producteur Certifié';
      let finalPhone = '+237 693 412 317';
      let finalEmail = loginVal || 'kenfoloic3@gmail.com';
      let finalLocation = 'Yaoundé, Cameroun';

      if (matched) {
        finalName = matched.name;
        finalRole = matched.role || finalRole;
        finalPhone = matched.phone || finalPhone;
        finalEmail = matched.email || finalEmail;
        finalLocation = matched.location || finalLocation;
      } else {
        if (loginVal.includes('@')) {
          const part = loginVal.split('@')[0];
          finalName = part.charAt(0).toUpperCase() + part.slice(1).replace(/[._-]/g, ' ');
        } else if (loginVal) {
          finalName = loginVal;
        } else {
          finalName = 'Kenfo Loic';
        }
      }

      const loggedUser = {
        name: finalName,
        email: finalEmail,
        phone: finalPhone,
        role: finalRole,
        location: finalLocation
      };

      localStorage.setItem('ago_logged_in', 'true');
      localStorage.setItem('ago_user_fullname', finalName);
      localStorage.setItem('ago_user_email', finalEmail);
      localStorage.setItem('ago_user_phone', finalPhone);
      localStorage.setItem('ago_user_role', finalRole);
      localStorage.setItem('ago_user_location', finalLocation);
      localStorage.setItem('agroelevage_user', JSON.stringify(loggedUser));

      window.syncUserProfileUI();
      window.closeLoginModal();
      if (typeof showToast === 'function') {
        showToast(`Connexion réussie ! Bienvenue ${finalName}.`);
      }
    });
  }

  // Logout click handler: Clears session and shows notification
  document.querySelectorAll('.web-logout-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('ago_logged_in');
      localStorage.removeItem('agroelevage_user');
      localStorage.removeItem('agroelevage_token');

      if (typeof showToast === 'function') {
        showToast('Déconnexion effectuée.');
      }
      window.syncUserProfileUI();
    });
  });

  // Initialize notification badge update on DOM load
  if (typeof updateNotificationBadges === 'function') {
    updateNotificationBadges();
  }
});

// --- CENTRALIZED USER NOTIFICATIONS SYSTEM ---
window.addUserNotification = function(title, message, type = 'info', link = null) {
  let notifs = JSON.parse(localStorage.getItem('ago_notifications') || '[]');
  const newNotif = {
    id: 'notif_' + Date.now(),
    title: title,
    message: message,
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    date: 'Aujourd\'hui',
    type: type,
    link: link || 'notifications.html',
    isRead: false
  };

  notifs.unshift(newNotif);
  localStorage.setItem('ago_notifications', JSON.stringify(notifs));

  // Update UI Badges
  if (typeof updateNotificationBadges === 'function') {
    updateNotificationBadges();
  }

  // Display Toast Notification
  const cleanTitle = (title || '').replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
  const cleanMessage = (message || '').replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
  newNotif.title = cleanTitle;
  newNotif.message = cleanMessage;

  if (typeof showToast === 'function') {
    showToast(`${cleanTitle} : ${cleanMessage}`);
  } else {
    let toast = document.getElementById('appToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-msg';
      toast.id = 'appToast';
      document.body.appendChild(toast);
    }
    toast.textContent = `${cleanTitle} : ${cleanMessage}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
  }
};

window.updateNotificationBadges = function() {
  const notifs = JSON.parse(localStorage.getItem('ago_notifications') || '[]');
  const unreadCount = notifs.filter(n => !n.isRead).length;

  document.querySelectorAll('.web-nav-notif-badge, .web-notif-dot').forEach(el => {
    if (el.classList.contains('web-notif-dot')) {
      el.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    } else {
      if (unreadCount > 0) {
        el.textContent = unreadCount;
        el.style.display = 'inline-block';
      } else {
        el.textContent = '';
        el.style.display = 'none';
      }
    }
  });
};

// --- CENTRALIZED REAL SMS & WHATSAPP NOTIFICATION SYSTEM ---
window.openWhatsAppDirect = function(phone = '+237 693 412 317', title = 'Notification AgroElevage Link', message = '') {
  const cleanPhone = (phone || '').replace(/[^\d]/g, '') || '237693412317';
  const waFormattedText = ` *AGROELEVAGE LINK — ALERTE COMMANDE*

 *${title}*
${message}

 Plateforme : ${window.location.href}`;

  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waFormattedText)}`;
  window.open(waUrl, '_blank');
  return waUrl;
};

window.sendSmsWhatsappNotification = function(phone = '+237 693 412 317', title = 'Nouvelle Commande', message = '', link = 'notifications.html', openWhatsApp = true) {
  const isSmsEnabled = localStorage.getItem('ago_sms_whatsapp_alerts') !== 'false';
  if (!isSmsEnabled) {
    console.log('[SMS & WhatsApp] Alertes désactivées par l\'utilisateur.');
    return false;
  }

  const cleanPhone = (phone || '').replace(/[^\d]/g, '') || '237693412317';
  const waFormattedText = ` *AGROELEVAGE LINK — NOTIFICATION*

 *${title}*
${message}

 Destinataire : +${cleanPhone}
 Accès rapide : ${window.location.origin + '/' + link}`;

  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waFormattedText)}`;

  // Record in notifications center
  window.addUserNotification(
    `[WhatsApp & SMS] ${title}`,
    `Message WhatsApp envoyé au +${cleanPhone} : ${message}`,
    'order',
    link
  );

  // Play subtle audio chime
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch (e) {
    // Audio context may be restricted before gesture
  }

  // Create or reuse visual push banner
  let banner = document.getElementById('smsPushNotificationBanner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'smsPushNotificationBanner';
    banner.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 420px;
      width: calc(100vw - 40px);
      background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
      color: #ffffff;
      border-radius: 14px;
      box-shadow: 0 14px 36px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.18);
      padding: 16px 18px;
      z-index: 999999;
      font-family: 'Inter', -apple-system, sans-serif;
      transform: translateY(-120%);
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(banner);
  }

  banner.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="width: 32px; height: 32px; border-radius: 10px; background: #25d366; display: flex; align-items: center; justify-content: center; font-size: 16px;">
          
        </div>
        <div>
          <strong style="font-size: 13px; letter-spacing: 0.5px; text-transform: uppercase; color: #a7f3d0; display: block;">Message WhatsApp</strong>
          <div style="font-size: 11px; color: #e2e8f0; opacity: 0.95;">Numéro : <strong>+${cleanPhone}</strong></div>
        </div>
      </div>
      <button id="btnCloseSmsBanner" style="background: transparent; border: none; color: #ffffff; cursor: pointer; font-size: 16px; opacity: 0.7; padding: 2px;"></button>
    </div>
    <div style="background: rgba(0,0,0,0.22); padding: 10px 12px; border-radius: 8px; border-left: 3px solid #25d366;">
      <strong style="font-size: 13px; display: block; margin-bottom: 3px; color: #ffffff;">${title}</strong>
      <p style="font-size: 12px; margin: 0; line-height: 1.4; color: #f0fdf4;">${message}</p>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 11px; padding-top: 4px;">
      <span style="opacity: 0.85; font-size: 11px;"> Prêt pour WhatsApp</span>
      <a href="${waUrl}" target="_blank" id="btnOpenWaDirect" style="background: #25d366; color: #022c22; text-decoration: none; font-weight: 800; padding: 6px 12px; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(37,211,102,0.4);">
        <span> Ouvrir mon WhatsApp</span> →
      </a>
    </div>
  `;

  // Animate in
  setTimeout(() => {
    banner.style.transform = 'translateY(0)';
    banner.style.opacity = '1';
  }, 50);

  // Auto open WhatsApp directly in new tab if requested
  if (openWhatsApp) {
    try {
      window.open(waUrl, '_blank');
    } catch (e) {
      console.log('Popup prevented, fallback to banner button.');
    }
  }

  // Close handler
  const closeBtn = document.getElementById('btnCloseSmsBanner');
  if (closeBtn) {
    closeBtn.onclick = () => {
      banner.style.transform = 'translateY(-120%)';
      banner.style.opacity = '0';
    };
  }

  // Auto dismiss after 8 seconds
  if (window._smsBannerTimeout) clearTimeout(window._smsBannerTimeout);
  window._smsBannerTimeout = setTimeout(() => {
    if (banner) {
      banner.style.transform = 'translateY(-120%)';
      banner.style.opacity = '0';
    }
  }, 8000);

  return true;
};

// Initialize Default Notifications if Empty
if (!localStorage.getItem('ago_notifications')) {
  const defaultNotifs = [
    {
      id: 'notif_1',
      title: 'Bienvenue sur AgroElevage Link',
      message: 'Votre compte est actif. Vos alertes SMS (+237 693 412 317) et WhatsApp sont opérationnelles pour les commandes et paiements.',
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      date: 'Aujourd\'hui',
      type: 'info',
      link: 'profil.html',
      isRead: false
    }
  ];
  localStorage.setItem('ago_notifications', JSON.stringify(defaultNotifs));
}

