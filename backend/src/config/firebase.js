const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getStorage } = require('firebase-admin/storage');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, 'firebaseServiceAccount.json');
let adminAuth = null;
let adminStorage = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    const app = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'learningieltsweb.appspot.com'
    });
    adminAuth = getAuth(app);
    adminStorage = getStorage(app);
    console.log('🔥 Firebase Admin initialized successfully from ENVIRONMENT VARIABLE.');
  } catch (error) {
    console.error('⚠️ Failed to parse FIREBASE_SERVICE_ACCOUNT env variable:', error);
  }
} else if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require('./firebaseServiceAccount.json');
  const app = initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'learningieltsweb.appspot.com'
  });
  adminAuth = getAuth(app);
  adminStorage = getStorage(app);
  console.log('🔥 Firebase Admin initialized successfully from FILE.');
} else {
  console.warn('⚠️ WARNING: FIREBASE_SERVICE_ACCOUNT env var or firebaseServiceAccount.json not found. Firebase Auth will fail.');
}

module.exports = { adminAuth, adminStorage };
