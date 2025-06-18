import express from 'express';
import Razorpay from 'razorpay';
import { verifyPayment } from '../Controllers/paymentController.js';

const router = express.Router();

const razorpay = new Razorpay({
    key_id: 'rzp_test_6Kgn9sV2TGgpyh',
    key_secret: 'XgkayeSHWN4Oed6aGJIj4T51'
});

router.post('/create-order', async (req, res) => {
    try{
    const { amount } = req.body;
    const options = {
        amount: amount * 100, 
        currency: 'INR',
        receipt: `receipt_order_${Math.floor(Math.random() * 1000000)}`,
    };
        const order = await razorpay.orders.create(options);
        console.log("Razorpay Order Created:", order);
        res.status(200).json(order);
    } catch (err) {
        console.error("Create Order Error:",err);
        res.status(500).json({ error: "Failed to create Razorpay order" });
    }
});
router.post('/verify',verifyPayment);

export default router;
