import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Send } from 'lucide-react-native';
import { getAuth } from 'firebase/auth';
import { saveChatMessage, getChatHistory } from '../lib/firebase';
import { sendMessage } from '../lib/gemini';

const ChatbotScreen = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [chat, setChat] = useState(null);
  const flatListRef = useRef();

  // Load chat history
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const auth = getAuth();
        const userId = auth.currentUser.uid;
        const history = await getChatHistory(userId);
        
        if (history) {
          // Convert object to array and sort by timestamp
          const historyArray = Object.entries(history).map(([key, value]) => ({
            id: key,
            ...value,
          }));
          
          historyArray.sort((a, b) => a.timestamp - b.timestamp);
          setMessages(historyArray);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadChatHistory();
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages]);

  // Send a message
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const auth = getAuth();
    const userId = auth.currentUser.uid;
    const userMessage = message.trim();
    
    // Add user message to UI
    const newUserMessage = {
      id: Date.now().toString(),
      content: userMessage,
      isUser: true,
      timestamp: Date.now(),
    };
    
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setMessage('');
    setLoading(true);
    
    // Save user message to Firebase
    try {
      await saveChatMessage(userId, userMessage, true);
      
      // Show typing indicator
      const responseData = await sendMessage(userMessage, chat);
      
      if (responseData.success) {
        // Save chat instance for context
        setChat(responseData.chat);
        
        // Add AI response to UI
        const newAiMessage = {
          id: (Date.now() + 1).toString(),
          content: responseData.message,
          isUser: false,
          timestamp: Date.now(),
        };
        
        setMessages(prevMessages => [...prevMessages, newAiMessage]);
        
        // Save AI response to Firebase
        await saveChatMessage(userId, responseData.message, false);
      } else {
        // Handle error
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          content: responseData.message,
          isUser: false,
          error: true,
          timestamp: Date.now(),
        };
        
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, something went wrong. Please try again later.',
        isUser: false,
        error: true,
        timestamp: Date.now(),
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Render a chat message
  const renderMessage = ({ item }) => {
    return (
      <View style={[
        styles.messageBubble,
        item.isUser ? styles.userMessage : styles.aiMessage,
        item.error && styles.errorMessage,
      ]}>
        <Text style={[
          styles.messageText,
          item.isUser ? styles.userMessageText : styles.aiMessageText,
        ]}>
          {item.content}
        </Text>
      </View>
    );
  };

  // Render welcome message or chat history
  const renderChatContent = () => {
    if (initialLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      );
    }

    if (messages.length === 0) {
      return (
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome to Eco-Learn Chatbot!</Text>
          <Text style={styles.welcomeText}>
            I'm your environmental education assistant. Ask me anything about green methodologies, clean development mechanisms, or environmental impact assessment!
          </Text>
          <View style={styles.suggestionContainer}>
            <Text style={styles.suggestionTitle}>Try asking:</Text>
            <TouchableOpacity
              style={styles.suggestionBubble}
              onPress={() => {
                setMessage('What are green methodologies?');
                handleSendMessage();
              }}
            >
              <Text style={styles.suggestionText}>What are green methodologies?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.suggestionBubble}
              onPress={() => {
                setMessage('Explain clean development mechanisms');
                handleSendMessage();
              }}
            >
              <Text style={styles.suggestionText}>Explain clean development mechanisms</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.suggestionBubble}
              onPress={() => {
                setMessage('Why is environmental impact assessment important?');
                handleSendMessage();
              }}
            >
              <Text style={styles.suggestionText}>Why is environmental impact assessment important?</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
      />
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.chatContainer}>
        {renderChatContent()}
        
        {loading && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>Eco-Assistant is typing...</Text>
            <ActivityIndicator size="small" color="#4CAF50" />
          </View>
        )}
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask me anything about environmental topics..."
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !message.trim() && styles.disabledButton,
          ]}
          onPress={handleSendMessage}
          disabled={!message.trim() || loading}
        >
          <Send size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    color: '#616161',
    marginTop: 16,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: '#212121',
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    color: '#616161',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  suggestionContainer: {
    width: '100%',
    alignItems: 'flex-start',
  },
  suggestionTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#212121',
    marginBottom: 12,
  },
  suggestionBubble: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: '90%',
  },
  suggestionText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    color: '#4CAF50',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    backgroundColor: '#E8F5E9',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  errorMessage: {
    backgroundColor: '#FFEBEE',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#212121',
    fontFamily: 'Roboto_400Regular',
  },
  aiMessageText: {
    color: '#212121',
    fontFamily: 'Roboto_400Regular',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginBottom: 8,
  },
  typingText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    color: '#757575',
    marginRight: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default ChatbotScreen;
