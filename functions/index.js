
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

const app = express();

app.use(cors({ origin: true }));


// Expose Express API as a single Cloud Function
exports.payment = functions.https.onRequest(app);
