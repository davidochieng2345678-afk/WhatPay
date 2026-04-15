// global.js - Simplified Working Version

document.addEventListener('DOMContentLoaded', function() {
    initScrollToTop();
    initDarkMode();
});

// Scroll to Top
function initScrollToTop() {
    let scrollBtn = document.querySelector('.scroll-top');
    if (!scrollBtn) {
        scrollBtn = document.createElement('div');
        scrollBtn.className = 'scroll-top';
        scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        document.body.appendChild(scrollBtn);
        
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });
}

// Dark Mode Toggle
function initDarkMode() {
    const savedMode = localStorage.getItem('whapay-dark-mode');
    if (savedMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
    
    // Find or create dark mode button
    let darkBtn = document.getElementById('darkModeToggle');
    if (!darkBtn) {
        darkBtn = document.createElement('button');
        darkBtn.id = 'darkModeToggle';
        darkBtn.innerHTML = '<i class="fas fa-moon"></i>';
        darkBtn.style.cssText = 'background: none; border: none; cursor: pointer; padding: 8px;';
        
        const headerRight = document.querySelector('header .flex.items-center, header .flex.gap-4');
        if (headerRight) {
            headerRight.insertBefore(darkBtn, headerRight.firstChild);
        }
        
        darkBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('whapay-dark-mode', isDark ? 'enabled' : 'disabled');
            darkBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            showToast(isDark ? 'Dark mode on' : 'Light mode on');
        });
    }
}

// Toast function
window.showToast = function(message, isError = false) {
    let toast = document.getElementById('globalToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'globalToast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.style.backgroundColor = isError ? '#dc2626' : '#16a34a';
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
};

console.log('Global JS loaded');
