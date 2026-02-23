// hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, logoutUser, registerWithEmail, signInUser } from '../lib/firebase';
import apiClient from '../lib/api'; // Import the API client correctly

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        
        // Fetch user data from Firestore
        try {
          const userDocRef = doc(db, 'roomie-users', authUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            // If user doc doesn't exist yet (first login), create it with basic info
            const basicUserData = {
              name: authUser.displayName || '',
              email: authUser.email,
              photoURL: authUser.photoURL || '',
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            await setDoc(userDocRef, basicUserData);
            setUserData(basicUserData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setError("Failed to fetch user data");
        }
      } else {
        // User is signed out
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign in function
  const signin = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInUser(email, password);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signup = async (email, password, userData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await registerWithEmail(email, password, userData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await logoutUser();
      // Auth state listener will handle setting user to null
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error("Error signing out:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile data
  const updateProfile = async (newData) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const userRef = doc(db, 'roomie-users', user.uid);
      await setDoc(userRef, {
        ...newData,
        updatedAt: new Date()
      }, { merge: true });
      
      // Update local state
      setUserData(prevData => ({
        ...prevData,
        ...newData,
        updatedAt: new Date()
      }));
      
      return true;
    } catch (err) {
      setError(err.message);
      console.error("Error updating profile:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    userData,
    loading,
    error,
    signin,
    signup,
    signOut,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
