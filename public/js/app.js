// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { 
  getDatabase,
  ref,
  set,
  get,
  push,
  update
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMDykPHXB6tvW7kRLBCkgsLgXJ9ZiRnzw",
  authDomain: "eco-learn-v1.firebaseapp.com",
  databaseURL: "https://eco-learn-v1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "eco-learn-v1",
  storageBucket: "eco-learn-v1.firebasestorage.app",
  messagingSenderId: "736759515594",
  appId: "1:736759515594:web:100459974e5e7ea76d2733",
  measurementId: "G-1C5C8MNF9E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Auth State Observer
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    console.log('User is signed in:', user.uid);
    document.getElementById('app-container').classList.remove('hidden');
    document.getElementById('auth-container').classList.add('hidden');
    // Load user data
    loadUserData(user.uid);
  } else {
    // User is signed out
    console.log('User is signed out');
    document.getElementById('app-container').classList.add('hidden');
    document.getElementById('auth-container').classList.remove('hidden');
  }
});

// Auth Functions
async function registerUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Initialize user data
    await initializeUserData(user.uid, { email: user.email });
    
    console.log('User registered successfully:', user.uid);
    return user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('User logged in successfully:', user.uid);
    return user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

async function logoutUser() {
  try {
    await signOut(auth);
    console.log('User logged out successfully');
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
}

// Database Functions
async function initializeUserData(userId, userData) {
  const userRef = ref(database, `users/${userId}`);
  try {
    await set(userRef, {
      email: userData.email,
      createdAt: Date.now(),
      progress: {},
      scores: {}
    });
    console.log('User data initialized successfully');
  } catch (error) {
    console.error('Error initializing user data:', error);
    throw error;
  }
}

async function saveUserProgress(userId, unitId, chapterId, progress) {
  const progressRef = ref(database, `users/${userId}/progress/${unitId}/${chapterId}`);
  try {
    await set(progressRef, progress);
    console.log('Progress saved successfully');
  } catch (error) {
    console.error('Error saving progress:', error);
    throw error;
  }
}

async function saveTestScore(userId, unitId, chapterId, score) {
  const scoreRef = ref(database, `users/${userId}/scores/${unitId}/${chapterId}`);
  try {
    await set(scoreRef, score);
    console.log('Test score saved successfully');
  } catch (error) {
    console.error('Error saving test score:', error);
    throw error;
  }
}

async function getUserProgress(userId) {
  const progressRef = ref(database, `users/${userId}/progress`);
  try {
    const snapshot = await get(progressRef);
    return snapshot.exists() ? snapshot.val() : {};
  } catch (error) {
    console.error('Error getting user progress:', error);
    throw error;
  }
}

async function getUserScores(userId) {
  const scoresRef = ref(database, `users/${userId}/scores`);
  try {
    const snapshot = await get(scoresRef);
    return snapshot.exists() ? snapshot.val() : {};
  } catch (error) {
    console.error('Error getting user scores:', error);
    throw error;
  }
}

async function saveContactSubmission(userId, formData) {
  const contactRef = ref(database, 'contactSubmissions');
  const newSubmissionRef = push(contactRef);
  try {
    await set(newSubmissionRef, {
      userId,
      ...formData,
      timestamp: Date.now()
    });
    console.log('Contact submission saved successfully');
  } catch (error) {
    console.error('Error saving contact submission:', error);
    throw error;
  }
}

// Helper Functions
function loadUserData(userId) {
  Promise.all([
    getUserProgress(userId),
    getUserScores(userId)
  ])
  .then(([progress, scores]) => {
    // Store user data in the app
    window.userData = {
      userId,
      progress,
      scores
    };
    
    // Update UI based on user data
    updateProgressUI(progress, scores);
    
    // Show the initial tab (Home)
    showTab('home');
  })
  .catch(error => {
    console.error('Error loading user data:', error);
    showError('Failed to load user data. Please try again.');
  });
}

// UI Functions
function showTab(tabId) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.add('hidden');
  });
  
  // Show the selected tab content
  document.getElementById(`${tabId}-tab`).classList.remove('hidden');
  
  // Update active tab indicator
  document.querySelectorAll('.tab-item').forEach(tab => {
    tab.classList.remove('active');
  });
  
  document.querySelector(`.tab-item[data-tab="${tabId}"]`).classList.add('active');
}

function updateProgressUI(progress, scores) {
  // Implementation will be added later
  console.log('Updating progress UI with:', { progress, scores });
}

function showError(message) {
  const errorElement = document.getElementById('error-message');
  errorElement.textContent = message;
  errorElement.classList.remove('hidden');
  
  // Hide after 5 seconds
  setTimeout(() => {
    errorElement.classList.add('hidden');
  }, 5000);
}

// Initialize UI
document.addEventListener('DOMContentLoaded', () => {
  // Set up auth form submission
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      try {
        await loginUser(email, password);
      } catch (error) {
        showError(error.message);
      }
    });
  }
  
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById('register-confirm-password').value;
      
      if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
      }
      
      try {
        await registerUser(email, password);
      } catch (error) {
        showError(error.message);
      }
    });
  }
  
  // Set up tab navigation
  document.querySelectorAll('.tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      showTab(tabId);
    });
  });
  
  // Set up logout button
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      try {
        await logoutUser();
      } catch (error) {
        showError(error.message);
      }
    });
  }
});

// Export functions for global access
window.EcoLearn = {
  registerUser,
  loginUser,
  logoutUser,
  saveUserProgress,
  saveTestScore,
  getUserProgress,
  getUserScores,
  saveContactSubmission,
  showTab
};