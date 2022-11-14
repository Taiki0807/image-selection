import firebase from "firebase/compat/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAS8lqTPsqxrmd9MqwDTsdybceRZ7yLbrM",
    authDomain: "ace-cycling-356912.firebaseapp.com",
    projectId: "ace-cycling-356912",
    storageBucket: "ace-cycling-356912.appspot.com",
    messagingSenderId: "513097422170",
    appId: "1:513097422170:web:0872ce61c27646a9e10f63",
};

export const app = firebase.initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore();
