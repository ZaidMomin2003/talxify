

// This configuration is used by the Firebase Admin SDK on the server-side.
// It is not exposed to the client.

// IMPORTANT: You must generate a new private key file in your
// Firebase Project settings > Service accounts.
//
// Then, you need to set the following environment variables:
// - FIREBASE_PROJECT_ID
// - FIREBASE_CLIENT_EMAIL
// - FIREBASE_PRIVATE_KEY
//
// The private key must be a single-line string. You can format it by
// replacing all newline characters with \\n.
// For example: "-----BEGIN PRIVATE KEY-----\\nYOUR_KEY_HERE\\n-----END PRIVATE KEY-----\\n"

export const adminConfig = {
  credential: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },
};
