import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCF7W6W8LbpsISWEErNtU1VahTdrv5X4nM",
    authDomain: "schedulemanager-1fe50.firebaseapp.com",
    projectId: "schedulemanager-1fe50",
    storageBucket: "schedulemanager-1fe50.firebasestorage.app",
    messagingSenderId: "149071390344",
    appId: "1:149071390344:web:6b406c44e4d0a29f46613d",
    measurementId: "G-9NB3HRZMBN"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const userDocRef = doc(db, 'users', 'guest_user');