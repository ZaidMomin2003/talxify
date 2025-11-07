
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

const app = express();

// Configure CORS to allow requests only from your app's domain
const allowedOrigins = [
    'https://talxify-ijwhm.web.app', 
    'https://talxify-ijwhm.firebaseapp.com'
];
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));


// Get Razorpay credentials from environment variables
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

if (!razorpayKeyId || !razorpayKeySecret) {
    console.error("Razorpay Key ID or Key Secret is not configured in environment variables.");
}

const razorpayInstance = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});


// Endpoint to create a Razorpay order
app.post("/create-order", async (req, res) => {
  const {amount, currency, plan, uid} = req.body;

  if (!amount || !currency || !plan || !uid) {
    return res.status(400).send({error: "Missing required fields."});
  }

  try {
    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency: currency,
      receipt: `receipt_order_${new Date().getTime()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    // Save order details to Firestore
    await db.collection("orders").doc(order.id).set({
      uid: uid,
      plan: plan,
      amount: amount,
      currency: currency,
      status: "created",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).send(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).send({error: "Failed to create order."});
  }
});

// Endpoint to verify payment
app.post("/verify-payment", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    uid,
    plan,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !uid || !plan) {
    return res.status(400).send({error: "Missing required fields for verification."});
  }

  try {
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", razorpayKeySecret)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.warn("Invalid signature received.", {orderId: razorpay_order_id});
      return res.status(400).send({error: "Invalid payment signature."});
    }

    const orderRef = db.collection("orders").doc(razorpay_order_id);
    const userRef = db.collection("users").doc(uid);

    const planDetails = {
      "pro-1m": {interviews: 10, durationMonths: 1},
      "pro-2m": {interviews: 25, durationMonths: 2},
      "pro-3m": {interviews: 40, durationMonths: 3},
    };

    const selectedPlanDetails = planDetails[plan];
    if (!selectedPlanDetails) {
      throw new Error(`Invalid plan ID: ${plan}`);
    }

    const currentDate = new Date();
    const endDate = new Date(currentDate);
    endDate.setMonth(currentDate.getMonth() + selectedPlanDetails.durationMonths);

    await db.runTransaction(async (transaction) => {
      transaction.update(orderRef, {
        status: "paid",
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      transaction.set(userRef, {
        subscription: {
          plan: plan,
          status: "active",
          startDate: currentDate.toISOString(),
          endDate: endDate.toISOString(),
          interviewUsage: {
            limit: selectedPlanDetails.interviews,
            count: 0,
          },
          resumeExports: {
            date: currentDate.toISOString().slice(0, 7),
            count: 0,
          },
        },
      }, {merge: true});
    });

    res.status(200).send({success: true, message: "Payment verified and plan activated."});
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).send({error: "Payment verification failed."});
  }
});


// Expose Express API as a single Cloud Function
exports.payment = functions.https.onRequest(app);
