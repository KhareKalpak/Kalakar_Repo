// =====================================================
// FIREBASE CONFIGURATION
// Replace these values with your Firebase project config
// =====================================================

// Initialize Firebase
const firebaseConfig = {
<<<<<<< HEAD
  apiKey: "AIzaSyBZm-AIwz9hDKN9nFV4i8R-bhlzD0y-8gw",
  authDomain: "kalakar-10641.firebaseapp.com",
  projectId: "kalakar-10641",
  storageBucket: "kalakar-10641.firebasestorage.app",
  messagingSenderId: "834318488897",
  appId: "1:834318488897:web:b01767a7aa2ef95f0e3dc0",
  measurementId: "G-N8R5QY7G4J"
=======
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
>>>>>>> ce1de83 (Auto-commit: Agent tool execution)
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get references to Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Export for use in other files
console.log("Firebase initialized successfully!");
