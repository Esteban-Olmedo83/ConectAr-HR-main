
// Importa las funciones que necesitas de los SDKs que necesitas
import { initializeApp, getApps } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";

// TODO: Agrega aquí la configuración de tu producto de Firebase (base de datos, etc.)

// La configuración de tu aplicación web de Firebase
// Para más información sobre este objeto, visita: https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Inicializa Firebase
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

// Opcional: inicializa otros servicios de Firebase que necesites aquí
// const analytics = getAnalytics(app);

export const firebaseApp = app;
