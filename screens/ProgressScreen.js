import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Award, Book, CheckCircle, Circle } from 'lucide-react-native';
import { getAuth } from 'firebase/auth';
import { getUserProgress, getUserScores } from '../lib/firebase';
import { courseData } from '../data/courseContent';

const screenWidth = Dimensions.get('window').width;

const ProgressScreen = () => {
  const [userProgress, setUserProgress] = useState({});
  const [userScores, setUserScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCompleted: 0,
    averageScore: 0,
    totalScore: 0,
    chaptersStarted: 0,
  });

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
        
        // Calculate stats
        calculateStats(scores);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const calculateStats = (scores) => {
    if (!scores) {
      setStats({
        totalCompleted: 0,
        averageScore: 0,
        totalScore: 0,
        chaptersStarted: 0,
      });
      return;
    }

    let totalCompleted = 0;
    let totalScore = 0;
    let totalAttempts = 0;
    let chaptersStarted = 0;

    // Count completed chapters and calculate scores
    Object.keys(scores).forEach(unitId => {
      Object.keys(scores[unitId]).forEach(chapterId => {
        const score = scores[unitId][chapterId];
        chaptersStarted++;
        totalScore += score;
        
        if (score >= 4) { // 4/5 correct answers required to pass
          totalCompleted++;
        }
        
        totalAttempts++;
      });
    });

    setStats({
      totalCompleted,
      averageScore: totalAttempts > 0 ? (totalScore / totalAttempts).toFixed(1) : 0,
      totalScore,
      chaptersStarted,
    });
  };

  // Count total chapters in the course
  const totalChapters = courseData.reduce((total, unit) => total + unit.chapters.length, 0);

  // Calculate completion percentage
  const completionPercentage = Math.round((stats.totalCompleted / totalChapters) * 100);

  // Prepare data for unit scores chart
  const prepareChartData = () => {
    const labels = courseData.map(unit => `Unit ${unit.id}`);
    const datasets = [{
      data: courseData.map(unit => {
        if (!userScores[unit.id]) return 0;
        
        const unitScores = Object.values(userScores[unit.id]);
        if (unitScores.length === 0) return 0;
        
        // Average score for this unit
        return unitScores.reduce((sum, score) => sum + score, 0) / unitScores.length;
      }),
    }];
    
    return { labels, datasets };
  };

  const chartData = prepareChartData();
  
  // Create an array of all chapters with their completion status
  const getAllChapters = () => {
    const allChapters = [];
    
    courseData.forEach(unit => {
      unit.chapters.forEach(chapter => {
        const score = userScores?.[unit.id]?.[chapter.id] || 0;
        const passed = score >= 4;
        const attempted = score > 0;
        
        allChapters.push({
          unitId: unit.id,
          chapterId: chapter.id,
          unitTitle: unit.title,
          chapterTitle: chapter.title,
          score,
          passed,
          attempted,
        });
      });
    });
    
    return allChapters;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Learning Progress</Text>
      </View>
      
      {/* Summary stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Book size={24} color="#4CAF50" />
          </View>
          <Text style={styles.statValue}>{stats.chaptersStarted}</Text>
          <Text style={styles.statLabel}>Chapters Started</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <CheckCircle size={24} color="#4CAF50" />
          </View>
          <Text style={styles.statValue}>{stats.totalCompleted}</Text>
          <Text style={styles.statLabel}>Chapters Completed</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Award size={24} color="#4CAF50" />
          </View>
          <Text style={styles.statValue}>{stats.averageScore}</Text>
          <Text style={styles.statLabel}>Average Score</Text>
        </View>
      </View>
      
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Overall Completion</Text>
          <Text style={styles.progressPercentage}>{completionPercentage}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[styles.progressBarFill, { width: `${completionPercentage}%` }]} 
          />
        </View>
        <Text style={styles.progressDetail}>
          {stats.totalCompleted} out of {totalChapters} chapters completed
        </Text>
      </View>
      
      {/* Performance chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Performance by Unit</Text>
        <BarChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          yAxisSuffix=""
          yAxisLabel=""
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(33, 33, 33, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            barPercentage: 0.7,
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
          showValuesOnTopOfBars={true}
        />
      </View>
      
      {/* Chapter progress list */}
      <View style={styles.chapterListContainer}>
        <Text style={styles.chapterListTitle}>Chapter Progress</Text>
        
        {getAllChapters().map((chapter, index) => (
          <View key={index} style={styles.chapterItem}>
            <View style={styles.chapterStatus}>
              {chapter.passed ? (
                <CheckCircle size={24} color="#4CAF50" />
              ) : chapter.attempted ? (
                <Circle size={24} color="#FFC107" />
              ) : (
                <Circle size={24} color="#E0E0E0" />
              )}
            </View>
            <View style={styles.chapterInfo}>
              <Text style={styles.chapterUnit}>{chapter.unitTitle}</Text>
              <Text style={styles.chapterTitle}>{chapter.chapterTitle}</Text>
            </View>
            <View style={styles.chapterScore}>
              <Text style={[
                styles.scoreText,
                chapter.passed ? styles.passedScore : 
                chapter.attempted ? styles.attemptedScore : styles.notAttemptedScore
              ]}>
                {chapter.attempted ? `${chapter.score}/5` : 'Not started'}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    color: '#616161',
    marginTop: 16,
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: -20,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '31%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: '#212121',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
  progressContainer: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#212121',
  },
  progressPercentage: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#4CAF50',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressDetail: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    color: '#757575',
  },
  chartContainer: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#212121',
    marginBottom: 16,
  },
  chapterListContainer: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  chapterListTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#212121',
    marginBottom: 16,
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  chapterStatus: {
    marginRight: 16,
  },
  chapterInfo: {
    flex: 1,
  },
  chapterUnit: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  chapterTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#212121',
  },
  chapterScore: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  scoreText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
  },
  passedScore: {
    color: '#4CAF50',
  },
  attemptedScore: {
    color: '#FFC107',
  },
  notAttemptedScore: {
    color: '#9E9E9E',
    fontSize: 12,
  },
});

export default ProgressScreen;
