// src/utils/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAgMrb5zryxcOc6lT0z5zhiHcO75Cf_fSg",
  authDomain: "tjournaldatabase.firebaseapp.com",
  projectId: "tjournaldatabase",
  storageBucket: "tjournaldatabase.firebasestorage.app",
  messagingSenderId: "199068782878",
  appId: "1:199068782878:web:8afe0c89eb150b8d89390f",
  measurementId: "G-22J6WJ6MGS"
};
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export { signInWithEmailAndPassword };