import "dotenv/config";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);

// Firebase Authentication
const auth = getAuth(app);

// Kết nối Firestore
// const db = getFirestore(app);

// // Demo add document
// // await addDoc(collection(db, "users"), {
// //     name: "Hai Truong",
// //     email: "haitruong@gmail.com",
// //     password: "conga1234",
// //     createdAt: serverTimestamp(),
// // });

// Đăng nhập user có sẵn
async function login() {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, "test@gmail.com", "123456");
    console.log("User signed in:", userCredential.user.email);
  } catch (error) {
    console.error("Error logging in:", error.message);
  }
}

await login();

// Log test
// console.log("Firebase App initialized successfully!");
// console.log("Firestore instance:", db._databaseId?.projectId || "No project found");
