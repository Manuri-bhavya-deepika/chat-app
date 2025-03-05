//used firebase



import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDEoc0o3NZcKF77iN-6S3QB3SKLmIfFcfc",
  authDomain: "AIzaSyDEoc0o3NZcKF77iN-6S3QB3SKLmIfFcfc",
  databaseURL: "https://collab-d0353-default-rtdb.firebaseio.com",
  projectId: "collab-d0353",
  storageBucket: "collab-d0353.firebasestorage.app",
  messagingSenderId: "217438984607",
  appId: "1:217438984607:web:f48f99d877efd7651345aa",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
export { database };
