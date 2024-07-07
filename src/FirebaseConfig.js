import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCTPiiTpV3Fd6Oktr1k4Pfhj9T-jU11Y6k",
  authDomain: "wairehouse-4a655.firebaseapp.com",
  projectId: "wairehouse-4a655",
  storageBucket: "wairehouse-4a655.appspot.com",
  messagingSenderId: "35913707408",
  appId: "1:35913707408:web:5463473d2a661e2841cd15",
  measurementId: "G-L0ER909NNT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };