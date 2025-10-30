// =====================================================
// FIREBASE CONFIGURATION
// Replace these values with your Firebase project config
// =====================================================

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBZm-AIwz9hDKN9nFV4i8R-bhlzD0y-8gw",
  authDomain: "kalakar-10641.firebaseapp.com",
  projectId: "kalakar-10641",
  storageBucket: "kalakar-10641.firebasestorage.app",
  messagingSenderId: "834318488897",
  appId: "1:834318488897:web:b01767a7aa2ef95f0e3dc0",
  measurementId: "G-N8R5QY7G4J"
};

// Declare global variables for Firebase services
var auth;
var db;

// Wait for Firebase SDK to load, then initialize
function initializeFirebase() {
  if (typeof firebase !== 'undefined') {
    try {
      // Firebase is loaded, initialize it
      firebase.initializeApp(firebaseConfig);

      // Get references to Firebase services
      auth = firebase.auth();
      db = firebase.firestore();

      console.log("Firebase initialized successfully!");
      console.log("auth:", typeof auth);
      console.log("db:", typeof db);
    } catch (error) {
      console.error("Error initializing Firebase:", error);
    }
  } else {
    // Firebase not ready yet, try again in 100ms
    setTimeout(initializeFirebase, 100);
  }
}

// Start initialization
initializeFirebase();
