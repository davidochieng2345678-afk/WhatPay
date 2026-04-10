// auth.js - Email/Password Authentication for whapay-c93ab
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

const firebaseConfig = {
  apiKey: "AIzaSyDPAvq6BgpdfZAkfoEwdwmHrWedHgzjRSk",
  authDomain: "whapay-c93ab.firebaseapp.com",
  projectId: "whapay-c93ab",
  storageBucket: "whapay-c93ab.firebasestorage.app",
  messagingSenderId: "205456952458",
  appId: "1:205456952458:web:6533921ca10a2988417173"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.auth = auth;
window.db = db;
window.currentUser = null;

function showToast(msg, isError = false) {
  let toast = document.getElementById('whapay-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'whapay-toast';
    toast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full text-sm z-50 hidden';
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 4000);
}

function injectLoginModal() {
  if (document.getElementById('loginModal')) return;
  const modalHTML = `
    <div id="loginModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
      <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Admin Login</h2>
          <button id="closeLoginModal" class="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
        </div>
        <div>
          <input type="email" id="loginEmail" placeholder="Email" class="w-full border p-2 rounded mb-3">
          <input type="password" id="loginPassword" placeholder="Password" class="w-full border p-2 rounded mb-3">
          <button id="loginBtn" class="bg-green-600 text-white w-full py-2 rounded">Login</button>
          <div id="loginError" class="text-red-500 text-sm mt-2 text-center"></div>
        </div>
        <p class="text-xs text-gray-500 text-center mt-3">Demo credentials: davidochieng99@gmail.com / your password</p>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.showLoginModal = function() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.remove('hidden');
};

window.hideLoginModal = function() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.add('hidden');
  document.getElementById('loginError').innerText = '';
};

window.logoutUser = async function() {
  await signOut(auth);
  window.currentUser = null;
  updateAuthUI();
  showToast('Logged out successfully');
  // If on admin page, redirect to home
  if (window.location.pathname.includes('admin.html')) {
    window.location.href = 'index.html';
  }
};

function updateAuthUI() {
  const loginBtn = document.getElementById('navLoginBtn');
  const logoutBtn = document.getElementById('navLogoutBtn');
  const userDisplay = document.getElementById('userEmailDisplay') || document.getElementById('userPhoneDisplay');
  if (window.currentUser) {
    if (loginBtn) loginBtn.classList.add('hidden');
    if (logoutBtn) logoutBtn.classList.remove('hidden');
    if (userDisplay) {
      userDisplay.innerText = window.currentUser.email;
      userDisplay.classList.remove('hidden');
    }
  } else {
    if (loginBtn) loginBtn.classList.remove('hidden');
    if (logoutBtn) logoutBtn.classList.add('hidden');
    if (userDisplay) userDisplay.classList.add('hidden');
  }
}

function initAuth() {
  injectLoginModal();
  document.getElementById('closeLoginModal')?.addEventListener('click', () => window.hideLoginModal());
  document.getElementById('loginBtn')?.addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.hideLoginModal();
    } catch (err) {
      document.getElementById('loginError').innerText = err.message;
    }
  });
  
  onAuthStateChanged(auth, (user) => {
    window.currentUser = user;
    updateAuthUI();
    // Dispatch custom event for any page that wants to listen
    window.dispatchEvent(new CustomEvent('authStateChanged'));
  });
}

// Wait for DOM to load before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}
