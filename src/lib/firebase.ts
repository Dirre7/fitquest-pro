import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  OAuthProvider,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  deleteUser,
  updateProfile,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc,
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import config from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
};

import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { Capacitor } from '@capacitor/core';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Optional Firebase App Check (Activates automatically once recaptchaSiteKey is provided in config)
if (typeof window !== 'undefined' && config.recaptchaSiteKey && config.recaptchaSiteKey.trim().length > 0) {
  try {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // @ts-ignore
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(config.recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (err) {
    console.warn('App Check initialization notice:', err);
  }
}

// In Capacitor native environments (Android/iOS), explicitly initialize Auth with indexedDB + browserLocalPersistence
// so that Firebase does not try to load cross-origin auth iframes (/__/auth/iframe) which deadlock inside native WebViews.
import { initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, Auth } from 'firebase/auth';

let authInstance: Auth;
try {
  if (Capacitor.isNativePlatform()) {
    authInstance = initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    });
  } else {
    authInstance = getAuth(app);
  }
} catch (e) {
  authInstance = getAuth(app);
}

export const auth = authInstance;
export const db = config.firestoreDatabaseId 
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateProfile,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp
};

export type { User };
