import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
	apiKey: "AIzaSyBA_t9Fq5TjYLer-x5FqyI4wOj7-X8mqNo",
	authDomain: "hackatona-b6a32.firebaseapp.com",
	projectId: "hackatona-b6a32",
	storageBucket: "hackatona-b6a32.firebasestorage.app",
	messagingSenderId: "799727187554",
	appId: "1:799727187554:web:316538eb039859b15dc33b",
	measurementId: "G-MWJCE9Z2R6",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
