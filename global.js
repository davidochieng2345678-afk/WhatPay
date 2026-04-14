// ========================================
// WHAPAY GLOBAL JAVASCRIPT
// World-Class Professional Interactions
// ========================================

// ========== DOM Ready Check ==========
document.addEventListener('DOMContentLoaded', function() {
    initDarkMode();
    initScrollToTop();
    initMobileMenu();
    initToastSystem();
    initFormValidation();
    initCounters();
    initTooltips();
    initDropdowns();
    initTabs();
    initModals();
    initCopyButtons();
    initPasswordToggle();
    initNotificationBadge();
    initOfflineDetection();
    initPWAInstall();
});

// ========== DARK MODE ==========
function initDarkMode() {
    // Check for saved preference
    const savedMode = localStorage.getItem('whapay-dark-mode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedMode === 'enabled' || (!savedMode && prefersDark)) {
        document.body.classList.add('dark-mode');
    }
    
    // Create dark mode toggle button if it doesn't exist
    let darkModeBtn = document.getElementById('darkModeToggle');
    if (!darkModeBtn) {
        darkModeBtn = document.createElement('button');
        darkModeBtn.id = 'darkModeToggle';
        darkModeBtn.className = 'dark-mode-toggle';
        darkModeBtn.setAttribute('aria-label', 'Toggle dark mode');
        
        // Find header right section
        const headerRight = document.querySelector('header .flex.items-center, header .flex.gap-4');
        if (headerRight) {
            headerRight.insertBefore(darkModeBtn, headerRight.firstChild);
        }
    }
    
    // Update icon
    updateDarkModeIcon();
    
    // Add click event
    darkModeBtn.addEventListener('click', toggleDarkMode);
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('whapay-dark-mode', isDark ? 'enabled' : 'disabled');
    updateDarkModeIcon();
    showToast(isDark ? 'Dark mode enabled' : 'Light mode enabled', 'info');
}

function updateDarkModeIcon() {
    const isDark = document.body.classList.contains('dark-mode');
    const btn = document.getElementById('darkModeToggle');
    if (btn) {
        btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
}

// ========== SCROLL TO TOP ==========
function initScrollToTop() {
    // Create button if not exists
    let scrollBtn = document.querySelector('.scroll-top');
    if (!scrollBtn) {
        scrollBtn = document.createElement('div');
        scrollBtn.className = 'scroll-top';
        scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        scrollBtn.setAttribute('aria-label', 'Scroll to top');
        document.body.appendChild(scrollBtn);
        
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Show/hide based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });
}

// ========== MOBILE MENU ==========
function initMobileMenu() {
    // Create mobile menu button if not exists
    let mobileBtn = document.getElementById('mobileMenuBtn');
    let mobileMenu = document.getElementById('mobileMenu');
    
    if (!mobileBtn && window.innerWidth < 768) {
        const nav = document.querySelector('header nav');
        if (nav) {
            // Create button
            mobileBtn = document.createElement('button');
            mobileBtn.id = 'mobileMenuBtn';
            mobileBtn.className = 'md:hidden text-gray-600 dark:text-gray-300 focus:outline-none';
            mobileBtn.innerHTML = '<i class="fas fa-bars text-xl"></i>';
            mobileBtn.setAttribute('aria-label', 'Menu');
            
            // Create menu
            mobileMenu = document.createElement('div');
            mobileMenu.id = 'mobileMenu';
            mobileMenu.className = 'fixed inset-0 bg-white dark:bg-gray-800 z-50 transform -translate-x-full transition-transform duration-300 ease-in-out';
            mobileMenu.innerHTML = `
                <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <span class="font-bold text-lg">Menu</span>
                    <button id="closeMobileMenu" class="text-gray-500">&times;</button>
                </div>
                <div class="p-4">
                    ${nav.innerHTML}
                </div>
            `;
            
            const header = document.querySelector('header');
            if (header) {
                const headerContainer = header.querySelector('.flex.justify-between');
                if (headerContainer) {
                    headerContainer.appendChild(mobileBtn);
                }
                document.body.appendChild(mobileMenu);
            }
            
            // Event listeners
            mobileBtn.addEventListener('click', () => {
                mobileMenu.classList.remove('-translate-x-full');
            });
            
            document.getElementById('closeMobileMenu')?.addEventListener('click', () => {
                mobileMenu.classList.add('-translate-x-full');
            });
            
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.add('-translate-x-full');
                });
            });
        }
    }
}

// ========== TOAST SYSTEM ==========
function initToastSystem() {
    // Create toast container if not exists
    if (!document.querySelector('.toast-container')) {
        const container = document.createElement('div');
        container.className = 'toast-container fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50';
        document.body.appendChild(container);
    }
}

window.showToast = function(message, type = 'success', duration = 3000) {
    const container = document.querySelector('.toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} mb-2`;
    toast.innerHTML = `
        <div class="flex items-center gap-2">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove after duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, duration);
};

// ========== FORM VALIDATION ==========
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('error');
                    showError(input, 'This field is required');
                } else {
                    input.classList.remove('error');
                    clearError(input);
                }
                
                // Email validation
                if (input.type === 'email' && input.value.trim()) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value.trim())) {
                        isValid = false;
                        input.classList.add('error');
                        showError(input, 'Enter a valid email address');
                    }
                }
                
                // Phone validation (Kenyan)
                if (input.type === 'tel' && input.value.trim()) {
                    const phoneRegex = /^(\+254|0)?[7-9][0-9]{8}$/;
                    if (!phoneRegex.test(input.value.trim().replace(/\D/g, ''))) {
                        isValid = false;
                        input.classList.add('error');
                        showError(input, 'Enter a valid phone number');
                    }
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showToast('Please fix the errors in the form', 'error');
            }
        });
    });
}

function showError(input, message) {
    let error = input.parentElement.querySelector('.form-error');
    if (!error) {
        error = document.createElement('div');
        error.className = 'form-error';
        input.parentElement.appendChild(error);
    }
    error.textContent = message;
}

function clearError(input) {
    const error = input.parentElement.querySelector('.form-error');
    if (error) {
        error.remove();
    }
}

// ========== ANIMATED COUNTERS ==========
function initCounters() {
    const counters = document.querySelectorAll('.stat-number, [data-counter]');
    if (counters.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const target = parseInt(element.getAttribute('data-target') || element.innerText || 0);
                animateCounter(element, target);
                observer.unobserve(element);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    const isCurrency = element.innerText.includes('KES') || element.getAttribute('data-currency') === 'true';
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.innerText = isCurrency ? `KES ${target.toLocaleString()}` : target.toLocaleString();
            clearInterval(timer);
        } else {
            const value = Math.floor(start);
            element.innerText = isCurrency ? `KES ${value.toLocaleString()}` : value.toLocaleString();
        }
    }, 16);
}

// ========== TOOLTIPS ==========
function initTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(el => {
        el.addEventListener('mouseenter', (e) => {
            const text = el.getAttribute('data-tooltip');
            const tooltip = document.createElement('div');
            tooltip.className = 'fixed bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg z-50 pointer-events-none';
            tooltip.textContent = text;
            tooltip.style.top = `${e.clientY - 30}px`;
            tooltip.style.left = `${e.clientX}px`;
            tooltip.id = 'dynamic-tooltip';
            document.body.appendChild(tooltip);
        });
        
        el.addEventListener('mouseleave', () => {
            document.getElementById('dynamic-tooltip')?.remove();
        });
        
        el.addEventListener('mousemove', (e) => {
            const tooltip = document.getElementById('dynamic-tooltip');
            if (tooltip) {
                tooltip.style.top = `${e.clientY - 30}px`;
                tooltip.style.left = `${e.clientX}px`;
            }
        });
    });
}

// ========== DROPDOWNS ==========
function initDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.dropdown-trigger');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (trigger && menu) {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = menu.classList.contains('show');
                closeAllDropdowns();
                if (!isOpen) {
                    menu.classList.add('show');
                }
            });
        }
    });
    
    document.addEventListener('click', closeAllDropdowns);
}

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
    });
}

// ========== TABS ==========
function initTabs() {
    const tabContainers = document.querySelectorAll('.tabs-container');
    tabContainers.forEach(container => {
        const tabs = container.querySelectorAll('.tab-btn');
        const contents = container.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                
                tab.classList.add('active');
                const activeContent = container.querySelector(`#tab-${tabId}`);
                if (activeContent) activeContent.classList.add('active');
            });
        });
    });
}

// ========== MODALS ==========
function initModals() {
    const modals = document.querySelectorAll('.modal');
    const openBtns = document.querySelectorAll('[data-modal-open]');
    const closeBtns = document.querySelectorAll('[data-modal-close]');
    
    openBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-modal-open');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Close modal on outside click
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    });
}

// ========== COPY BUTTONS ==========
function initCopyButtons() {
    const copyBtns = document.querySelectorAll('[data-copy]');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const textToCopy = btn.getAttribute('data-copy');
            try {
                await navigator.clipboard.writeText(textToCopy);
                showToast('Copied to clipboard!', 'success');
                
                // Change button icon temporarily
                const originalIcon = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    btn.innerHTML = originalIcon;
                }, 2000);
            } catch (err) {
                showToast('Failed to copy', 'error');
            }
        });
    });
}

// ========== PASSWORD TOGGLE ==========
function initPasswordToggle() {
    const toggleBtns = document.querySelectorAll('.password-toggle');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.parentElement.querySelector('input');
            if (input) {
                const type = input.type === 'password' ? 'text' : 'password';
                input.type = type;
                btn.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
            }
        });
    });
}

// ========== NOTIFICATION BADGE ==========
function initNotificationBadge() {
    // Check for pending items in localStorage
    const updateBadge = async () => {
        const pendingKey = 'whapay_pending_items';
        const pending = await localforage?.getItem(pendingKey) || [];
        const unsynced = pending.filter(p => !p.synced).length;
        
        const badge = document.getElementById('pendingSyncBadge');
        if (badge) {
            if (unsynced > 0) {
                badge.textContent = unsynced;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    };
    
    updateBadge();
    
    // Listen for storage events
    window.addEventListener('storage', updateBadge);
}

// ========== OFFLINE DETECTION ==========
function initOfflineDetection() {
    function updateOnlineStatus() {
        if (!navigator.onLine) {
            showToast('You are offline. Some features may be limited.', 'warning');
        }
    }
    
    window.addEventListener('online', () => {
        showToast('Connection restored! Syncing data...', 'success');
        // Dispatch event for other scripts
        window.dispatchEvent(new CustomEvent('whapay-online'));
    });
    
    window.addEventListener('offline', () => {
        showToast('No internet connection. Offline mode active.', 'warning');
        window.dispatchEvent(new CustomEvent('whapay-offline'));
    });
    
    updateOnlineStatus();
}

// ========== PWA INSTALL PROMPT ==========
let deferredPrompt;

function initPWAInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install banner
        const dismissed = localStorage.getItem('whapay-install-dismissed');
        if (!dismissed) {
            showInstallBanner();
        }
    });
}

function showInstallBanner() {
    let banner = document.querySelector('.install-banner');
    if (!banner) {
        banner = document.createElement('div');
        banner.className = 'install-banner';
        banner.innerHTML = `
            <div>
                <strong>Install WhaPay App</strong>
                <p style="font-size: 12px;">Get faster access and offline support</p>
            </div>
            <div style="display: flex; gap: 10px;">
                <button id="installAppBtn">Install</button>
                <button id="closeBannerBtn" class="close-banner">✕</button>
            </div>
        `;
        document.body.appendChild(banner);
        
        document.getElementById('installAppBtn')?.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    showToast('Installing WhaPay app...', 'success');
                }
                deferredPrompt = null;
                banner.classList.remove('show');
            }
        });
        
        document.getElementById('closeBannerBtn')?.addEventListener('click', () => {
            banner.classList.remove('show');
            localStorage.setItem('whapay-install-dismissed', 'true');
        });
        
        setTimeout(() => {
            banner.classList.add('show');
        }, 2000);
    }
}

// ========== LOADING INDICATOR ==========
window.showLoading = function(show = true) {
    let loader = document.getElementById('global-loader');
    if (show && !loader) {
        loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]';
        loader.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(loader);
    } else if (!show && loader) {
        loader.remove();
    }
};

// ========== EXPORT FUNCTIONS GLOBALLY ==========
window.whapay = {
    showToast,
    showLoading,
    toggleDarkMode: toggleDarkMode,
    isDarkMode: () => document.body.classList.contains('dark-mode'),
    isOnline: () => navigator.onLine,
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            showToast('Copied to clipboard!', 'success');
            return true;
        } catch {
            showToast('Failed to copy', 'error');
            return false;
        }
    }
};

// ========== AUTO-APPLY CLASSES ==========
// Add card-hover to all cards
document.querySelectorAll('.card').forEach(card => {
    if (!card.classList.contains('card-hover')) {
        card.classList.add('card-hover');
    }
});

// Add table-container to all tables
document.querySelectorAll('table:not(.data-table)').forEach(table => {
    const container = document.createElement('div');
    container.className = 'table-container';
    table.parentNode.insertBefore(container, table);
    container.appendChild(table);
});

console.log('WhaPay Global JS loaded successfully');
