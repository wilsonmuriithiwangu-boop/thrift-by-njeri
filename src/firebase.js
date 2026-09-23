import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBMlnn5J_O1FuQYNn8V8JpQjLNO5liVy1I",
  authDomain: "thrift-by-njeri.firebaseapp.com",
  projectId: "thrift-by-njeri",
  storageBucket: "thrift-by-njeri.firebasestorage.app",
  messagingSenderId: "982454323184",
  appId: "1:982454323184:web:286d288944ce2c39057f35",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);