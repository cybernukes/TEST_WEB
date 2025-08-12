import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBalAtKBKeMPe0DF0Lr9X49z6UtnO0ksbU",
  authDomain: "arham-it-solution.firebaseapp.com",
  projectId: "arham-it-solution",
  storageBucket: "arham-it-solution.appspot.com",
  messagingSenderId: "492686671591",
  appId: "1:492686671591:web:8376b79185e260571dec42",
  measurementId: "G-7334V3S758",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export {
  db,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  auth,
  signInWithEmailAndPassword,
  signOut,
};
