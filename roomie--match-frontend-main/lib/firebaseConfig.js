// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyB0tW9q1mOLcG6T38esce4Dn-SxStSQV8s",
  authDomain: "roomie-match-01.firebaseapp.com",
  projectId: "roomie-match-01",
  storageBucket: "roomie-match-01.firebasestorage.app",
  messagingSenderId: "926512031667",
  appId: "1:926512031667:web:d7bd0e1a3025ce9eb7cdc6",
  measurementId: "G-4K5Z9CJWBE",
  databaseURL: "https://roomie-match-01.firebaseio.com" // Added databaseURL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app, firebaseConfig };