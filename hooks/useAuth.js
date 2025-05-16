import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { initializeFirebase, initializeUserData } from '../lib/firebase';

/**
 * Custom hook for handling authentication state and operations
 * @returns {Object} Auth state and methods
 */
export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize Firebase if not already initialized
    const { auth } = initializeFirebase();
    
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      (authUser) => {
        setUser(authUser);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setError(error.message);
        setLoading(false);
      }
    );
    
    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      await signOut(auth);
      // Auth state change will update the user state
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initialize a new user's data in the database after registration
   * @param {string} userId - The user's ID
   * @param {Object} userData - Basic user data
   * @returns {Promise<void>}
   */
  const setupNewUser = async (userId, userData) => {
    try {
      setLoading(true);
      await initializeUserData(userId, userData);
    } catch (error) {
      console.error('User setup error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    logout,
    setupNewUser,
  };
}
