import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyBAkYTM4BvLNgIWwlRB2t9NBakU2jkqPto",
  authDomain: "smart-agriculture-system-9b29a.firebaseapp.com",
  projectId: "smart-agriculture-system-9b29a",
  storageBucket: "smart-agriculture-system-9b29a.firebasestorage.app",
  messagingSenderId: "307178711489",
  appId: "1:307178711489:web:55de29d4edd63c69bda740",
  measurementId: "G-KWT213W5RB"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);