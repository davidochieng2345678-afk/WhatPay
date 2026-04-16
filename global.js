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



        // ========================================
// WHAPAY GLOBAL AUTHENTICATION SYSTEM
// Supports Email, Phone, Merchant, Admin Login
// ========================================

// Firebase Auth is already initialized in your pages
// This adds the missing functionality

// ========== GLOBAL VARIABLES ==========
let authMode = 'login'; // login, register, phoneLogin, phoneRegister
let confirmationResult = null;

// ========== CREATE AUTH MODAL (if not exists) ==========
function createAuthModal() {
  if (document.getElementById('globalAuthModal')) return;
  
  const modalHTML = `
    <div id="globalAuthModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] hidden">
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div class="flex justify-between items-center mb-4">
          <div class="flex gap-2">
            <button id="authTabLogin" class="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white">Login</button>
            <button id="authTabRegister" class="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Register</button>
          </div>
          <button id="closeAuthModal" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        
        <!-- Login with Email Form -->
        <div id="authEmailLoginForm" class="space-y-4">
          <h2 class="text-xl font-bold text-gray-800 dark:text-white text-center">Login to WhaPay</h2>
          <p class="text-xs text-gray-500 text-center">Access your dashboard, transactions, and payments</p>
          <div>
            <label class="block text-sm font-medium mb-1">Email Address</label>
            <input type="email" id="authEmail" placeholder="you@example.com" class="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Password</label>
            <input type="password" id="authPassword" placeholder="••••••••" class="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600">
          </div>
          <button id="authEmailLoginBtn" class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition">Login</button>
          <div class="text-center text-sm">
            <span class="text-gray-500">Don't have an account? </span>
            <button id="switchToRegister" class="text-green-600 font-semibold">Register here</button>
          </div>
          <div class="relative my-4">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
            </div>
          </div>
          <button id="authPhoneLoginBtn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2">
            <i class="fas fa-phone-alt"></i> Login with Phone Number
          </button>
        </div>
        
        <!-- Register Form -->
        <div id="authRegisterForm" class="hidden space-y-4">
          <h2 class="text-xl font-bold text-gray-800 dark:text-white text-center">Create Account</h2>
          <p class="text-xs text-gray-500 text-center">Join WhaPay to send and receive payments</p>
          <div>
            <label class="block text-sm font-medium mb-1">Full Name</label>
            <input type="text" id="regFullName" placeholder="John Doe" class="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Email Address</label>
            <input type="email" id="regEmail" placeholder="you@example.com" class="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Phone Number (optional)</label>
            <input type="tel" id="regPhone" placeholder="+254712345678" class="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Password</label>
            <input type="password" id="regPassword" placeholder="••••••••" class="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Confirm Password</label>
            <input type="password" id="regConfirmPassword" placeholder="••••••••" class="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600">
          </div>
          <button id="authRegisterBtn" class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition">Create Account</button>
          <div class="text-center text-sm">
            <span class="text-gray-500">Already have an account? </span>
            <button id="switchToLogin" class="text-green-600 font-semibold">Login here</button>
          </div>
        </div>
        
        <!-- Phone Login Form -->
        <div id="authPhoneForm" class="hidden space-y-4">
          <h2 class="text-xl font-bold text-gray-800 dark:text-white text-center">Login with Phone</h2>
          <p class="text-xs text-gray-500 text-center">We'll send you a verification code</p>
          <div>
            <label class="block text-sm font-medium mb-1">Phone Number</label>
            <input type="tel" id="phoneLoginNumber" placeholder="+254712345678" class="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600">
          </div>
          <div id="phoneCodeSection" class="hidden">
            <label class="block text-sm font-medium mb-1">Verification Code</label>
            <input type="text" id="phoneVerificationCode" placeholder="123456" class="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600">
          </div>
          <button id="authSendCodeBtn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">Send Code</button>
          <button id="authVerifyCodeBtn" class="hidden w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition">Verify & Login</button>
          <div class="text-center text-sm">
            <button id="backToEmailLogin" class="text-green-600 font-semibold">← Back to email login</button>
          </div>
        </div>
        
        <div id="authMessage" class="text-sm text-center mt-3 text-red-500"></div>
        <p class="text-xs text-gray-400 text-center mt-4">Offline registration: <strong class="font-mono">0140933042</strong></p>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Add event listeners
  const modal = document.getElementById('globalAuthModal');
  const closeBtn = document.getElementById('closeAuthModal');
  const tabLogin = document.getElementById('authTabLogin');
  const tabRegister = document.getElementById('authTabRegister');
  const emailLoginForm = document.getElementById('authEmailLoginForm');
  const registerForm = document.getElementById('authRegisterForm');
  const phoneForm = document.getElementById('authPhoneForm');
  const switchToRegister = document.getElementById('switchToRegister');
  const switchToLogin = document.getElementById('switchToLogin');
  const backToEmailLogin = document.getElementById('backToEmailLogin');
  const phoneLoginBtn = document.getElementById('authPhoneLoginBtn');
  const sendCodeBtn = document.getElementById('authSendCodeBtn');
  const verifyCodeBtn = document.getElementById('authVerifyCodeBtn');
  
  closeBtn.onclick = () => modal.classList.add('hidden');
  modal.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };
  
  tabLogin.onclick = () => {
    emailLoginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    phoneForm.classList.add('hidden');
    tabLogin.classList.add('bg-green-600', 'text-white');
    tabLogin.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700');
    tabRegister.classList.remove('bg-green-600', 'text-white');
    tabRegister.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700');
  };
  
  tabRegister.onclick = () => {
    emailLoginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    phoneForm.classList.add('hidden');
    tabRegister.classList.add('bg-green-600', 'text-white');
    tabRegister.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700');
    tabLogin.classList.remove('bg-green-600', 'text-white');
    tabLogin.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700');
  };
  
  switchToRegister.onclick = () => tabRegister.click();
  switchToLogin.onclick = () => tabLogin.click();
  
  phoneLoginBtn.onclick = () => {
    emailLoginForm.classList.add('hidden');
    registerForm.classList.add('hidden');
    phoneForm.classList.remove('hidden');
  };
  
  backToEmailLogin.onclick = () => {
    phoneForm.classList.add('hidden');
    emailLoginForm.classList.remove('hidden');
    document.getElementById('phoneCodeSection').classList.add('hidden');
    sendCodeBtn.classList.remove('hidden');
    verifyCodeBtn.classList.add('hidden');
  };
  
  // Email Login
  document.getElementById('authEmailLoginBtn').onclick = async () => {
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    const messageDiv = document.getElementById('authMessage');
    
    if (!email || !password) {
      messageDiv.innerText = 'Please enter email and password';
      return;
    }
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      messageDiv.innerText = '';
      modal.classList.add('hidden');
      showToast(`Welcome back, ${email.split('@')[0]}!`);
      window.location.reload();
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        messageDiv.innerText = 'No account found. Please register first.';
      } else if (error.code === 'auth/wrong-password') {
        messageDiv.innerText = 'Incorrect password.';
      } else {
        messageDiv.innerText = error.message;
      }
    }
  };
  
  // Registration
  document.getElementById('authRegisterBtn').onclick = async () => {
    const name = document.getElementById('regFullName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const messageDiv = document.getElementById('authMessage');
    
    if (!name || !email || !password) {
      messageDiv.innerText = 'Please fill all required fields';
      return;
    }
    if (password !== confirmPassword) {
      messageDiv.innerText = 'Passwords do not match';
      return;
    }
    if (password.length < 6) {
      messageDiv.innerText = 'Password must be at least 6 characters';
      return;
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await addDoc(collection(db, "app_users"), {
        uid: userCredential.user.uid,
        fullName: name,
        email: email,
        phone: phone,
        role: 'user',
        createdAt: serverTimestamp(),
        status: 'active'
      });
      messageDiv.innerText = '';
      modal.classList.add('hidden');
      showToast(`Welcome ${name}! Account created successfully.`);
      window.location.reload();
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        messageDiv.innerText = 'Email already registered. Please login.';
      } else {
        messageDiv.innerText = error.message;
      }
    }
  };
  
  // Phone Login - Send Code
  sendCodeBtn.onclick = async () => {
    const phone = document.getElementById('phoneLoginNumber').value.trim();
    const messageDiv = document.getElementById('authMessage');
    
    if (!phone) {
      messageDiv.innerText = 'Please enter phone number';
      return;
    }
    
    try {
      const appVerifier = new RecaptchaVerifier('authPhoneForm', { size: 'invisible' }, auth);
      confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
      document.getElementById('phoneCodeSection').classList.remove('hidden');
      sendCodeBtn.classList.add('hidden');
      verifyCodeBtn.classList.remove('hidden');
      messageDiv.innerText = 'Code sent! Check your SMS.';
    } catch (error) {
      messageDiv.innerText = error.message;
    }
  };
  
  // Phone Login - Verify Code
  verifyCodeBtn.onclick = async () => {
    const code = document.getElementById('phoneVerificationCode').value;
    const messageDiv = document.getElementById('authMessage');
    
    try {
      await confirmationResult.confirm(code);
      messageDiv.innerText = '';
      modal.classList.add('hidden');
      showToast('Login successful!');
      window.location.reload();
    } catch (error) {
      messageDiv.innerText = 'Invalid code. Please try again.';
    }
  };
}

// ========== SHOW AUTH MODAL ==========
window.showAuthModal = function() {
  const modal = document.getElementById('globalAuthModal');
  if (modal) modal.classList.remove('hidden');
  else createAuthModal();
};

// ========== UPDATE HEADER WITH USER INFO ==========
function updateHeaderAuthButtons() {
  const navLoginBtn = document.getElementById('navLoginBtn');
  const navUserDisplay = document.getElementById('navUserDisplay');
  const navLogoutBtn = document.getElementById('navLogoutBtn');
  
  if (window.currentUser) {
    if (navLoginBtn) navLoginBtn.classList.add('hidden');
    if (navUserDisplay) {
      navUserDisplay.innerText = window.currentUser.email || window.currentUser.phoneNumber;
      navUserDisplay.classList.remove('hidden');
    }
    if (navLogoutBtn) navLogoutBtn.classList.remove('hidden');
  } else {
    if (navLoginBtn) navLoginBtn.classList.remove('hidden');
    if (navUserDisplay) navUserDisplay.classList.add('hidden');
    if (navLogoutBtn) navLogoutBtn.classList.add('hidden');
  }
}

// ========== LOGOUT FUNCTION ==========
window.logoutUser = async function() {
  await signOut(auth);
  window.currentUser = null;
  updateHeaderAuthButtons();
  showToast('Logged out successfully');
  window.location.href = 'index.html';
};

// ========== INITIALIZE AUTH UI ==========
function initAuthUI() {
  createAuthModal();
  
  // Replace existing login button with new one
  const oldLoginBtn = document.getElementById('navLoginBtn');
  if (oldLoginBtn) {
    oldLoginBtn.onclick = () => showAuthModal();
  }
  
  // Update logout button
  const logoutBtn = document.getElementById('navLogoutBtn');
  if (logoutBtn) {
    logoutBtn.onclick = () => window.logoutUser();
  }
  
  updateHeaderAuthButtons();
}

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
  window.currentUser = user;
  updateHeaderAuthButtons();
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuthUI);
} else {
  initAuthUI();
}
