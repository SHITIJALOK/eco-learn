// Initialize the Gemini API
const API_KEY = "AIzaSyBHSM6qJ0kjIaGPtFK0PSb952elByKkdJg"; // Using the API key provided in requirements
const MODEL = "gemini-2.0-flash"; // Using the model specified

// Chatbot context and history management
let chatHistory = [];

// Initialize the Gemini model with environmental context
const environmentalContext = `
You are an expert environmental education assistant for the Eco-Learn application.
Your name is EcoLearn Assistant.
Provide helpful, accurate, and concise information about environmental topics including:
- Green methodologies
- Clean Development Mechanisms (CDM)
- Environmental Impact Assessment (EIA)
- Sustainability practices
- Climate change
- Conservation
- Renewable energy

Keep responses educational, factual, and suitable for learning purposes.
If you're unsure about something, acknowledge it rather than providing incorrect information.
Keep your responses conversational, friendly, and easy to understand.
Start your responses with a brief direct answer, then provide more details if needed.
`;

// Function to send a message to the Gemini API
async function sendMessageToGemini(message) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent`;
    
    // Build the prompt with context and history
    const messagesForAPI = [
      {
        role: "user",
        parts: [{ text: environmentalContext }]
      },
      ...chatHistory.map(msg => ({
        role: msg.isUser ? "user" : "model",
        parts: [{ text: msg.content }]
      })),
      {
        role: "user",
        parts: [{ text: message }]
      }
    ];
    
    // Make the API request
    const response = await fetch(`${url}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: messagesForAPI,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract the response text
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                         "I'm sorry, I couldn't generate a response. Please try again.";
    
    // Add messages to history (limiting history length to prevent token limits)
    if (chatHistory.length > 10) {
      chatHistory = chatHistory.slice(chatHistory.length - 10);
    }
    
    chatHistory.push({ content: message, isUser: true });
    chatHistory.push({ content: responseText, isUser: false });
    
    return responseText;
  } catch (error) {
    console.error("Error with Gemini API:", error);
    return "I'm sorry, I encountered an error with the AI service. Please try again later.";
  }
}

// Function to handle a new user message
async function handleUserMessage(message) {
  try {
    // Show loading state in UI
    const chatMessages = document.getElementById('chat-messages');
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Show loading indicator
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'message bot';
    loadingMsg.innerHTML = `
      <div class="bot-avatar">
        <i class="fas fa-leaf"></i>
      </div>
      <div class="message-bubble">
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    chatMessages.appendChild(loadingMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Get response from Gemini
    const response = await sendMessageToGemini(message);
    
    // Remove loading message
    chatMessages.removeChild(loadingMsg);
    
    // Add the actual response
    const responseEl = document.createElement('div');
    responseEl.className = 'message bot';
    responseEl.innerHTML = `
      <div class="bot-avatar">
        <i class="fas fa-leaf"></i>
      </div>
      <div class="message-bubble">
        ${response.replace(/\n/g, "<br>")}
      </div>
      <div class="message-time">${timestamp}</div>
    `;
    chatMessages.appendChild(responseEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Save to Firebase if user is logged in
    const auth = firebase.auth().currentUser;
    if (auth) {
      const database = firebase.database();
      const chatRef = database.ref(`users/${auth.uid}/chatHistory`);
      
      // Save user message
      chatRef.push({
        content: message,
        isUser: true,
        timestamp: Date.now()
      });
      
      // Save bot response
      chatRef.push({
        content: response,
        isUser: false,
        timestamp: Date.now()
      });
    }
    
    return response;
  } catch (error) {
    console.error("Error handling message:", error);
    // Add error message to chat
    const chatMessages = document.getElementById('chat-messages');
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const errorMsg = document.createElement('div');
    errorMsg.className = 'message bot';
    errorMsg.innerHTML = `
      <div class="bot-avatar">
        <i class="fas fa-leaf"></i>
      </div>
      <div class="message-bubble error">
        I'm sorry, I encountered an error. Please try again later.
      </div>
      <div class="message-time">${timestamp}</div>
    `;
    chatMessages.appendChild(errorMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return null;
  }
}

// Function to load chat history from Firebase
async function loadChatHistory() {
  try {
    const auth = firebase.auth().currentUser;
    if (!auth) return;
    
    const database = firebase.database();
    const chatRef = database.ref(`users/${auth.uid}/chatHistory`);
    
    // Get the most recent messages (limit to 20)
    const snapshot = await chatRef.limitToLast(20).once("value");
    const history = snapshot.val();
    
    if (!history) return;
    
    // Clear the current chat history
    chatHistory = [];
    
    // Clear the chat UI
    const chatMessages = document.getElementById("chat-messages");
    chatMessages.innerHTML = "";
    
    // Add messages to the UI and history array
    Object.values(history)
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach(msg => {
        // Add to history array
        chatHistory.push({
          content: msg.content,
          isUser: msg.isUser
        });
        
        // Add to UI
        const messageEl = document.createElement("div");
        messageEl.className = `chat-message ${msg.isUser ? "user" : "bot"}`;
        messageEl.innerHTML = `
          <div class="message-content">
            ${msg.content.replace(/\n/g, "<br>")}
          </div>
        `;
        chatMessages.appendChild(messageEl);
      });
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  } catch (error) {
    console.error("Error loading chat history:", error);
  }
}

// Clear chat history
async function clearChatHistory() {
  chatHistory = [];
  const chatMessages = document.getElementById("chat-messages");
  
  // Clear local display
  chatMessages.innerHTML = `
    <div class="message bot">
      <div class="bot-avatar">
        <i class="fas fa-robot"></i>
      </div>
      <div class="message-bubble">
        Hello! I'm your EcoBot assistant. Ask me anything about environmental topics!
      </div>
      <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
    </div>
  `;
  
  // Also clear chat data in Firebase for current user
  const currentUser = firebase.auth().currentUser;
  if (currentUser) {
    try {
      const database = firebase.database();
      const chatRef = database.ref(`chats/${currentUser.uid}`);
      await chatRef.remove();
      console.log('Chat history cleared from Firebase');
    } catch (error) {
      console.error('Error clearing chat history from Firebase:', error);
    }
  }
}

// Export functions
export {
  handleUserMessage,
  loadChatHistory,
  clearChatHistory
};