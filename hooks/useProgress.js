import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getUserProgress, getUserScores, saveUserProgress, saveTestScore } from '../lib/firebase';
import { courseData } from '../data/courseContent';

/**
 * Custom hook for managing user progress data and operations
 * @returns {Object} Progress state and methods
 */
export default function useProgress() {
  const [progress, setProgress] = useState({});
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCompleted: 0,
    averageScore: 0,
    totalScore: 0,
    chaptersStarted: 0,
  });

  // Fetch user progress and scores
  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        const auth = getAuth();
        if (!auth.currentUser) {
          setProgress({});
          setScores({});
          setLoading(false);
          return;
        }
        
        const userId = auth.currentUser.uid;
        const userProgress = await getUserProgress(userId);
        const userScores = await getUserScores(userId);
        
        setProgress(userProgress || {});
        setScores(userScores || {});
        
        // Calculate stats
        calculateStats(userScores);
      } catch (err) {
        console.error('Error fetching progress data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  /**
   * Calculate user progress statistics
   * @param {Object} userScores - User's test scores
   */
  const calculateStats = (userScores) => {
    if (!userScores) {
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
    Object.keys(userScores).forEach(unitId => {
      Object.keys(userScores[unitId]).forEach(chapterId => {
        const score = userScores[unitId][chapterId];
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

  /**
   * Check if a chapter is completed (passed test)
   * @param {number} unitId - Unit ID
   * @param {number} chapterId - Chapter ID
   * @returns {boolean} - Whether chapter is completed
   */
  const isChapterCompleted = (unitId, chapterId) => {
    return scores?.[unitId]?.[chapterId] >= 4; // 4/5 correct answers required to pass
  };

  /**
   * Check if a chapter is locked based on previous progress
   * @param {number} unitId - Unit ID
   * @param {number} chapterId - Chapter ID
   * @returns {boolean} - Whether chapter is locked
   */
  const isChapterLocked = (unitId, chapterId) => {
    // First chapter is always unlocked
    if (unitId === 1 && chapterId === 1) return false;
    
    // Previous chapter in the same unit
    if (chapterId > 1) {
      const prevChapterId = chapterId - 1;
      return !isChapterCompleted(unitId, prevChapterId);
    }
    
    // First chapter of a new unit, check if the last chapter of previous unit is passed
    if (unitId > 1 && chapterId === 1) {
      const prevUnitId = unitId - 1;
      const prevUnitChapters = courseData.find(unit => unit.id === prevUnitId)?.chapters || [];
      const lastChapterId = prevUnitChapters.length;
      return !isChapterCompleted(prevUnitId, lastChapterId);
    }
    
    return true;
  };

  /**
   * Update a chapter's progress
   * @param {number} unitId - Unit ID 
   * @param {number} chapterId - Chapter ID
   * @param {Object} progressData - Progress data to save
   * @returns {Promise<void>}
   */
  const updateChapterProgress = async (unitId, chapterId, progressData) => {
    try {
      const auth = getAuth();
      if (!auth.currentUser) return;
      
      const userId = auth.currentUser.uid;
      await saveUserProgress(userId, unitId, chapterId, progressData);
      
      // Update local state
      setProgress(prevProgress => ({
        ...prevProgress,
        [unitId]: {
          ...(prevProgress[unitId] || {}),
          [chapterId]: progressData
        }
      }));
    } catch (err) {
      console.error('Error updating chapter progress:', err);
      setError(err.message);
    }
  };

  /**
   * Save a test score
   * @param {number} unitId - Unit ID
   * @param {number} chapterId - Chapter ID 
   * @param {number} score - Test score (0-5)
   * @returns {Promise<void>}
   */
  const updateTestScore = async (unitId, chapterId, score) => {
    try {
      const auth = getAuth();
      if (!auth.currentUser) return;
      
      const userId = auth.currentUser.uid;
      await saveTestScore(userId, unitId, chapterId, score);
      
      // Update local state
      const newScores = {
        ...scores,
        [unitId]: {
          ...(scores[unitId] || {}),
          [chapterId]: score
        }
      };
      
      setScores(newScores);
      
      // Recalculate stats
      calculateStats(newScores);
    } catch (err) {
      console.error('Error updating test score:', err);
      setError(err.message);
    }
  };

  /**
   * Get completion percentage
   * @returns {number} - Percentage of completed chapters
   */
  const getCompletionPercentage = () => {
    const totalChapters = courseData.reduce((total, unit) => 
      total + unit.chapters.length, 0);
    
    return Math.round((stats.totalCompleted / totalChapters) * 100);
  };

  /**
   * Get all chapters with their completion status
   * @returns {Array} - Array of chapter objects with status
   */
  const getAllChaptersWithStatus = () => {
    const allChapters = [];
    
    courseData.forEach(unit => {
      unit.chapters.forEach(chapter => {
        const score = scores?.[unit.id]?.[chapter.id] || 0;
        const passed = score >= 4;
        const attempted = score > 0;
        const locked = isChapterLocked(unit.id, chapter.id);
        
        allChapters.push({
          unitId: unit.id,
          chapterId: chapter.id,
          unitTitle: unit.title,
          chapterTitle: chapter.title,
          score,
          passed,
          attempted,
          locked
        });
      });
    });
    
    return allChapters;
  };

  return {
    progress,
    scores,
    stats,
    loading,
    error,
    isChapterCompleted,
    isChapterLocked,
    updateChapterProgress,
    updateTestScore,
    getCompletionPercentage,
    getAllChaptersWithStatus,
  };
}
