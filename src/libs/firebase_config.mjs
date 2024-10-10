// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB3gnDogubz8PUjmYyhQMTJ3V8bCmBp2mk",
    authDomain: "pitia-11c72.firebaseapp.com",
    projectId: "pitia-11c72",
    storageBucket: "pitia-11c72.appspot.com",
    messagingSenderId: "109156481662",
    appId: "1:109156481662:web:d2822c6e7b5cbb11e0362f",
    measurementId: "G-GN5M73D9YE"
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = getMessaging(app);

export { app, storage, db, auth, messaging };