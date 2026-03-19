// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAFfb4TC_qCln52PqlAwKshpWmlKXwu9DY",
  authDomain: "ff-profit-app.firebaseapp.com",
  projectId: "ff-profit-app",
  storageBucket: "ff-profit-app.firebasestorage.app",
  messagingSenderId: "1032046544778",
  appId: "1:1032046544778:web:9b29a773429cbfbae0aa73",
  measurementId: "G-XEQHKEQJ3C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
