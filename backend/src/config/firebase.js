const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, 'firebaseServiceAccount.json');
let adminAuth = null;

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require('./firebaseServiceAccount.json');
  const app = initializeApp({
    credential: cert(serviceAccount)
  });
  adminAuth = getAuth(app);
  console.log('🔥 Firebase Admin initialized successfully.');
} else {
  console.warn('⚠️ WARNING: firebaseServiceAccount.json not found in src/config/. Firebase Auth will fail.');
}

module.exports = adminAuth;
