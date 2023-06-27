import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCuy0iY7pkTSOMOTE-HG91MTbRmAIRg6j8",
  authDomain: "answer-vg-line.firebaseapp.com",
  projectId: "answer-vg-line",
  storageBucket: "answer-vg-line.appspot.com",
  messagingSenderId: "946235955401",
  appId: "1:946235955401:web:e8b7baaece945825db5518",
  measurementId: "G-9JE4CB10PF"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
