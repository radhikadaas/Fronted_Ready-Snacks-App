require("dotenv").config();

const express = require("express");
const cors = require("cors");

const paymentRoutes = require("./routes/payment");

const app = express();

/**
 * ❗ IMPORTANT
 * Normal JSON for APIs
 */
app.use(cors());
app.use(express.json());

/**
 * ❗ RAW BODY ONLY FOR RAZORPAY WEBHOOK
 * Must be before routes
 */
app.use(
  "/api/payment/webhook",
  express.raw({ type: "application/json" })
);

/**
 * Routes
 */
app.use("/api/payment", paymentRoutes);

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.send("Snacks Backend Running 🚀");
});

/**
 * Start server
 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});


// import express from "express";
// import cors from "cors";
// import Razorpay from "razorpay";
// import crypto from "crypto";
// import dotenv from "dotenv";

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// /* Razorpay Instance */
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// /* ===============================
//    1️⃣ CREATE ORDER API
// ================================ */
// app.post("/create-order", async (req, res) => {
//   try {
//     const { amount, currency = "INR" } = req.body;

//     const options = {
//       amount: amount * 100, // Razorpay expects paise
//       currency,
//       receipt: "receipt_" + Date.now(),
//     };

//     const order = await razorpay.orders.create(options);

//     res.json({
//       success: true,
//       order,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// /* ===============================
//    2️⃣ VERIFY PAYMENT API
// ================================ */
// app.post("/verify-payment", (req, res) => {
//   const {
//     razorpay_order_id,
//     razorpay_payment_id,
//     razorpay_signature,
//   } = req.body;

//   const body = razorpay_order_id + "|" + razorpay_payment_id;

//   const expectedSignature = crypto
//     .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//     .update(body.toString())
//     .digest("hex");

//   if (expectedSignature === razorpay_signature) {
//     res.json({ success: true });
//   } else {
//     res.status(400).json({ success: false });
//   }
// });

// /* ===============================
//    SERVER START
// ================================ */
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Backend running on http://localhost:${PORT}`);
// });
