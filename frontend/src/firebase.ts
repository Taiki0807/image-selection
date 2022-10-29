import firebase from "firebase/compat/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDfFfrYUz6i-Xfy3imO2CTWp5SFeA-yP_k",
    authDomain: "image-707ea.firebaseapp.com",
    projectId: "image-707ea",
    storageBucket: "image-707ea.appspot.com",
    messagingSenderId: "377889197876",
    appId: "1:377889197876:web:ad60470c58c98aafee5f61",
};

export const app = firebase.initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore();
