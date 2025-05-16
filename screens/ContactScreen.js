import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { getAuth } from 'firebase/auth';
import { saveContactSubmission } from '../lib/firebase';

const ContactScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('feedback');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Form validation
  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter your message');
      return false;
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const auth = getAuth();
      const userId = auth.currentUser.uid;
      
      // Prepare form data
      const formData = {
        name,
        email,
        category,
        message,
        createdAt: Date.now(),
      };
      
      // Save to Firebase
      await saveContactSubmission(userId, formData);
      
      // Show success message
      setSubmitted(true);
      
      // Reset form
      setName('');
      setEmail('');
      setCategory('feedback');
      setMessage('');
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', 'There was a problem submitting your form. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Success message screen
  const renderSuccess = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIconContainer}>
        <CheckCircle size={64} color="#4CAF50" />
      </View>
      <Text style={styles.successTitle}>Thank You!</Text>
      <Text style={styles.successMessage}>
        Your message has been submitted successfully. We will get back to you as soon as possible.
      </Text>
    </View>
  );
  
  // Contact form
  const renderForm = () => (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.formTitle}>Contact Us</Text>
      <Text style={styles.formSubtitle}>
        Have a question, feedback, or issue with the app? Let us know!
      </Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Feedback" value="feedback" />
            <Picker.Item label="Dispute" value="dispute" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Message</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Enter your message"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>
      
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Submit</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
  
  return (
    <View style={styles.container}>
      {submitted ? renderSuccess() : renderForm()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  formContainer: {
    padding: 20,
  },
  formTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: '#212121',
    marginBottom: 8,
  },
  formSubtitle: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    color: '#616161',
    marginBottom: 24,
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#212121',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  textArea: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: 'white',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: '#212121',
    marginBottom: 16,
  },
  successMessage: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    color: '#616161',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '80%',
  },
});

export default ContactScreen;
