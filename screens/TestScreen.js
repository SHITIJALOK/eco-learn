import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { CheckCircle, XCircle } from 'lucide-react-native';
import { getAuth } from 'firebase/auth';
import { saveTestScore } from '../lib/firebase';
import { quizQuestions } from '../data/quizQuestions';

const TestScreen = ({ route, navigation }) => {
  const { unitId, chapterId, title } = route.params;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [testCompleted, setTestCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Get questions for this chapter
  const questions = quizQuestions[unitId]?.[chapterId] || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Handle answer selection
  const handleAnswerSelect = (answerIndex) => {
    if (!testCompleted) {
      setSelectedAnswer(answerIndex);
    }
  };

  // Move to the next question
  const handleNextQuestion = () => {
    if (selectedAnswer === null) {
      Alert.alert('Please select an answer');
      return;
    }

    // Save the answer
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const newAnswers = [...answers, { 
      questionIndex: currentQuestionIndex,
      selectedAnswer,
      isCorrect
    }];
    
    setAnswers(newAnswers);
    
    // Calculate new score
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);

    // Check if we have more questions
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      // Test completed
      completeTest(newScore, newAnswers);
    }
  };

  // Complete the test and save score
  const completeTest = async (finalScore, finalAnswers) => {
    setTestCompleted(true);
    
    // Save score to Firebase
    try {
      const auth = getAuth();
      await saveTestScore(auth.currentUser.uid, unitId, chapterId, finalScore);
    } catch (error) {
      console.error('Error saving test score:', error);
    }
  };

  // Return to the home screen
  const handleGoHome = () => {
    navigation.navigate('HomeMain');
  };

  // Retry the test
  const handleRetryTest = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setTestCompleted(false);
    setScore(0);
  };

  // Render the test result screen
  const renderTestComplete = () => {
    const passed = score >= 4; // Need 4/5 to pass
    
    return (
      <View style={styles.completedContainer}>
        <View style={[
          styles.scoreCircle, 
          { backgroundColor: passed ? '#4CAF50' : '#F44336' }
        ]}>
          <Text style={styles.scoreText}>{score}/5</Text>
        </View>
        
        <Text style={styles.resultTitle}>
          {passed ? 'Congratulations!' : 'Almost there!'}
        </Text>
        
        <Text style={styles.resultText}>
          {passed 
            ? 'You passed the test and can continue to the next chapter.' 
            : 'You need 4 or more correct answers to pass this test.'}
        </Text>
        
        {/* Show which questions were answered correctly */}
        <View style={styles.answersContainer}>
          {answers.map((answer, index) => (
            <View key={index} style={styles.answerResult}>
              <View style={styles.answerIcon}>
                {answer.isCorrect ? (
                  <CheckCircle size={24} color="#4CAF50" />
                ) : (
                  <XCircle size={24} color="#F44336" />
                )}
              </View>
              <Text style={styles.answerText}>
                Question {index + 1}: {answer.isCorrect ? 'Correct' : 'Incorrect'}
              </Text>
            </View>
          ))}
        </View>
        
        <View style={styles.buttonContainer}>
          {passed ? (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleGoHome}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleRetryTest}
              >
                <Text style={styles.secondaryButtonText}>Retry Test</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleGoHome}
              >
                <Text style={styles.primaryButtonText}>Back to Home</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  // Render the current question
  const renderQuestion = () => {
    if (!currentQuestion) return null;
    
    return (
      <View style={styles.questionContainer}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1}/{questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, 
                { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }
              ]} 
            />
          </View>
        </View>
        
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        
        {/* Answer options */}
        {currentQuestion.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.answerOption,
              selectedAnswer === index && styles.selectedAnswer,
            ]}
            onPress={() => handleAnswerSelect(index)}
          >
            <Text style={[
              styles.answerOptionText,
              selectedAnswer === index && styles.selectedAnswerText,
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity
          style={[
            styles.nextButton,
            { opacity: selectedAnswer !== null ? 1 : 0.5 },
          ]}
          onPress={handleNextQuestion}
          disabled={selectedAnswer === null}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next Question'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        
        {testCompleted ? renderTestComplete() : renderQuestion()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: '#212121',
    marginBottom: 24,
  },
  questionContainer: {
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  questionText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 18,
    color: '#212121',
    marginBottom: 20,
    lineHeight: 26,
  },
  answerOption: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#F5F7FA',
  },
  selectedAnswer: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  answerOptionText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    color: '#424242',
  },
  selectedAnswerText: {
    color: '#4CAF50',
    fontFamily: 'Roboto_500Medium',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: 'white',
  },
  completedContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
    color: 'white',
  },
  resultTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: '#212121',
    marginBottom: 12,
    textAlign: 'center',
  },
  resultText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    color: '#616161',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  answersContainer: {
    width: '100%',
    marginBottom: 24,
  },
  answerResult: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  answerIcon: {
    marginRight: 12,
  },
  answerText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    color: '#424242',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  primaryButtonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: 'white',
  },
  secondaryButtonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#424242',
  },
});

export default TestScreen;
