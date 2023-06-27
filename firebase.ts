import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD3wmdxAeLY8wz6sSMxXA3aWcC7PcJwfKI",
  authDomain: "english-learning-line-app.firebaseapp.com",
  projectId: "english-learning-line-app",
  storageBucket: "english-learning-line-app.appspot.com",
  messagingSenderId: "220647042457",
  appId: "1:220647042457:web:90916d8ca2fdff96427708",
  measurementId: "G-EJKZZERJJ3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
