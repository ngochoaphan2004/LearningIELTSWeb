import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// TODO: Replace this with actual Config from your Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBuQ3Dh9gEk3VvzgGGJCM_phW5kXzZtJdM",
  authDomain: "learningieltsweb.firebaseapp.com",
  projectId: "learningieltsweb",
  storageBucket: "learningieltsweb.firebasestorage.app",
  messagingSenderId: "980954735221",
  appId: "1:980954735221:web:db9575ff1fb6b1264b0e3c",
  measurementId: "G-DKGV6TW95B"
};

let app;
let auth;
let googleProvider;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
} catch (error) {
  console.error("⚠️ Firebase khởi tạo thất bại. Vui lòng cập nhật firebaseConfig.", error);
}

export { auth, googleProvider, firebaseConfig };
