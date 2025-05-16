import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { Leaf } from 'lucide-react-native';
import { environmentalTips } from '../data/environmentalTips';

const FloatingTip = () => {
  const [tipVisible, setTipVisible] = useState(false);
  const [currentTip, setCurrentTip] = useState('');
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const tipOpacity = useRef(new Animated.Value(0)).current;
  
  // Bouncing animation for the leaf icon
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 300,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
      ]).start();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Show random tip from the environmental tips data
  const showRandomTip = () => {
    const randomIndex = Math.floor(Math.random() * environmentalTips.length);
    setCurrentTip(environmentalTips[randomIndex]);
    setTipVisible(true);

    // Animate tip appearance
    Animated.timing(tipOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto-hide the tip after 5 seconds
    setTimeout(() => {
      Animated.timing(tipOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setTipVisible(false));
    }, 5000);
  };

  return (
    <View style={styles.container}>
      {tipVisible && (
        <Animated.View style={[styles.tipContainer, { opacity: tipOpacity }]}>
          <Text style={styles.tipText}>{currentTip}</Text>
        </Animated.View>
      )}
      
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={showRandomTip}
      >
        <Animated.View 
          style={[
            styles.buttonContainer,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <Leaf size={24} color="#FFFFFF" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'flex-end',
  },
  buttonContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tipContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    maxWidth: 250,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  tipText: {
    fontFamily: 'Roboto_400Regular',
    color: '#212121',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default FloatingTip;
