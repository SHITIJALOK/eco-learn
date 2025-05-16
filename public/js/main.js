// Import course data and other modules
import { courseData, quizQuestions, environmentalTips } from './courseData.js';
import { handleUserMessage, loadChatHistory, clearChatHistory } from './gemini.js';

// DOM Elements
let currentUser = null;
let currentChapter = null;
let currentQuiz = null;
let currentQuizUnitId = null;
let currentQuizChapterId = null;

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Init Firebase Auth
  initFirebaseAuth();
  
  // Setup tab navigation
  setupTabNavigation();
  
  // Setup floating environmental tip
  setupFloatingTip();
  
  // Setup chat functionality
  setupChatFunctionality();
  
  // Setup contact form
  setupContactForm();
});

// Initialize Firebase Authentication
function initFirebaseAuth() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // User is signed in
      console.log('User is signed in:', user.uid);
      currentUser = user;
      document.getElementById('app-container').classList.remove('hidden');
      document.getElementById('auth-container').classList.add('hidden');
      
      // Load user data
      loadUserData();
    } else {
      // User is signed out
      console.log('User is signed out');
      currentUser = null;
      document.getElementById('app-container').classList.add('hidden');
      document.getElementById('auth-container').classList.remove('hidden');
    }
  });
  
  // Setup auth forms
  setupAuthForms();
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
        
        // Initialize user data
        await initializeUserData(user.uid, { email: user.email });
        
        showMessage('Account created successfully!', 'success');
      } catch (error) {
        showMessage(`Registration error: ${error.message}`, 'error');
      }
    });
  }
  
  // Logout button
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      try {
        await firebase.auth().signOut();
      } catch (error) {
        showMessage(`Logout error: ${error.message}`, 'error');
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

// Load user data from Firebase
async function loadUserData() {
  if (!currentUser) return;
  
  try {
    const database = firebase.database();
    const progressRef = database.ref(`users/${currentUser.uid}/progress`);
    const scoresRef = database.ref(`users/${currentUser.uid}/scores`);
    
    // Get progress data
    const progressSnapshot = await progressRef.once('value');
    const progress = progressSnapshot.exists() ? progressSnapshot.val() : {};
    
    // Get scores data
    const scoresSnapshot = await scoresRef.once('value');
    const scores = scoresSnapshot.exists() ? scoresSnapshot.val() : {};
    
    // Display course content
    displayCourseContent(progress, scores);
    
    // Update progress dashboard
    updateProgressDashboard(progress, scores);
    
    // Load chat history
    loadChatHistory();
    
  } catch (error) {
    console.error('Error loading user data:', error);
    showMessage('Failed to load your data. Please try again.', 'error');
  }
}

// Display course content in the Home tab
function displayCourseContent(progress, scores) {
  const unitsContainer = document.querySelector('.units-container');
  if (!unitsContainer) return;
  
  unitsContainer.innerHTML = '';
  
  courseData.forEach(unit => {
    const unitCard = document.createElement('div');
    unitCard.className = 'unit-card';
    
    unitCard.innerHTML = `
      <div class="unit-header">
        <h2>${unit.title}</h2>
      </div>
      <div class="unit-content">
        <p>${unit.description}</p>
        <ul class="chapter-list">
          ${unit.chapters.map((chapter, index) => {
            const chapterKey = `${unit.id}-${chapter.id}`;
            const isCompleted = scores && scores[unit.id] && scores[unit.id][chapter.id] && scores[unit.id][chapter.id] >= 4;
            const isLocked = index > 0 && !(scores && scores[unit.id] && scores[unit.id][chapter.id - 1] && scores[unit.id][chapter.id - 1] >= 4);
            
            let statusClass = 'status-available';
            let statusText = 'Available';
            
            if (isCompleted) {
              statusClass = 'status-completed';
              statusText = 'Completed';
            } else if (isLocked) {
              statusClass = 'status-locked';
              statusText = 'Locked';
            }
            
            return `
              <li class="chapter-item ${isLocked ? 'locked' : ''}">
                <span>${chapter.title}</span>
                <button 
                  class="chapter-status ${statusClass}" 
                  data-unit="${unit.id}" 
                  data-chapter="${chapter.id}"
                  ${isLocked ? 'disabled' : ''}
                >
                  ${statusText}
                </button>
              </li>
            `;
          }).join('')}
        </ul>
      </div>
    `;
    
    unitsContainer.appendChild(unitCard);
  });
  
  // Add event listeners to chapter buttons
  document.querySelectorAll('.chapter-status').forEach(button => {
    if (button.classList.contains('status-locked')) return;
    
    button.addEventListener('click', () => {
      const unitId = parseInt(button.getAttribute('data-unit'));
      const chapterId = parseInt(button.getAttribute('data-chapter'));
      openChapter(unitId, chapterId);
    });
  });
}

// Open a chapter when selected
function openChapter(unitId, chapterId) {
  const unit = courseData.find(u => u.id === unitId);
  if (!unit) return;
  
  const chapter = unit.chapters.find(c => c.id === chapterId);
  if (!chapter) return;
  
  currentChapter = { unitId, chapterId, chapter };
  
  // Create chapter content modal
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${chapter.title}</h2>
        <span class="modal-close">&times;</span>
      </div>
      <div class="modal-body">
        ${chapter.content.map(item => {
          if (item.type === 'text') {
            return `<p>${item.data}</p>`;
          } else if (item.type === 'image') {
            return `
              <div class="chapter-image-container">
                <img src="${item.src}" alt="${item.alt}" class="chapter-image">
                <p class="image-caption">${item.caption}</p>
              </div>
            `;
          }
          return '';
        }).join('')}
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary start-quiz-btn">Take Quiz</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Show modal
  setTimeout(() => {
    modal.classList.add('active');
  }, 10);
  
  // Close button
  const closeBtn = modal.querySelector('.modal-close');
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    setTimeout(() => {
      document.body.removeChild(modal);
    }, 300);
  });
  
  // Start quiz button
  const startQuizBtn = modal.querySelector('.start-quiz-btn');
  startQuizBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    setTimeout(() => {
      document.body.removeChild(modal);
      startQuiz(unitId, chapterId);
    }, 300);
  });
}

// Start a quiz for a chapter
function startQuiz(unitId, chapterId) {
  const quizKey = `${unitId}-${chapterId}`;
  const questions = quizQuestions[quizKey];
  
  if (!questions) {
    showMessage('Quiz not found for this chapter.', 'error');
    return;
  }
  
  currentQuiz = [...questions]; // Copy questions array
  currentQuizUnitId = unitId;
  currentQuizChapterId = chapterId;
  let currentQuestionIndex = 0;
  let userAnswers = [];
  
  // Create quiz modal
  const modal = document.createElement('div');
  modal.className = 'modal quiz-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Chapter Quiz</h2>
        <div class="quiz-progress">Question <span id="current-question">1</span> of ${questions.length}</div>
      </div>
      <div class="modal-body" id="quiz-body">
        <!-- Question will be inserted here -->
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Show modal
  setTimeout(() => {
    modal.classList.add('active');
    displayQuestion(currentQuestionIndex);
  }, 10);
  
  // Function to display current question
  function displayQuestion(index) {
    const question = currentQuiz[index];
    const quizBody = document.getElementById('quiz-body');
    
    quizBody.innerHTML = `
      <div class="question">
        <h3>${question.question}</h3>
        <div class="options">
          ${question.options.map((option, i) => `
            <div class="option">
              <input type="radio" name="answer" id="option-${i}" value="${i}">
              <label for="option-${i}">${option}</label>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="quiz-nav">
        ${index > 0 ? '<button class="btn btn-outlined prev-btn">Previous</button>' : ''}
        <button class="btn btn-primary next-btn">
          ${index === questions.length - 1 ? 'Submit' : 'Next'}
        </button>
      </div>
    `;
    
    // Update current question counter
    document.getElementById('current-question').textContent = index + 1;
    
    // Set previous answer if user navigated back
    if (userAnswers[index] !== undefined) {
      const radioBtn = document.getElementById(`option-${userAnswers[index]}`);
      if (radioBtn) radioBtn.checked = true;
    }
    
    // Previous button
    const prevBtn = quizBody.querySelector('.prev-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (index > 0) {
          displayQuestion(index - 1);
        }
      });
    }
    
    // Next/Submit button
    const nextBtn = quizBody.querySelector('.next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        // Get selected answer
        const selectedOption = document.querySelector('input[name="answer"]:checked');
        
        if (!selectedOption) {
          alert('Please select an answer');
          return;
        }
        
        // Save answer
        userAnswers[index] = parseInt(selectedOption.value);
        
        if (index === questions.length - 1) {
          // Last question, submit quiz
          submitQuiz(userAnswers);
        } else {
          // Move to next question
          displayQuestion(index + 1);
        }
      });
    }
  }
  
  // Function to submit quiz
  async function submitQuiz(answers) {
    // Calculate score
    let score = 0;
    answers.forEach((answer, index) => {
      if (answer === currentQuiz[index].correctAnswer) {
        score++;
      }
    });
    
    // Save score to Firebase
    try {
      if (currentUser) {
        const database = firebase.database();
        const scoreRef = database.ref(`users/${currentUser.uid}/scores/${currentQuizUnitId}/${currentQuizChapterId}`);
        await scoreRef.set(score);
      }
    } catch (error) {
      console.error('Error saving score:', error);
    }
    
    // Display result
    const quizBody = document.getElementById('quiz-body');
    quizBody.innerHTML = `
      <div class="quiz-result">
        <h3>Quiz Result</h3>
        <div class="score-display">
          <div class="score">${score}/${questions.length}</div>
          <p>${score >= 4 ? 'Congratulations! You passed the quiz.' : 'You did not pass the quiz. You need at least 4 correct answers.'}</p>
        </div>
        <div class="result-actions">
          ${score < 4 ? '<button class="btn btn-outlined retry-btn">Retry Quiz</button>' : ''}
          <button class="btn btn-primary close-btn">Continue</button>
        </div>
      </div>
    `;
    
    // Retry button
    const retryBtn = quizBody.querySelector('.retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        userAnswers = [];
        displayQuestion(0);
      });
    }
    
    // Close button
    const closeBtn = quizBody.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => {
          document.body.removeChild(modal);
          
          // Reload user data to update UI
          loadUserData();
        }, 300);
      });
    }
  }
}

// Update progress dashboard in the Progress tab
function updateProgressDashboard(progress, scores) {
  const progressContainer = document.querySelector('.progress-container');
  if (!progressContainer) return;
  
  // Calculate statistics
  const stats = calculateProgressStats(scores);
  
  // Progress content
  progressContainer.innerHTML = `
    <div class="progress-chart">
      <h2>Course Completion</h2>
      <div class="completion-chart">
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${stats.completionPercentage}%"></div>
        </div>
        <div class="completion-percentage">${stats.completionPercentage}%</div>
      </div>
      <div class="progress-summary">
        <div class="stat-item">
          <span>Completed Chapters:</span>
          <span>${stats.completedChapters} / ${stats.totalChapters}</span>
        </div>
        <div class="stat-item">
          <span>Units Started:</span>
          <span>${stats.unitsStarted} / ${courseData.length}</span>
        </div>
        <div class="stat-item">
          <span>Units Completed:</span>
          <span>${stats.unitsCompleted} / ${courseData.length}</span>
        </div>
      </div>
    </div>
    
    <div class="progress-stats">
      <h2>Your Scores</h2>
      <div class="scores-list">
        ${courseData.map(unit => `
          <div class="unit-scores">
            <h3>${unit.title}</h3>
            <div class="chapter-scores">
              ${unit.chapters.map(chapter => {
                const score = scores && scores[unit.id] && scores[unit.id][chapter.id];
                const scoreText = score !== undefined ? `${score}/5` : 'Not taken';
                const scoreClass = score >= 4 ? 'passed' : (score !== undefined ? 'failed' : '');
                
                return `
                  <div class="score-item ${scoreClass}">
                    <span>${chapter.title}:</span>
                    <span>${scoreText}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  // Add chart styling
  const style = document.createElement('style');
  style.textContent = `
    .completion-chart {
      display: flex;
      align-items: center;
      margin: 20px 0;
    }
    
    .progress-bar-container {
      flex: 1;
      height: 20px;
      background-color: #f0f0f0;
      border-radius: 10px;
      overflow: hidden;
      margin-right: 15px;
    }
    
    .progress-bar {
      height: 100%;
      background-color: var(--primary-color);
      border-radius: 10px;
      transition: width 0.5s;
    }
    
    .completion-percentage {
      font-weight: 700;
      color: var(--primary-color);
      font-size: 18px;
      min-width: 45px;
    }
    
    .unit-scores {
      margin-bottom: 20px;
    }
    
    .chapter-scores {
      margin-left: 10px;
    }
    
    .score-item {
      padding: 5px 10px;
      display: flex;
      justify-content: space-between;
      border-left: 3px solid #ddd;
      margin: 5px 0;
    }
    
    .score-item.passed {
      border-left-color: var(--success-color);
    }
    
    .score-item.failed {
      border-left-color: var(--error-color);
    }
  `;
  
  document.head.appendChild(style);
}

// Calculate progress statistics
function calculateProgressStats(scores) {
  let completedChapters = 0;
  let totalChapters = 0;
  let unitsStarted = 0;
  let unitsCompleted = 0;
  
  courseData.forEach(unit => {
    let unitStarted = false;
    let unitChaptersCompleted = 0;
    
    unit.chapters.forEach(chapter => {
      totalChapters++;
      
      if (scores && scores[unit.id] && scores[unit.id][chapter.id] !== undefined) {
        unitStarted = true;
        
        if (scores[unit.id][chapter.id] >= 4) {
          completedChapters++;
          unitChaptersCompleted++;
        }
      }
    });
    
    if (unitStarted) unitsStarted++;
    if (unitChaptersCompleted === unit.chapters.length) unitsCompleted++;
  });
  
  const completionPercentage = Math.round((completedChapters / totalChapters) * 100) || 0;
  
  return {
    completedChapters,
    totalChapters,
    unitsStarted,
    unitsCompleted,
    completionPercentage
  };
}

// Setup chat functionality for the Chatbot tab
function setupChatFunctionality() {
  const chatInput = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-message');
  const chatMessages = document.getElementById('chat-messages');
  
  if (!chatInput || !sendButton || !chatMessages) return;
  
  // Send message when button is clicked
  sendButton.addEventListener('click', () => {
    sendChatMessage();
  });
  
  // Send message when Enter key is pressed
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendChatMessage();
    }
  });
  
  // Function to send message
  async function sendChatMessage() {
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Clear input
    chatInput.value = '';
    
    // Add user message to chat
    const userMessageEl = document.createElement('div');
    userMessageEl.className = 'chat-message user';
    userMessageEl.innerHTML = `
      <div class="message-content">
        ${message}
      </div>
    `;
    chatMessages.appendChild(userMessageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Process with Gemini API
    await handleUserMessage(message);
  }
  
  // Add clear chat button
  const chatHeader = document.querySelector('#chatbot-tab h1');
  if (chatHeader) {
    const clearButton = document.createElement('button');
    clearButton.className = 'btn btn-outlined clear-chat-btn';
    clearButton.textContent = 'Clear Chat';
    clearButton.style.marginLeft = '15px';
    clearButton.style.fontSize = '0.9rem';
    
    clearButton.addEventListener('click', () => {
      clearChatHistory();
    });
    
    chatHeader.appendChild(clearButton);
  }
}

// Setup contact form in the Contact tab
function setupContactForm() {
  const contactForm = document.getElementById('contact-form');
  
  if (!contactForm) return;
  
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      showMessage('You must be logged in to submit the form.', 'error');
      return;
    }
    
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const category = document.getElementById('contact-category').value;
    const message = document.getElementById('contact-message').value;
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage('Please enter a valid email address.', 'error');
      return;
    }
    
    if (!category) {
      showMessage('Please select a category.', 'error');
      return;
    }
    
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
      
      showMessage('Your message has been submitted successfully!', 'success');
      
      // Reset form
      contactForm.reset();
      
    } catch (error) {
      console.error('Error submitting form:', error);
      showMessage('Failed to submit your message. Please try again.', 'error');
    }
  });
}

// Setup the floating environmental tip
function setupFloatingTip() {
  const floatingTip = document.getElementById('floating-tip');
  const tipText = document.getElementById('tip-text');
  const closeBtn = floatingTip.querySelector('.tip-close');
  
  if (!floatingTip || !tipText || !closeBtn) return;
  
  // Show a random tip
  function showRandomTip() {
    const randomIndex = Math.floor(Math.random() * environmentalTips.length);
    tipText.textContent = environmentalTips[randomIndex];
  }
  
  // Initial tip
  showRandomTip();
  
  // Close button
  closeBtn.addEventListener('click', () => {
    floatingTip.style.display = 'none';
    
    // Show again after 60 seconds with a new tip
    setTimeout(() => {
      showRandomTip();
      floatingTip.style.display = 'flex';
    }, 60000);
  });
  
  // Change tip every 30 seconds
  setInterval(showRandomTip, 30000);
}

// Setup tab navigation
function setupTabNavigation() {
  const tabItems = document.querySelectorAll('.tab-item[data-tab]');
  
  tabItems.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      tabItems.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Hide all tab contents
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
      });
      
      // Show selected tab content
      const tabId = tab.getAttribute('data-tab');
      document.getElementById(`${tabId}-tab`).classList.remove('hidden');
    });
  });
}

// Utility function to show messages to the user
function showMessage(message, type = 'info') {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${type}`;
  messageElement.textContent = message;
  
  document.body.appendChild(messageElement);
  
  // Remove after 5 seconds
  setTimeout(() => {
    messageElement.classList.add('fade-out');
    setTimeout(() => {
      document.body.removeChild(messageElement);
    }, 500);
  }, 5000);
}

// Add CSS for new elements
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
  /* Modal styles */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s;
    z-index: 1000;
  }
  
  .modal.active {
    opacity: 1;
    visibility: visible;
  }
  
  .modal-content {
    background-color: white;
    border-radius: 8px;
    max-width: 800px;
    width: 90%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transform: translateY(20px);
    transition: transform 0.3s;
  }
  
  .modal.active .modal-content {
    transform: translateY(0);
  }
  
  .modal-header {
    padding: 15px 20px;
    background-color: var(--primary-color);
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-close {
    font-size: 24px;
    cursor: pointer;
  }
  
  .modal-body {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
  }
  
  .modal-footer {
    padding: 15px 20px;
    background-color: #f5f5f5;
    display: flex;
    justify-content: flex-end;
  }
  
  /* Chapter content styles */
  .chapter-image-container {
    margin: 20px 0;
    text-align: center;
  }
  
  .chapter-image {
    max-width: 100%;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .image-caption {
    margin-top: 10px;
    font-style: italic;
    color: var(--text-light);
  }
  
  /* Quiz styles */
  .quiz-progress {
    font-size: 0.9rem;
    background-color: rgba(255, 255, 255, 0.2);
    padding: 5px 10px;
    border-radius: 4px;
  }
  
  .question {
    margin-bottom: 30px;
  }
  
  .options {
    margin-top: 20px;
  }
  
  .option {
    padding: 10px;
    margin-bottom: 10px;
    background-color: #f9f9f9;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .option:hover {
    background-color: #f0f0f0;
  }
  
  .option input {
    margin-right: 10px;
  }
  
  .quiz-nav {
    display: flex;
    justify-content: space-between;
  }
  
  .quiz-result {
    text-align: center;
  }
  
  .score-display {
    margin: 30px 0;
  }
  
  .score {
    font-size: 48px;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 10px;
  }
  
  .result-actions {
    display: flex;
    justify-content: center;
    gap: 15px;
  }
  
  /* Message styles */
  .message {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 20px;
    border-radius: 4px;
    color: white;
    z-index: 2000;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    transition: opacity 0.5s;
  }
  
  .message.info {
    background-color: var(--info-color);
  }
  
  .message.success {
    background-color: var(--success-color);
  }
  
  .message.error {
    background-color: var(--error-color);
  }
  
  .message.warning {
    background-color: var(--warning-color);
  }
  
  .message.fade-out {
    opacity: 0;
  }
  
  /* Chat styles */
  .typing-indicator {
    display: flex;
    align-items: center;
  }
  
  .typing-indicator span {
    height: 8px;
    width: 8px;
    background-color: #bbb;
    border-radius: 50%;
    display: inline-block;
    margin: 0 2px;
    animation: typing 1s infinite;
  }
  
  .typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  @keyframes typing {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  
  /* Mobile tab bar - bottom navigation */
  @media (max-width: 768px) {
    .tab-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      top: auto;
      margin-bottom: 0;
      border-radius: 0;
      z-index: 900;
    }
    
    .container {
      padding-bottom: 70px;
    }
    
    .logout-container {
      top: 10px;
      right: 10px;
    }
    
    .floating-tip {
      bottom: 70px;
    }
  }
`;

document.head.appendChild(additionalStyles);