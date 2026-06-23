import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  updatePassword as firebaseUpdatePassword,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? null);
    });
    return unsubscribe;
  }, []);

  const signUp = async (email, password) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Send Firebase verification email automatically
    await sendEmailVerification(result.user);
    return result;
  };

  const signIn = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const signOut = () => firebaseSignOut(auth);

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  const updatePassword = (newPassword) =>
    firebaseUpdatePassword(auth.currentUser, newPassword);

  const resendVerification = () =>
    sendEmailVerification(auth.currentUser);

  // session kept for backward compat with ProtectedRoute
  const session = user ? { user } : user === null ? null : undefined;

  return (
    <AuthContext.Provider value={{ user, session, signUp, signIn, signOut, resetPassword, updatePassword, resendVerification }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
