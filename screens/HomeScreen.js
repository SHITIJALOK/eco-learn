import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { ChevronRight, Lock } from 'lucide-react-native';
import { getAuth } from 'firebase/auth';
import { getUserProgress, getUserScores } from '../lib/firebase';
import { courseData } from '../data/courseContent';
import FloatingTip from '../components/FloatingTip';

const HomeScreen = ({ navigation }) => {
  const [userProgress, setUserProgress] = useState({});
  const [userScores, setUserScores] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        const auth = getAuth();
        const userId = auth.currentUser.uid;
        
        // Fetch user progress and scores
        const progress = await getUserProgress(userId);
        const scores = await getUserScores(userId);
        
        setUserProgress(progress || {});
        setUserScores(scores || {});
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
    
    // Refresh data when coming back to the screen
    const unsubscribe = navigation.addListener('focus', loadUserData);
    return unsubscribe;
  }, [navigation]);

  // Check if a chapter is locked based on user progress
  const isChapterLocked = (unitId, chapterId) => {
    // First chapter is always unlocked
    if (unitId === 1 && chapterId === 1) return false;
    
    // Previous chapter in the same unit
    if (chapterId > 1) {
      const prevChapterId = chapterId - 1;
      return !hasPassedChapter(unitId, prevChapterId);
    }
    
    // First chapter of a new unit, check if the last chapter of previous unit is passed
    if (unitId > 1 && chapterId === 1) {
      const prevUnitId = unitId - 1;
      const prevUnitChapters = courseData.find(unit => unit.id === prevUnitId)?.chapters || [];
      const lastChapterId = prevUnitChapters.length;
      return !hasPassedChapter(prevUnitId, lastChapterId);
    }
    
    return true;
  };
  
  // Check if user has passed a specific chapter
  const hasPassedChapter = (unitId, chapterId) => {
    return userScores?.[unitId]?.[chapterId] >= 4; // 4/5 correct answers required to pass
  };

  // Render unit card with chapters
  const renderUnit = ({ item: unit }) => (
    <View style={styles.unitCard}>
      <Text style={styles.unitTitle}>{unit.title}</Text>
      <Text style={styles.unitDescription}>{unit.description}</Text>
      
      {/* Chapter list */}
      {unit.chapters.map((chapter) => {
        const locked = isChapterLocked(unit.id, chapter.id);
        const passed = hasPassedChapter(unit.id, chapter.id);
        
        return (
          <TouchableOpacity
            key={`${unit.id}-${chapter.id}`}
            style={[
              styles.chapterButton,
              { opacity: locked ? 0.7 : 1 }
            ]}
            onPress={() => {
              if (!locked) {
                navigation.navigate('Chapter', {
                  unitId: unit.id,
                  chapterId: chapter.id,
                  title: chapter.title,
                  content: chapter.content,
                });
              }
            }}
            disabled={locked}
          >
            <View style={styles.chapterInfo}>
              <Text style={styles.chapterTitle}>
                {chapter.title}
              </Text>
              <Text style={styles.chapterSubtitle}>
                {passed 
                  ? `Completed (Score: ${userScores?.[unit.id]?.[chapter.id] || 0}/5)` 
                  : locked 
                    ? 'Locked' 
                    : 'Not completed'}
              </Text>
            </View>
            
            {locked ? (
              <Lock size={20} color="#757575" />
            ) : (
              <ChevronRight size={20} color="#4CAF50" />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Welcome to Eco-Learn</Text>
          <Text style={styles.headerSubtitle}>
            Learn about environmental sustainability through interactive lessons
          </Text>
        </View>
        
        <FlatList
          data={courseData}
          renderItem={renderUnit}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          contentContainerStyle={styles.unitsList}
        />
      </ScrollView>
      
      {/* Floating environmental tip bubble */}
      <FloatingTip />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 22,
  },
  unitsList: {
    padding: 16,
  },
  unitCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  unitTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#212121',
    marginBottom: 8,
  },
  unitDescription: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    color: '#616161',
    marginBottom: 20,
    lineHeight: 22,
  },
  chapterButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#212121',
    marginBottom: 4,
  },
  chapterSubtitle: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 12,
    color: '#757575',
  },
});

export default HomeScreen;
