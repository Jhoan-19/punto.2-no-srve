import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAmFNYqR-7fWVSTnkw9Ecrd1KLrvTHmBQU",
  authDomain: "pokeapi2-5c488.firebaseapp.com",
  projectId: "pokeapi2-5c488",
  storageBucket: "pokeapi2-5c488.appspot.com",
  messagingSenderId: "600055208542",
  appId: "1:600055208542:web:2a9ecf4a41aa8da4f6b2cf",
  measurementId: "G-ZC9Q277ZVH"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };