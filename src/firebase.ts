
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJARbQHXV9eGtl1ftJkeoEk-t04ZNGmK4",
  authDomain: "moyo-63267.firebaseapp.com",
  projectId: "moyo-63267",
  storageBucket: "moyo-63267.firebasestorage.app",
  messagingSenderId: "475390838922",
  appId: "1:475390838922:web:90b4044ecd8124c15bc573"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
