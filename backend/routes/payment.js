const express = require("express");
const crypto = require("crypto");
const razorpay = require("../services/razorpay");
const { createClient } = require("@supabase/supabase-js");

const router = express.Router();

/**
 * Supabase Admin Client (SERVICE ROLE KEY)
 */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * ======================================
 * 1️⃣ CREATE RAZORPAY ORDER
 * ======================================
 */
router.post("/create-order", async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // INR → paise
      currency: "INR",
      receipt: orderId, // VERY IMPORTANT (used later in webhook)
      notes: {
        receipt: orderId,
      },
    });

    res.json(razorpayOrder);
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
});

/**
 * ======================================
 * 2️⃣ RAZORPAY WEBHOOK (SOURCE OF TRUTH)
 * ======================================
 */
router.post("/webhook", async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const signature = req.headers["x-razorpay-signature"];

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(req.body)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(400).send("Invalid signature");
  }

  const event = JSON.parse(req.body.toString());

  /**
   * PAYMENT SUCCESS
   */
  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;

    const orderId = payment.notes.receipt;

    await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        payment_provider: "razorpay",
        payment_provider_id: payment.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);
  }

  res.json({ status: "ok" });
});

module.exports = router;
