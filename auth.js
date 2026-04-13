// auth.js - Email/Password Authentication for WhaPay
// Offline registration: 0140933042 (voice call or SMS)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==================== FIREBASE CONFIGURATION ====================
const firebaseConfig = {
  apiKey: "AIzaSyDPAvq6BgpdfZAkfoEwdwmHrWedHgzjRSk",
  authDomain: "whapay-c93ab.firebaseapp.com",
  projectId: "whapay-c93ab",
  storageBucket: "whapay-c93ab.firebasestorage.app",
  messagingSenderId: "205456952458",
  appId: "1:205456952458:web:6533921ca10a2988417173"
};

// ==================== INITIALIZE FIREBASE SERVICES ====================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Expose globally for use in other scripts
window.auth = auth;
window.db = db;
window.currentUser = null;

// ==================== HELPER FUNCTIONS ====================

/**
 * Display a toast notification
 * @param {string} msg - Message to display
 * @param {boolean} isError - Whether the message is an error
 */
function showToast(msg, isError = false) {
  let toast = document.getElementById('whapay-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'whapay-toast';
    toast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full text-sm z-50 transition-opacity duration-300 opacity-0';
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.style.backgroundColor = isError ? '#dc2626' : '#16a34a';
  toast.classList.remove('opacity-0');
  toast.classList.add('opacity-100');
  setTimeout(() => {
    toast.classList.remove('opacity-100');
    toast.classList.add('opacity-0');
  }, 4000);
}

/**
 * Update UI elements based on authentication state
 */
function updateAuthUI() {
  const loginBtn = document.getElementById('navLoginBtn');
  const logoutBtn = document.getElementById('navLogoutBtn');
  const userDisplay = document.getElementById('userEmailDisplay') || document.getElementById('userPhoneDisplay');
  
  if (window.currentUser) {
    // User is logged in
    if (loginBtn) loginBtn.classList.add('hidden');
    if (logoutBtn) logoutBtn.classList.remove('hidden');
    if (userDisplay) {
      userDisplay.innerText = window.currentUser.email;
      userDisplay.classList.remove('hidden');
    }
  } else {
    // User is logged out
    if (loginBtn) loginBtn.classList.remove('hidden');
    if (logoutBtn) logoutBtn.classList.add('hidden');
    if (userDisplay) userDisplay.classList.add('hidden');
  }
}

/**
 * Create and inject the login modal into the DOM
 */
function injectLoginModal() {
  // Prevent duplicate injection
  if (document.getElementById('loginModal')) return;
  
  const modalHTML = `
    <div id="loginModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden transition-opacity duration-300">
      <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl transform transition-transform duration-300 scale-95">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-800">Admin Login</h2>
          <button id="closeLoginModal" class="text-gray-400 hover:text-gray-600 text-2xl transition">&times;</button>
        </div>
        
        <div>
          <input type="email" id="loginEmail" placeholder="Email Address" 
                 class="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
          <input type="password" id="loginPassword" placeholder="Password" 
                 class="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
          <button id="loginBtn" class="bg-green-600 hover:bg-green-700 text-white font-semibold w-full py-2 rounded-lg transition duration-200">
            Login
          </button>
          <div id="loginError" class="text-red-500 text-sm mt-3 text-center"></div>
        </div>
        
        <div class="mt-4 pt-3 border-t border-gray-100">
          <p class="text-xs text-gray-500 text-center">Admin only: use your Firebase Auth credentials</p>
          <p class="text-xs text-gray-500 text-center mt-1">
            <i class="fas fa-phone-alt mr-1"></i> Offline registration: call 
            <strong class="font-mono text-green-600">0140933042</strong> (voicemail) or SMS to same number
          </p>
          <p class="text-xs text-gray-500 text-center">
            <i class="fab fa-whatsapp mr-1 text-green-500"></i> WhatsApp: 
            <strong class="font-mono text-green-600">0140933042</strong>
          </p>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Attach event listeners
  const closeBtn = document.getElementById('closeLoginModal');
  const loginBtn = document.getElementById('loginBtn');
  const modal = document.getElementById('loginModal');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => window.hideLoginModal());
  }
  
  if (loginBtn) {
    loginBtn.addEventListener('click', handleLogin);
  }
  
  // Close modal when clicking outside
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) window.hideLoginModal();
    });
  }
  
  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      window.hideLoginModal();
    }
  });
}

/**
 * Handle login form submission
 */
async function handleLogin() {
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const errorDiv = document.getElementById('loginError');
  
  const email = emailInput?.value.trim() || '';
  const password = passwordInput?.value || '';
  
  // Clear previous error
  if (errorDiv) errorDiv.innerText = '';
  
  // Validate inputs
  if (!email) {
    if (errorDiv) errorDiv.innerText = 'Email is required';
    if (emailInput) emailInput.focus();
    return;
  }
  
  if (!password) {
    if (errorDiv) errorDiv.innerText = 'Password is required';
    if (passwordInput) passwordInput.focus();
    return;
  }
  
  // Disable button during login attempt
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Logging in...';
  }
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.hideLoginModal();
    showToast(`Welcome back, ${email.split('@')[0]}!`);
    
    // Clear form fields
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
  } catch (err) {
    let errorMessage = 'Login failed. ';
    switch (err.code) {
      case 'auth/invalid-email':
        errorMessage += 'Invalid email format.';
        break;
      case 'auth/user-not-found':
        errorMessage += 'No account found with this email.';
        break;
      case 'auth/wrong-password':
        errorMessage += 'Incorrect password.';
        break;
      case 'auth/too-many-requests':
        errorMessage += 'Too many failed attempts. Please try again later.';
        break;
      default:
        errorMessage += err.message;
    }
    if (errorDiv) errorDiv.innerText = errorMessage;
    showToast(errorMessage, true);
  } finally {
    // Re-enable button
    if (loginBtn) {
      loginBtn.disabled = false;
      loginBtn.innerHTML = 'Login';
    }
  }
}

// ==================== EXPOSED GLOBAL FUNCTIONS ====================

/**
 * Show the login modal
 */
window.showLoginModal = function() {
  const modal = document.getElementById('loginModal');
  const errorDiv = document.getElementById('loginError');
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  
  if (modal) {
    modal.classList.remove('hidden');
    // Focus on email input after modal is visible
    setTimeout(() => emailInput?.focus(), 100);
  }
  if (errorDiv) errorDiv.innerText = '';
  if (emailInput) emailInput.value = '';
  if (passwordInput) passwordInput.value = '';
};

/**
 * Hide the login modal
 */
window.hideLoginModal = function() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.add('hidden');
  const errorDiv = document.getElementById('loginError');
  if (errorDiv) errorDiv.innerText = '';
};

/**
 * Log out the current user
 */
window.logoutUser = async function() {
  try {
    await signOut(auth);
    window.currentUser = null;
    updateAuthUI();
    showToast('Logged out successfully');
    
    // If on admin page, redirect to home
    if (window.location.pathname.includes('admin.html')) {
      window.location.href = 'index.html';
    }
  } catch (err) {
    console.error('Logout error:', err);
    showToast('Error logging out', true);
  }
};

// ==================== AUTHENTICATION STATE LISTENER ====================

/**
 * Initialize authentication and listen for state changes
 */
function initAuth() {
  injectLoginModal();
  
  onAuthStateChanged(auth, (user) => {
    window.currentUser = user;
    updateAuthUI();
    
    // Dispatch custom event for any page that wants to listen
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user } }));
    
    // Log state change for debugging
    if (user) {
      console.log('Auth: User logged in -', user.email);
    } else {
      console.log('Auth: User logged out');
    }
  });
}

// ==================== START AUTHENTICATION ====================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}




