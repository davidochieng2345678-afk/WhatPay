// global.js - WhaPay Global Scripts (Final Version)

// ========== UTILITIES ==========
function log(message, type = 'info') {
  if (type === 'error') {
    console.error(`[WhaPay] ${message}`);
  } else {
    console.log(`[WhaPay] ${message}`);
  }
}

// ========== NETWORK STATUS DETECTION ==========
function initNetworkStatus() {
  function updateNetworkStatus() {
    const isOnline = navigator.onLine;
    if (!isOnline) {
      showToast('You are offline. Some features may be limited.', 'info');
    }
  }
  
  window.addEventListener('online', () => {
    showToast('Connection restored! Syncing data...', 'success');
    // Dispatch event for other scripts to sync
    window.dispatchEvent(new CustomEvent('whapay-online'));
  });
  
  window.addEventListener('offline', () => {
    showToast('No internet connection. Offline mode active.', 'info');
    window.dispatchEvent(new CustomEvent('whapay-offline'));
  });
  
  updateNetworkStatus();
}

// ========== PWA INSTALL PROMPT ==========
let deferredPrompt;
let installBanner = null;

function initPWAInstall() {
  // Create install banner element if not exists
  if (!document.querySelector('.install-banner')) {
    const banner = document.createElement('div');
    banner.className = 'install-banner';
    banner.id = 'installBanner';
    banner.innerHTML = `
      <div>
        <strong>Install WhaPay App</strong>
        <p style="font-size: 12px; margin-top: 4px;">Get faster access and offline support</p>
      </div>
      <div style="display: flex; gap: 10px;">
        <button id="installAppBtn">Install</button>
        <button id="closeBannerBtn" class="close-banner">✕</button>
      </div>
    `;
    document.body.appendChild(banner);
    installBanner = document.getElementById('installBanner');
    
    document.getElementById('closeBannerBtn')?.addEventListener('click', () => {
      installBanner.classList.remove('show');
      localStorage.setItem('whapay-install-dismissed', 'true');
    });
  }
  
  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install banner if not dismissed before
    const dismissed = localStorage.getItem('whapay-install-dismissed');
    if (!dismissed && installBanner) {
      setTimeout(() => {
        installBanner.classList.add('show');
      }, 2000);
    }
  });
  
  // Handle install button click
  document.getElementById('installAppBtn')?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      log('User accepted install prompt');
      showToast('Installing WhaPay app...', 'success');
      if (installBanner) installBanner.classList.remove('show');
    } else {
      log('User dismissed install prompt');
    }
    
    deferredPrompt = null;
  });
  
  // Check if already installed
  window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
    if (e.matches) {
      log('App is now installed');
      if (installBanner) installBanner.style.display = 'none';
    }
  });
  
  if (window.matchMedia('(display-mode: standalone)').matches) {
    log('App is running in standalone mode');
    if (installBanner) installBanner.style.display = 'none';
  }
}

// ========== BOTTOM NAVIGATION (App-like feel) ==========
function initBottomNavigation() {
  // Check if bottom nav already exists
  if (document.querySelector('.bottom-nav')) return;
  
  // Only show on mobile devices
  if (window.innerWidth > 768) return;
  
  const navItems = [
    { icon: 'fas fa-home', name: 'Home', url: 'index.html' },
    { icon: 'fas fa-store', name: 'Merchant', url: 'merchant.html' },
    { icon: 'fas fa-credit-card', name: 'Pay', url: 'payment.html' },
    { icon: 'fas fa-chart-line', name: 'Reports', url: 'reports.html' },
    { icon: 'fas fa-user', name: 'Account', url: 'users.html' }
  ];
  
  const bottomNav = document.createElement('div');
  bottomNav.className = 'bottom-nav';
  
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  
  navItems.forEach(item => {
    const link = document.createElement('a');
    link.href = item.url;
    link.innerHTML = `<i class="${item.icon}"></i><span>${item.name}</span>`;
    if (currentPath === item.url) {
      link.classList.add('active');
    }
    bottomNav.appendChild(link);
  });
  
  document.body.appendChild(bottomNav);
  
  // Add padding to body to account for bottom nav
  document.body.style.paddingBottom = '70px';
}

// ========== MOBILE HAMBURGER MENU ==========
function initMobileMenu() {
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
    
    // Close menu when clicking a link
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }
}

// ========== DARK MODE TOGGLE ==========
function initDarkMode() {
  const darkModeBtn = document.getElementById('darkModeToggle');
  if (!darkModeBtn) return;
  
  // Check localStorage for saved preference
  const savedMode = localStorage.getItem('whapay-dark-mode');
  if (savedMode === 'enabled') {
    document.body.classList.add('dark-mode');
    updateDarkModeIcon(true);
  }
  
  darkModeBtn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('whapay-dark-mode', isDark ? 'enabled' : 'disabled');
    updateDarkModeIcon(isDark);
    showToast(isDark ? 'Dark mode enabled' : 'Light mode enabled', 'info');
  });
}

function updateDarkModeIcon(isDark) {
  const darkModeBtn = document.getElementById('darkModeToggle');
  if (!darkModeBtn) return;
  
  if (isDark) {
    darkModeBtn.innerHTML = '<i class="fas fa-sun text-yellow-400"></i>';
  } else {
    darkModeBtn.innerHTML = '<i class="fas fa-moon"></i>';
  }
}

// ========== SCROLL TO TOP BUTTON ==========
function initScrollToTop() {
  // Check if button already exists
  if (document.querySelector('.scroll-top')) return;
  
  const scrollBtn = document.createElement('div');
  scrollBtn.className = 'scroll-top';
  scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  document.body.appendChild(scrollBtn);
  
  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  });
}

// ========== STATS COUNTER ANIMATION ==========
function animateCounter(element, target, duration = 2000) {
  if (!element) return;
  let start = 0;
  const increment = target / (duration / 16);
  let timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      element.innerText = target.toLocaleString();
      clearInterval(timer);
    } else {
      element.innerText = Math.floor(start).toLocaleString();
    }
  }, 16);
}

function initStatsCounters() {
  const counters = document.querySelectorAll('.stat-number');
  if (counters.length === 0) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const target = parseInt(element.getAttribute('data-target') || '0');
        animateCounter(element, target);
        observer.unobserve(element);
      }
    });
  }, { threshold: 0.5 });
  
  counters.forEach(counter => observer.observe(counter));
}

// ========== IMPROVED TOAST FUNCTION ==========
window.showToast = function(message, type = 'success', duration = 3000) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 text-white px-5 py-3 rounded-full text-sm z-50 transition-all duration-300 opacity-0 translate-y-4';
    document.body.appendChild(toast);
  }
  
  toast.innerText = message;
  
  // Set color based on type
  const colors = {
    success: 'linear-gradient(135deg, #16a34a, #15803d)',
    error: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    info: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    warning: 'linear-gradient(135deg, #f59e0b, #d97706)'
  };
  
  toast.style.background = colors[type] || colors.success;
  
  // Clear any existing timeout
  if (window.toastTimeout) clearTimeout(window.toastTimeout);
  
  // Animate in
  toast.classList.remove('opacity-0', 'translate-y-4');
  toast.classList.add('opacity-100', 'translate-y-0');
  
  // Animate out after duration
  window.toastTimeout = setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'translate-y-4');
  }, duration);
};

// ========== ADD MOBILE MENU BUTTON TO HEADER ==========
function addMobileMenuButton() {
  const header = document.querySelector('header .max-w-7xl');
  if (!header || document.getElementById('mobileMenuBtn')) return;
  
  const existingNav = header.querySelector('nav');
  if (!existingNav) return;
  
  // Create mobile menu button
  const mobileBtn = document.createElement('button');
  mobileBtn.id = 'mobileMenuBtn';
  mobileBtn.className = 'md:hidden text-white focus:outline-none';
  mobileBtn.setAttribute('aria-label', 'Menu');
  mobileBtn.innerHTML = '<i class="fas fa-bars text-2xl"></i>';
  
  // Create mobile menu container
  const mobileMenu = document.createElement('div');
  mobileMenu.id = 'mobileMenu';
  mobileMenu.className = 'hidden md:hidden absolute top-16 left-0 right-0 bg-green-700 p-4 shadow-lg z-50';
  mobileMenu.setAttribute('aria-label', 'Mobile navigation');
  
  // Copy navigation links
  const navLinks = existingNav.cloneNode(true);
  navLinks.className = 'flex flex-col space-y-3';
  mobileMenu.appendChild(navLinks);
  
  // Insert elements
  const headerContainer = document.querySelector('header .max-w-7xl .flex.items-center');
  if (headerContainer) {
    headerContainer.insertBefore(mobileBtn, headerContainer.firstChild);
  }
  document.querySelector('header').appendChild(mobileMenu);
}

// ========== ADD DARK MODE TOGGLE TO HEADER ==========
function addDarkModeToggle() {
  const headerRight = document.querySelector('header .max-w-7xl .flex.items-center');
  if (!headerRight || document.getElementById('darkModeToggle')) return;
  
  const darkModeBtn = document.createElement('button');
  darkModeBtn.id = 'darkModeToggle';
  darkModeBtn.className = 'text-white focus:outline-none';
  darkModeBtn.setAttribute('aria-label', 'Dark mode');
  darkModeBtn.innerHTML = '<i class="fas fa-moon"></i>';
  
  headerRight.insertBefore(darkModeBtn, headerRight.firstChild);
}

// ========== PAGE LOADING INDICATOR ==========
function initPageLoader() {
  // Create loader element
  const loader = document.createElement('div');
  loader.id = 'pageLoader';
  loader.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.3s;
  `;
  loader.innerHTML = '<div class="spinner"></div>';
  
  // Only show if page takes more than 300ms
  let loaderTimeout = setTimeout(() => {
    document.body.appendChild(loader);
  }, 300);
  
  window.addEventListener('load', () => {
    clearTimeout(loaderTimeout);
    if (loader.parentNode) {
      loader.style.opacity = '0';
      setTimeout(() => {
        if (loader.parentNode) loader.remove();
      }, 300);
    }
  });
}

// ========== AUTO-SAVE FORM DATA (for offline) ==========
function initAutoSave() {
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    const formId = form.id || `form_${Math.random()}`;
    
    // Restore saved data
    const savedData = localStorage.getItem(`form_${formId}`);
    if (savedData) {
      const data = JSON.parse(savedData);
      for (const [name, value] of Object.entries(data)) {
        const input = form.querySelector(`[name="${name}"]`);
        if (input) input.value = value;
      }
    }
    
    // Save data on input
    form.addEventListener('input', () => {
      const formData = new FormData(form);
      const data = {};
      for (const [key, value] of formData.entries()) {
        data[key] = value;
      }
      localStorage.setItem(`form_${formId}`, JSON.stringify(data));
    });
    
    // Clear saved data on successful submit
    form.addEventListener('submit', () => {
      localStorage.removeItem(`form_${formId}`);
    });
  });
}

// ========== PULL TO REFRESH (for PWA) ==========
function initPullToRefresh() {
  let startY = 0;
  let isRefreshing = false;
  
  document.addEventListener('touchstart', (e) => {
    if (window.scrollY === 0) {
      startY = e.touches[0].clientY;
    }
  });
  
  document.addEventListener('touchmove', (e) => {
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    
    if (diff > 80 && window.scrollY === 0 && !isRefreshing) {
      isRefreshing = true;
      showToast('Refreshing...', 'info');
      window.location.reload();
    }
  });
}

// ========== INITIALIZE ALL ==========
document.addEventListener('DOMContentLoaded', () => {
  log('Initializing global scripts');
  
  addMobileMenuButton();
  addDarkModeToggle();
  initMobileMenu();
  initDarkMode();
  initScrollToTop();
  initStatsCounters();
  initNetworkStatus();
  initPWAInstall();
  initBottomNavigation();
  initAutoSave();
  initPageLoader();
  
  // Pull to refresh only on mobile PWA
  if (window.matchMedia('(display-mode: standalone)').matches && window.innerWidth < 768) {
    initPullToRefresh();
  }
  
  log('Global scripts initialized successfully');
});

// ========== EXPOSE FUNCTIONS GLOBALLY ==========
window.whapay = {
  showToast,
  log,
  isOnline: () => navigator.onLine
};
