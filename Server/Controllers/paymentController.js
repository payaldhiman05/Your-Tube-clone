import crypto from 'crypto';
import User from '../Models/Auth.js';
import Payment from '../Models/payment.js'; 
const verifyPayment = async (req, res) => {
  try {
    const { response, userId } = req.body;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
     
      await User.findByIdAndUpdate(userId, { ispremium: true });

      await Payment.create({
        userId,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        status: "Success"
      });

      return res.status(200).json({ message: "Payment verified and stored successfully" });
    } else {
      return res.status(400).json({ message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({ message: "Server error during verification" });
  }
};

export { verifyPayment };
