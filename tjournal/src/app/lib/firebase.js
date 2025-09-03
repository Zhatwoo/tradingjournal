// src/app/lib/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔑 Ilagay mo dito yung Firebase config mo
const firebaseConfig = {
  apiKey: "AIzaSyDUx7_pant_Ddg_aLZrfLsO1QyHOrKCitI",
  authDomain: "tjornals.firebaseapp.com",
  projectId: "tjornals",
  storageBucket: "tjornals.firebasestorage.app",
  messagingSenderId: "948585439206",
  appId: "1:948585439206:web:5fd668930ae4740ac0c027",
  measurementId: "G-BK5N99RXZY"
};

// Init Firebase app
const app = initializeApp(firebaseConfig);

// ✅ Proper exports (para gumana sa dashboard)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
