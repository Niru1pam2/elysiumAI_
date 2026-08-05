import { PLANS } from "../config/Plans.js";
import razorpay from "../config/razorpay.js";
import Payment from "../models/payment.model.js";
import crypto from "crypto";
import axios from "axios";

export const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    console.log("Received plan:", plan);
    const userId = req.headers["x-user-id"];

    const selectedPlan = PLANS[plan];

    if (!selectedPlan) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const order = await razorpay.orders.create({
      amount: selectedPlan.amount * 100, // Amount in paise
      currency: "INR",
      receipt: `rcpt_${userId.toString().slice(-6)}_${Date.now()}`,
    });

    await Payment.create({
      userId,
      orderId: order.id,
      amount: selectedPlan.amount,
      credits: selectedPlan.credits,
      plan: selectedPlan.id,
      currency: order.currency,
      status: "created",
    });

    return res.status(201).json({ order, plan: selectedPlan });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating order" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    console.log("Received payment verification data:", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    const generateSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generateSignature === razorpay_signature) {
      const payment = await Payment.findOne({ orderId: razorpay_order_id });
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      payment.paymentId = razorpay_payment_id;
      payment.status = "paid";
      await payment.save();

      await axios.post(
        `${process.env.AUTH_SERVICE_URL}/update-plan`,
        {
          plan: payment.plan,
          credits: payment.credits,
          userId: payment.userId,
        },
        {
          headers: {
            cookie: req.headers.cookie, // Forward the cookies from the request
          },
        },
      );

      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Error verifying payment" });
  }
};
