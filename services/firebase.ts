
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, limit } from "firebase/firestore";
import { MOCK_PROPERTIES, MOCK_INQUIRIES, MOCK_AGENTS } from "../constants";

// These values are typically provided via environment variables.
// If not present, Firestore will attempt to use a demo project or error gracefully.
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "demo-key",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "demo-project",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "12345",
    appId: process.env.FIREBASE_APP_ID || "1:12345:web:abcde"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * Seeds the database with mock data if it's empty.
 */
export const seedDatabaseIfEmpty = async () => {
    const propsQuery = query(collection(db, "properties"), limit(1));
    const snapshot = await getDocs(propsQuery);

    if (snapshot.empty) {
        console.log("Seeding Firestore with initial mock data...");

        // Seed Properties
        for (const prop of MOCK_PROPERTIES) {
            await addDoc(collection(db, "properties"), prop);
        }

        // Seed Inquiries
        for (const inq of MOCK_INQUIRIES) {
            await addDoc(collection(db, "inquiries"), inq);
        }

        // Seed Agents
        for (const agent of MOCK_AGENTS) {
            await addDoc(collection(db, "agents"), agent);
        }

        console.log("Seeding complete.");
    }
};
