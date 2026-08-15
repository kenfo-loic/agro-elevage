document.addEventListener('DOMContentLoaded', () => {
  // Global State
  const toast = document.getElementById('appToast');
  const statusTime = document.getElementById('statusTime');
  const deviceContainer = document.getElementById('deviceContainer');
  const toggleFrameBtn = document.getElementById('toggleFrameBtn');

  // Real-time Clock
  function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    if (statusTime) statusTime.textContent = `${hours}:${minutes}`;
  }
  updateClock();
  setInterval(updateClock, 30000);

  // Toast Helper
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }

  // --- App Sidebar Navigation ---
  const btnAppMenu = document.getElementById('btnAppMenu');
  const appSidebar = document.getElementById('appSidebar');
  const appSidebarOverlay = document.getElementById('appSidebarOverlay');
  const btnCloseSidebar = document.getElementById('btnCloseSidebar');

  function openSidebar() {
    if (appSidebar) appSidebar.classList.add('active');
    if (appSidebarOverlay) appSidebarOverlay.classList.add('active');
  }

  function closeSidebar() {
    if (appSidebar) appSidebar.classList.remove('active');
    if (appSidebarOverlay) appSidebarOverlay.classList.remove('active');
  }

  if (btnAppMenu) btnAppMenu.addEventListener('click', openSidebar);
  if (btnCloseSidebar) btnCloseSidebar.addEventListener('click', closeSidebar);
  if (appSidebarOverlay) appSidebarOverlay.addEventListener('click', closeSidebar);

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

  // Toggle Frame Mockup (Smartphone <-> Fullscreen)
  if (toggleFrameBtn && deviceContainer) {
    toggleFrameBtn.addEventListener('click', () => {
      const isFullscreen = deviceContainer.classList.toggle('mode-fullscreen');
      toggleFrameBtn.innerHTML = isFullscreen 
        ? `<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span> <span>Mode Smartphone</span>` 
        : `<span>️</span> <span>Plein Écran</span>`;
      showToast(isFullscreen ? 'Vue Plein Écran activée' : 'Vue Smartphone activée');
    });
  }

  // Map Initialization
  if (document.getElementById('mapView') && typeof L !== 'undefined') {
    const map = L.map('mapView', { zoomControl: false }).setView([3.8480, 11.5021], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
  }

  // Chart Initialization
  const ctx = document.getElementById('salesChart');
  if (ctx && typeof Chart !== 'undefined') {
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        datasets: [{
          label: 'Ventes (FCFA)',
          data: [15000, 22000, 18000, 30000, 25000, 40000, 35000],
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22, 163, 74, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: '#f0fdf4' } }
        }
      }
    });
  }

  // Toggle Password Visibility
  const togglePasswordBtns = document.querySelectorAll('.toggle-password-btn');
  togglePasswordBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          btn.textContent = '';
        } else {
          input.type = 'password';
          btn.textContent = '️';
        }
      }
    });
  });

  // Dashboard Quick Actions Handlers
  const actSellerAddProd = document.getElementById('actSellerAddProd');
  const actSellerMyProds = document.getElementById('actSellerMyProds');
  const actSellerOrders = document.getElementById('actSellerOrders');
  const actSellerNaturIA = document.getElementById('actSellerNaturIA');
  const btnSellerNotif = document.getElementById('btnSellerNotif');

  if (actSellerAddProd) actSellerAddProd.addEventListener('click', () => window.location.href = 'ajouter_produit.html');
  if (actSellerMyProds) actSellerMyProds.addEventListener('click', () => window.location.href = 'mes_produits.html');
  if (actSellerOrders) actSellerOrders.addEventListener('click', () => window.location.href = 'suivi_commande.html');
  if (actSellerNaturIA) actSellerNaturIA.addEventListener('click', () => window.location.href = 'naturia_expert.html');
  if (btnSellerNotif) btnSellerNotif.addEventListener('click', () => window.location.href = 'notifications.html');
});
