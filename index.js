const express = require("express");
const axios = require("axios");
const admin = require("firebase-admin");
require("dotenv").config();

const app = express();
app.use(express.json());

// ✅ Initialize Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// ✅ WhatsApp Webhook - Receives messages
app.post("/webhook", async (req, res) => {
  const { phone, text } = req.body;

  console.log(`📩 Received message from ${phone}: ${text}`);

  // Store message in Firebase Firestore
  await db.collection("messages").add({
    phone: phone,
    text: text,
    timestamp: new Date(),
  });

  // Reply message
  const responseMessage = `Hello! You said: ${text}`;
  res.json({ reply: responseMessage });
});

// ✅ WhatsApp Send Message API
app.get("/send-message", async (req, res) => {
  const { to, message } = req.query;

  if (!to || !message) {
    return res
      .status(400)
      .json({ error: "Missing 'to' or 'message' parameter" });
  }

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("📨 Message sent successfully:", response.data);
    res.json({ success: true, response: response.data });
  } catch (error) {
    console.error(
      "❌ Error sending message:",
      error.response?.data || error.message,
    );
    res.status(500).json({ error: "Failed to send message" });
  }
});

// ✅ Test Route - Check if server is running
app.get("/", (req, res) => {
  res.send("✅ Clinic AI Backend is running!");
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
