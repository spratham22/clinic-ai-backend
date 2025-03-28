const express = require("express");
const axios = require("axios");
const admin = require("firebase-admin");
require("dotenv").config();

const app = express();
app.use(express.json());

// Initialize Firebase
const serviceAccount = require("./firebase_credentials.json"); // Upload this file in Replit
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// WhatsApp Webhook - Receives messages
app.post("/webhook", async (req, res) => {
  const { phone, text } = req.body;

  console.log(`📩 Received message from ${phone}: ${text}`);

  // Store message in Firebase Firestore
  await db.collection("messages").add({
    phone: phone,
    text: text,
    timestamp: new Date(),
  });

  // Reply message (we'll add AI later)
  const responseMessage = `Hello! You said: ${text}`;
  res.json({ reply: responseMessage });
});

// Test Route - Check if server is running
app.get("/", (req, res) => {
  res.send("✅ Clinic AI Backend is running!");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
