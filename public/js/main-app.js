// Import course data and other modules
import { courseData, quizQuestions, environmentalTips } from '/js/courseData.js';
import { handleUserMessage, loadChatHistory, clearChatHistory } from '/js/gemini.js';

// Global state
let currentUser = null;
let currentUnitId = null;
let currentChapterId = null;
let currentPage = 0;
let currentChapterContent = null;
let currentQuiz = null;
let userAnswers = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Firebase Auth
  initFirebaseAuth();
  
  // Setup auth tabs
  setupAuthTabs();
  
  // Setup bottom navigation
  setupBottomNav();
  
  // Setup other UI handlers
  setupUIHandlers();
});

// Initialize Firebase Authentication
function initFirebaseAuth() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // User is signed in
      console.log('User is signed in:', user.uid);
      currentUser = user;
      showAppContainer();
      
      // Load user data and show welcome message if available
      loadUserData().then(userData => {
        if (userData && userData.displayName) {
          showWelcomeMessage(userData.displayName);
        }
      });
    } else {
      // User is signed out
      console.log('User is signed out');
      
      // Clear chat history when user is signed out
      if (currentUser) {
        // Only clear if there was a user before (not on first load)
        clearChatHistory();
      }
      
      currentUser = null;
      showAuthContainer();
    }
  });
  
  setupAuthForms();
}

// Show app container and hide auth container
function showAppContainer() {
  document.getElementById('app-container').classList.remove('hidden');
  document.getElementById('auth-container').classList.add('hidden');
}

// Show auth container and hide app container
function showAuthContainer() {
  document.getElementById('app-container').classList.add('hidden');
  document.getElementById('auth-container').classList.remove('hidden');
}

// Setup auth tabs
function setupAuthTabs() {
  const authTabs = document.querySelectorAll('.auth-tab');
  
  authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      authTabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Hide all tab contents
      document.querySelectorAll('.auth-form').forEach(content => {
        content.classList.add('hidden');
      });
      
      // Show selected tab content
      const tabId = tab.getAttribute('data-auth-tab');
      document.getElementById(`${tabId}-tab`).classList.remove('hidden');
    });
  });
}

// Setup authentication forms
function setupAuthForms() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  
  // Login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        showMessage('Successfully logged in!', 'success');
      } catch (error) {
        showMessage(`Login error: ${error.message}`, 'error');
      }
    });
  }
  
  // Register form submission
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('register-name').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById('register-confirm-password').value;
      
      if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
      }
      
      try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Initialize user data with name
        await initializeUserData(user.uid, { 
          email: user.email,
          displayName: name 
        });
        
        showMessage('Account created successfully!', 'success');
        
        // Show welcome message when they login
        showWelcomeMessage(name);
      } catch (error) {
        showMessage(`Registration error: ${error.message}`, 'error');
      }
    });
  }
}

// Initialize user data in database
async function initializeUserData(userId, userData) {
  const database = firebase.database();
  const userRef = database.ref(`users/${userId}`);
  
  try {
    await userRef.set({
      email: userData.email,
      displayName: userData.displayName || '',
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

// Show welcome message
function showWelcomeMessage(name) {
  // Create welcome message element
  const welcomeMsg = document.createElement('div');
  welcomeMsg.className = 'welcome-message';
  welcomeMsg.textContent = `Welcome, ${name}!`;
  
  // Add to header
  const header = document.querySelector('.header');
  if (header) {
    header.appendChild(welcomeMsg);
    
    // Remove after 5 seconds
    setTimeout(() => {
      welcomeMsg.remove();
    }, 5000);
  }
}

// Function to show a specific tab
function showTab(tabId) {
  // Get all nav items
  const navItems = document.querySelectorAll('.nav-item');
  
  // Remove active class from all items
  navItems.forEach(i => i.classList.remove('active'));
  
  // Add active class to the tab item with the matching data-tab
  const activeItem = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
  }
  
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.add('hidden');
  });
  
  // Hide all special views
  document.getElementById('chapter-view').classList.add('hidden');
  document.getElementById('quiz-view').classList.add('hidden');
  document.getElementById('test-result-view').classList.add('hidden');
  
  // Show selected tab content
  document.getElementById(`${tabId}-tab`).classList.remove('hidden');
}

// Setup bottom navigation
function setupBottomNav() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-tab');
      showTab(tabId);
      
      // Show/hide floating tip based on tab
      const floatingTip = document.querySelector('.floating-tip');
      if (tabId === 'home') {
        floatingTip.style.display = 'block';
      } else {
        floatingTip.style.display = 'none';
      }
    });
  });
}

// Setup other UI handlers
function setupUIHandlers() {
  // Setup logout button
  const logoutBtn = document.getElementById('logout-button');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to log out?')) {
        try {
          await firebase.auth().signOut();
          showMessage('You have been logged out successfully', 'success');
        } catch (error) {
          console.error('Error logging out:', error);
          showMessage('Failed to log out. Please try again.', 'error');
        }
      }
    });
  }
  
  // Back button on EcoBot page
  const backToHomeBtn = document.getElementById('back-to-home');
  if (backToHomeBtn) {
    backToHomeBtn.addEventListener('click', () => {
      showTab('home');
    });
  }
  
  // Setup floating tip
  setupFloatingTip();
  
  // Setup chatbot
  setupChatbot();
  
  // Setup contact form
  setupContactForm();
  
  // Setup chapter navigation
  setupChapterNavigation();
  
  // Setup quiz navigation
  setupQuizNavigation();
}

// Setup floating tip
function setupFloatingTip() {
  const tipButton = document.querySelector('.tip-button');
  const tipPopup = document.getElementById('tip-popup');
  const tipClose = document.querySelector('.tip-close');
  const tipText = document.getElementById('tip-text');
  
  // Show tip on button click
  tipButton.addEventListener('click', () => {
    tipPopup.classList.toggle('show');
    updateTip();
  });
  
  // Close tip
  tipClose.addEventListener('click', () => {
    tipPopup.classList.remove('show');
  });
  
  // Update tip text
  function updateTip() {
    const randomTip = environmentalTips[Math.floor(Math.random() * environmentalTips.length)];
    tipText.textContent = randomTip;
  }
  
  // Show a random tip every 60 seconds
  setInterval(() => {
    if (!tipPopup.classList.contains('show')) {
      updateTip();
      tipPopup.classList.add('show');
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        tipPopup.classList.remove('show');
      }, 5000);
    }
  }, 60000);
}

// Setup chatbot
function setupChatbot() {
  const chatInput = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-message');
  const chatMessages = document.getElementById('chat-messages');
  const clearChatButton = document.getElementById('clear-chat');
  
  if (!chatInput || !sendButton || !chatMessages) return;
  
  // Send message function
  async function sendChatMessage() {
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Clear input
    chatInput.value = '';
    
    // Add user message to chat
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const userMessageEl = document.createElement('div');
    userMessageEl.className = 'message user';
    userMessageEl.innerHTML = `
      <div class="message-bubble">${message}</div>
      <div class="message-time">${timestamp}</div>
    `;
    chatMessages.appendChild(userMessageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Process with Gemini API
    await handleUserMessage(message);
  }
  
  // Send message on button click
  sendButton.addEventListener('click', sendChatMessage);
  
  // Send message on Enter key
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendChatMessage();
    }
  });
  
  // Clear chat
  if (clearChatButton) {
    clearChatButton.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear the chat history?')) {
        clearChatHistory();
      }
    });
  }
}

// Setup contact form
function setupContactForm() {
  const contactForm = document.getElementById('contact-form');
  const contactOptions = document.querySelectorAll('.contact-option');
  const contactCategoryInput = document.getElementById('contact-category');
  
  if (!contactForm) return;
  
  // Set up contact reason options
  contactOptions.forEach(option => {
    option.addEventListener('click', () => {
      // Remove selected class from all options
      contactOptions.forEach(opt => opt.classList.remove('selected'));
      
      // Add selected class to clicked option
      option.classList.add('selected');
      
      // Set hidden input value
      const value = option.getAttribute('data-value');
      contactCategoryInput.value = value;
    });
  });
  
  // Form submission
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      showMessage('You must be logged in to submit the form.', 'error');
      return;
    }
    
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const category = contactCategoryInput.value;
    const message = document.getElementById('contact-message').value;
    
    // Validate form
    if (!category) {
      showMessage('Please select a category.', 'error');
      return;
    }
    
    // Show loading state
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    
    try {
      // Save to Firebase
      const database = firebase.database();
      const contactRef = database.ref('contactSubmissions');
      const newSubmissionRef = contactRef.push();
      
      await newSubmissionRef.set({
        userId: currentUser.uid,
        name,
        email,
        category,
        message,
        timestamp: Date.now()
      });
      
      // Show success state
      submitBtn.innerHTML = '<i class="fas fa-check"></i> Submitted Successfully!';
      submitBtn.classList.add('btn-success');
      
      // Replace form with success message
      const contactContainer = document.querySelector('.contact-form');
      contactContainer.innerHTML = `
        <div class="success-message">
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3>Thank You!</h3>
          <p>Your message has been submitted successfully.</p>
          <p>We'll get back to you as soon as possible.</p>
          <button id="new-contact" class="btn btn-primary mt-3">Send Another Message</button>
        </div>
      `;
      
      // Add CSS for success message
      if (!document.getElementById('success-styles')) {
        const style = document.createElement('style');
        style.id = 'success-styles';
        style.textContent = `
          .success-message {
            text-align: center;
            padding: 30px 20px;
          }
          
          .success-icon {
            font-size: 4rem;
            color: var(--success-color);
            margin-bottom: 20px;
          }
          
          .success-message h3 {
            color: var(--success-color);
            margin-bottom: 15px;
          }
          
          .btn-success {
            background-color: var(--success-color);
          }
          
          @keyframes checkmark {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          
          .success-icon i {
            animation: checkmark 0.5s ease-in-out;
          }
        `;
        document.head.appendChild(style);
      }
      
      // Add event listener to "Send Another Message" button
      document.getElementById('new-contact').addEventListener('click', () => {
        // Get the contact form container
        const contactContainer = document.querySelector('.contact-form');
        
        // Restore the original contact form
        contactContainer.innerHTML = `
          <form id="contact-form">
            <div class="form-group">
              <label for="contact-name" class="form-label">Name</label>
              <input type="text" id="contact-name" class="form-input" placeholder="Enter your name" required>
            </div>
            
            <div class="form-group">
              <label for="contact-email" class="form-label">Email</label>
              <input type="email" id="contact-email" class="form-input" placeholder="Enter your email address" required>
            </div>
            
            <div class="form-group">
              <label class="form-label">What can we help you with?</label>
              <div class="contact-options">
                <div class="contact-option selected" data-value="feedback">
                  <i class="fas fa-comment"></i>
                  <span>Feedback</span>
                </div>
                <div class="contact-option" data-value="question">
                  <i class="fas fa-question-circle"></i>
                  <span>Question</span>
                </div>
                <div class="contact-option" data-value="issue">
                  <i class="fas fa-exclamation-circle"></i>
                  <span>Issue</span>
                </div>
              </div>
              <input type="hidden" id="contact-category" value="feedback">
            </div>
            
            <div class="form-group">
              <label for="contact-message" class="form-label">Message</label>
              <textarea id="contact-message" class="form-input form-textarea" placeholder="Type your message here..." required></textarea>
            </div>
            
            <button type="submit" class="btn btn-primary submit-btn">Send Message</button>
          </form>
        `;
        
        // Re-initialize the contact form
        setupContactForm();
      });
      
    } catch (error) {
      console.error('Error submitting form:', error);
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
      showMessage('Failed to submit your message. Please try again.', 'error');
    }
  });
}

// Setup chapter navigation
function setupChapterNavigation() {
  const backToUnitButton = document.getElementById('back-to-unit');
  
  backToUnitButton.addEventListener('click', () => {
    document.getElementById('chapter-view').classList.add('hidden');
    document.getElementById('home-tab').classList.remove('hidden');
  });
}

// Setup quiz navigation
function setupQuizNavigation() {
  const backToChapterButton = document.getElementById('back-to-chapter');
  
  backToChapterButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to leave the quiz? Your progress will be lost.')) {
      document.getElementById('quiz-view').classList.add('hidden');
      document.getElementById('chapter-view').classList.remove('hidden');
    }
  });
  
  const backFromResultsButton = document.getElementById('back-from-results');
  
  backFromResultsButton.addEventListener('click', () => {
    document.getElementById('test-result-view').classList.add('hidden');
    document.getElementById('home-tab').classList.remove('hidden');
  });
}

// Load user data from Firebase
async function loadUserData() {
  if (!currentUser) return;
  
  try {
    const database = firebase.database();
    const userRef = database.ref(`users/${currentUser.uid}`);
    const progressRef = database.ref(`users/${currentUser.uid}/progress`);
    const scoresRef = database.ref(`users/${currentUser.uid}/scores`);
    
    // Get user profile data
    const userSnapshot = await userRef.once('value');
    const userData = userSnapshot.exists() ? userSnapshot.val() : {};
    
    // Get progress data
    const progressSnapshot = await progressRef.once('value');
    const progress = progressSnapshot.exists() ? progressSnapshot.val() : {};
    
    // Get scores data
    const scoresSnapshot = await scoresRef.once('value');
    const scores = scoresSnapshot.exists() ? scoresSnapshot.val() : {};
    
    // Display course content
    displayCourseContent(scores);
    
    // Update progress dashboard
    updateProgressDashboard(progress, scores);
    
    // Load chat history
    loadChatHistory();
    
    // Return user data for other functions to use
    return userData;
    
  } catch (error) {
    console.error('Error loading user data:', error);
    showMessage('Failed to load your data. Please try again.', 'error');
  }
}

// Display course content
function displayCourseContent(scores) {
  const unitsContainer = document.getElementById('units-container');
  if (!unitsContainer) return;
  
  unitsContainer.innerHTML = '';
  
  courseData.forEach((unit, unitIndex) => {
    // Check if previous unit is completed (except for first unit)
    const unitIsLocked = unitIndex > 0 && !isUnitCompleted(unitIndex, scores);
    
    const unitElement = document.createElement('div');
    unitElement.className = 'course-card';
    
    // Get a relevant image for the unit
    const unitImage = getUnitImage(unit.id);
    
    unitElement.innerHTML = `
      <img src="${unitImage}" alt="${unit.title}" class="course-image">
      <div class="course-content">
        <div class="course-header">
          <h3 class="course-title">${unit.title}</h3>
          ${unitIsLocked ? 
            `<span class="unit-status locked"><i class="fas fa-lock"></i> Locked</span>` : 
            `<span class="unit-status available"><i class="fas fa-unlock"></i> Available</span>`
          }
        </div>
        <p>${unit.description}</p>
        ${unitIsLocked ? 
          `<div class="locked-message"><i class="fas fa-info-circle"></i> Complete previous unit to unlock this content</div>` :
          `<h4 class="mb-2 mt-3"><i class="fas fa-list-ul"></i> Chapters:</h4>
           <div class="chapter-list"></div>`
        }
      </div>
    `;
    
    unitsContainer.appendChild(unitElement);
    
    // If unit is not locked, add chapters
    if (!unitIsLocked) {
      const chapterList = unitElement.querySelector('.chapter-list');
      
      unit.chapters.forEach((chapter, chapterIndex) => {
        // Check if chapter is locked (all chapters except first are locked by default)
        const isLocked = chapterIndex > 0 && !isChapterCompleted(unit.id, chapterIndex, scores);
        
        const chapterItem = document.createElement('div');
        chapterItem.className = 'chapter-item';
        
        chapterItem.innerHTML = `
          <div class="chapter-info">
            <div class="chapter-number"><i class="fas fa-book-open"></i></div>
            <div class="chapter-title">${chapter.title}</div>
          </div>
          <button class="chapter-status ${isLocked ? 'locked' : ''}" 
            data-unit="${unit.id}" 
            data-chapter="${chapter.id}"
            ${isLocked ? 'disabled' : ''}>
            ${isLocked ? '<i class="fas fa-lock"></i> Locked' : '<i class="fas fa-play-circle"></i> Start Learning'}
          </button>
        `;
        
        chapterList.appendChild(chapterItem);
        
        // Add click event to chapter button if not locked
        if (!isLocked) {
          const button = chapterItem.querySelector('.chapter-status');
          button.addEventListener('click', () => {
            openChapter(unit.id, chapter.id);
          });
        }
      });
    }
  });
}

// Check if a unit is completed
function isUnitCompleted(unitIndex, scores) {
  const unit = courseData[unitIndex - 1]; // Get previous unit
  if (!unit) return true; // First unit is always unlocked
  
  // Check if all chapters in the previous unit are completed
  let allChaptersCompleted = true;
  
  unit.chapters.forEach(chapter => {
    const chapterCompleted = scores && 
                           scores[unit.id] && 
                           scores[unit.id][chapter.id] && 
                           scores[unit.id][chapter.id] >= 4;
    
    if (!chapterCompleted) {
      allChaptersCompleted = false;
    }
  });
  
  return allChaptersCompleted;
}

// Check if a chapter is completed
function isChapterCompleted(unitId, chapterIndex, scores) {
  if (chapterIndex === 0) return true; // First chapter is always unlocked
  
  const unit = courseData.find(u => u.id === unitId);
  if (!unit) return false;
  
  const previousChapterId = unit.chapters[chapterIndex - 1].id;
  
  return scores && 
         scores[unitId] && 
         scores[unitId][previousChapterId] && 
         scores[unitId][previousChapterId] >= 4;
}

// Get unit image based on unit ID
function getUnitImage(unitId) {
  // Using locally saved images
  const images = [
    "/images/green-methodology-banner.jpeg", // Green Methodologies
    "/images/clean-development-banner.jpeg", // Clean Development Mechanisms
    "/images/environmental-assessment-banner.jpeg" // Environmental Impact Assessment
  ];
  
  return images[unitId - 1] || images[0];
}

// Open a chapter
function openChapter(unitId, chapterId) {
  const unit = courseData.find(u => u.id === unitId);
  if (!unit) return;
  
  const chapter = unit.chapters.find(c => c.id === chapterId);
  if (!chapter) return;
  
  currentUnitId = unitId;
  currentChapterId = chapterId;
  currentChapterContent = chapter.content;
  
  // Update chapter title
  document.getElementById('chapter-title').textContent = chapter.title;
  
  // Hide home tab and show chapter view
  document.getElementById('home-tab').classList.add('hidden');
  document.getElementById('chapter-view').classList.remove('hidden');
  
  // Render all chapter content
  renderChapterPage();
  
  // Scroll to top
  window.scrollTo(0, 0);
}

// Render chapter content as a single scrollable page
function renderChapterPage() {
  const contentElement = document.getElementById('chapter-content');
  const takeQuizBtn = document.getElementById('take-quiz-btn');
  
  if (!contentElement) return;
  
  let completeContentHTML = '';
  
  // Generate HTML for all content items
  currentChapterContent.forEach((contentItem, index) => {
    // Handle different content types
    let itemHTML = '';
    
    if (contentItem.type === 'text') {
      itemHTML = `<div class="content-section text-section"><p>${contentItem.data}</p></div>`;
    } else if (contentItem.type === 'image') {
      itemHTML = `
        <div class="content-section image-section">
          <img src="${contentItem.src}" alt="${contentItem.alt}" class="chapter-image">
          <p class="caption">${contentItem.caption}</p>
        </div>
      `;
    } else if (contentItem.type === 'resources') {
      itemHTML = `
        <div class="content-section resources-section">
          <div class="resources-box">
            <h3><i class="fas fa-book-open"></i> Additional Resources</h3>
            <p>Explore these resources to learn more about this topic:</p>
            <ul class="resources-list">
              ${contentItem.links.map(link => `
                <li>
                  <a href="${link.url}" target="_blank" class="resource-link">
                    <i class="fas ${link.url.includes('youtube.com') ? 'fa-youtube' : 'fa-external-link-alt'}"></i>
                    ${link.title}
                  </a>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      `;
    }
    
    completeContentHTML += itemHTML;
  });
  
  // Set complete content
  contentElement.innerHTML = completeContentHTML;
  
  // Set up take quiz button
  takeQuizBtn.onclick = () => startQuiz(currentUnitId, currentChapterId);
  
  // Add CSS for content sections if not already present
  if (!document.getElementById('chapter-content-styles')) {
    const style = document.createElement('style');
    style.id = 'chapter-content-styles';
    style.textContent = `
      .content-section {
        margin-bottom: 30px;
      }
      
      .text-section {
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      }
      
      .image-section {
        text-align: center;
      }
      
      .resources-section {
        margin-top: 40px;
        margin-bottom: 40px;
      }
      
      .resources-box {
        background-color: #f1f8e9;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
        border-left: 4px solid var(--primary-color);
      }
      
      .resources-box h3 {
        color: var(--primary-color);
        display: flex;
        align-items: center;
        margin-bottom: 15px;
      }
      
      .resources-box h3 i {
        margin-right: 10px;
      }
      
      .resources-list {
        list-style-type: none;
        padding: 0;
      }
      
      .resources-list li {
        margin-bottom: 12px;
      }
      
      .resource-link {
        display: flex;
        align-items: center;
        color: var(--secondary-color);
        text-decoration: none;
        padding: 8px 12px;
        border-radius: 6px;
        transition: background-color 0.2s;
      }
      
      .resource-link:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
      
      .resource-link i {
        margin-right: 10px;
        font-size: 1.2em;
      }
      
      .chapter-image {
        width: 100%;
        max-width: 600px;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        margin: 15px 0;
      }
      
      .take-quiz-container {
        text-align: center;
        margin: 30px 0;
        padding: 20px;
        background-color: #f9f9f9;
        border-radius: 8px;
      }
      
      #take-quiz-btn {
        padding: 12px 25px;
        font-size: 1rem;
      }
    `;
    document.head.appendChild(style);
  }
}

// Start quiz for current chapter
function startQuiz(unitId, chapterId) {
  const quizKey = `${unitId}-${chapterId}`;
  const questions = quizQuestions[quizKey];
  
  if (!questions) {
    showMessage('Quiz not found for this chapter.', 'error');
    return;
  }
  
  currentQuiz = [...questions]; // Copy questions array
  userAnswers = new Array(questions.length).fill(null);
  
  // Hide chapter view and show quiz view
  document.getElementById('chapter-view').classList.add('hidden');
  document.getElementById('quiz-view').classList.remove('hidden');
  
  // Render first question
  renderQuizQuestion(0);
}

// Render quiz question
function renderQuizQuestion(questionIndex) {
  const quizContainer = document.getElementById('quiz-container');
  
  if (!quizContainer || !currentQuiz) return;
  
  const question = currentQuiz[questionIndex];
  
  quizContainer.innerHTML = `
    <div class="question-number">Question ${questionIndex + 1} of ${currentQuiz.length}</div>
    
    <div class="question-text">
      ${question.question}
    </div>
    
    <div class="options">
      ${question.options.map((option, index) => `
        <div class="option ${userAnswers[questionIndex] === index ? 'selected' : ''}" data-index="${index}">
          ${option}
        </div>
      `).join('')}
    </div>
    
    <div class="quiz-navigation">
      <button id="quiz-prev" class="btn btn-outlined" ${questionIndex === 0 ? 'disabled' : ''}>Previous</button>
      <button id="quiz-next" class="btn btn-primary" ${userAnswers[questionIndex] === null ? 'disabled' : ''}>
        ${questionIndex === currentQuiz.length - 1 ? 'Submit' : 'Next'}
      </button>
    </div>
  `;
  
  // Add click handlers to options
  const options = quizContainer.querySelectorAll('.option');
  options.forEach(option => {
    option.addEventListener('click', () => {
      // Remove selected class from all options
      options.forEach(opt => opt.classList.remove('selected'));
      
      // Add selected class to clicked option
      option.classList.add('selected');
      
      // Save answer
      const index = parseInt(option.getAttribute('data-index'));
      userAnswers[questionIndex] = index;
      
      // Enable next button
      document.getElementById('quiz-next').disabled = false;
    });
  });
  
  // Add navigation handlers
  const prevButton = document.getElementById('quiz-prev');
  const nextButton = document.getElementById('quiz-next');
  
  prevButton.addEventListener('click', () => {
    if (questionIndex > 0) {
      renderQuizQuestion(questionIndex - 1);
    }
  });
  
  nextButton.addEventListener('click', () => {
    if (questionIndex < currentQuiz.length - 1) {
      renderQuizQuestion(questionIndex + 1);
    } else {
      // Submit quiz
      submitQuiz();
    }
  });
}

// Submit quiz
async function submitQuiz() {
  // Calculate score
  let score = 0;
  let correctAnswers = 0;
  
  userAnswers.forEach((answer, index) => {
    if (answer === currentQuiz[index].correctAnswer) {
      correctAnswers++;
    }
  });
  
  score = correctAnswers;
  
  // Save score to Firebase
  try {
    if (currentUser) {
      const database = firebase.database();
      const scoreRef = database.ref(`users/${currentUser.uid}/scores/${currentUnitId}/${currentChapterId}`);
      await scoreRef.set(score);
    }
  } catch (error) {
    console.error('Error saving score:', error);
    showMessage('Failed to save your score. Please try again.', 'error');
  }
  
  // Show results
  document.getElementById('quiz-view').classList.add('hidden');
  document.getElementById('test-result-view').classList.remove('hidden');
  
  const passed = score >= 4;
  const resultContainer = document.getElementById('test-result-container');
  
  resultContainer.innerHTML = `
    <div class="result-circle" style="border-color: ${passed ? 'var(--success-color)' : 'var(--error-color)'}">
      <div class="result-score-display">${score}/5</div>
      <div class="result-divider"></div>
      <div>${passed ? 'Passed' : 'Failed'}</div>
    </div>
    
    <div class="result-message">
      <h2>${passed ? 'Congratulations! You Passed!' : 'Not Quite There Yet'}</h2>
      <p>${passed ? 
        'You can now proceed to the next chapter.' : 
        'You need to score at least 4/5 to pass. Try again when you\'re ready.'}</p>
    </div>
    
    <button id="back-to-modules" class="btn btn-primary">Back to Modules</button>
    
    <div class="question-summary">
      <h3 class="summary-heading">Question Summary</h3>
      
      ${currentQuiz.map((question, index) => `
        <div class="summary-item">
          <div class="summary-icon ${userAnswers[index] === question.correctAnswer ? '' : 'wrong'}">
            <i class="fas ${userAnswers[index] === question.correctAnswer ? 'fa-check' : 'fa-times'}"></i>
          </div>
          <div class="summary-text">
            <div class="summary-question">${question.question}</div>
            <div class="summary-answer">${question.options[question.correctAnswer]}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  // Add click handler to back button
  const backButton = document.getElementById('back-to-modules');
  backButton.addEventListener('click', () => {
    document.getElementById('test-result-view').classList.add('hidden');
    document.getElementById('home-tab').classList.remove('hidden');
    
    // Reload content to update chapter status
    loadUserData();
  });
}

// Update progress dashboard
function updateProgressDashboard(progress, scores) {
  if (!scores) scores = {};
  
  // Calculate statistics
  const stats = calculateProgressStats(scores);
  
  // Update stats display
  document.getElementById('completed-chapters').textContent = `${stats.completedChapters}/${stats.totalChapters}`;
  document.getElementById('completion-percentage').textContent = `${stats.completionPercentage}%`;
  
  document.getElementById('average-score').textContent = stats.averageScore > 0 ? `${stats.averageScore.toFixed(1)}/5` : '-/5';
  document.getElementById('avg-percentage').textContent = `${stats.averageScorePercentage}%`;
  
  document.getElementById('tests-passed').textContent = stats.testsPassed;
  document.getElementById('tests-percentage').textContent = `${stats.testsPassedPercentage}%`;
  
  // Update chart
  document.getElementById('completion-path').setAttribute('stroke-dasharray', `${stats.completionPercentage}, 100`);
  document.getElementById('score-path').setAttribute('stroke-dasharray', `${stats.averageScorePercentage}, 100`);
  
  // Update test results
  const testResultsContainer = document.getElementById('test-results');
  
  if (stats.completedChapters === 0) {
    testResultsContainer.innerHTML = `
      <p class="text-center">You haven't completed any tests yet.</p>
      <p class="text-center">Start learning to see your results here!</p>
    `;
    return;
  }
  
  let resultsHTML = '';
  
  courseData.forEach(unit => {
    unit.chapters.forEach(chapter => {
      if (scores[unit.id] && scores[unit.id][chapter.id] !== undefined) {
        const score = scores[unit.id][chapter.id];
        const passed = score >= 4;
        
        resultsHTML += `
          <div class="result-item">
            <div class="result-info">
              <div class="result-title">${chapter.title}</div>
              <div class="result-subtitle">${unit.title}</div>
            </div>
            <div class="result-score" style="background-color: ${passed ? 'var(--success-color)' : 'var(--error-color)'}">
              ${score}/5
            </div>
          </div>
        `;
      }
    });
  });
  
  testResultsContainer.innerHTML = `
    <h3>Your Results</h3>
    ${resultsHTML}
  `;
}

// Calculate progress statistics
function calculateProgressStats(scores) {
  let completedChapters = 0;
  let totalChapters = 0;
  let totalScore = 0;
  let testsTaken = 0;
  let testsPassed = 0;
  
  courseData.forEach(unit => {
    unit.chapters.forEach(chapter => {
      totalChapters++;
      
      if (scores[unit.id] && scores[unit.id][chapter.id] !== undefined) {
        testsTaken++;
        totalScore += scores[unit.id][chapter.id];
        
        if (scores[unit.id][chapter.id] >= 4) {
          completedChapters++;
          testsPassed++;
        }
      }
    });
  });
  
  const averageScore = testsTaken > 0 ? totalScore / testsTaken : 0;
  const completionPercentage = Math.round((completedChapters / totalChapters) * 100) || 0;
  const averageScorePercentage = Math.round((averageScore / 5) * 100) || 0;
  const testsPassedPercentage = Math.round((testsPassed / totalChapters) * 100) || 0;
  
  return {
    completedChapters,
    totalChapters,
    averageScore,
    testsTaken,
    testsPassed,
    completionPercentage,
    averageScorePercentage,
    testsPassedPercentage
  };
}

// Show message to user
function showMessage(message, type = 'info') {
  const container = document.getElementById('message-container');
  
  if (!container) return;
  
  // Clear existing messages
  container.innerHTML = '';
  
  // Create message element
  const messageElement = document.createElement('div');
  messageElement.className = `message ${type}`;
  messageElement.textContent = message;
  
  // Add to container
  container.appendChild(messageElement);
  container.classList.remove('hidden');
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    container.classList.add('hidden');
  }, 5000);
}

// Export functions for global access
window.EcoLearn = {
  showMessage
};