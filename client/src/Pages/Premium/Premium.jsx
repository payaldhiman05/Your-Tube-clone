import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { login } from "../../action/auth";
import "./Premium.css";

const getUserData = async (userId) => {
  try {
    const res = await axios.get(`http://localhost:5000/user/${userId}`);
    return res.data.result;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

const Premium = () => {
  const navigate = useNavigate();
  const currentuser = useSelector((state) => state.currentuserreducer);
  const dispatch = useDispatch();

  const handlePremiumPurchase = async () => {
    try {
      const res = await axios.post("http://localhost:5000/payment/create-order", {
        amount: 599,
      });

      const { id: order_id, currency, amount } = res.data;

      const options = {
        key: "rzp_test_6Kgn9sV2TGgpyh",
        amount: amount,
        currency: currency,
        name: "YourTube Premium",
        description: "Premium Membership",
        order_id: order_id,

        handler: async function (response) {
          try {
            await axios.post("http://localhost:5000/payment/verify", {
              response,
              userId: currentuser?.result._id,
            });

            const updatedUser = await getUserData(currentuser?.result._id);
            if (updatedUser) {
              dispatch(login({ result: updatedUser }));
              localStorage.setItem("Profile", JSON.stringify({ result: updatedUser }));
            }

            alert("Premium activated successfully!");

            const lastVideoId = localStorage.getItem("lastWatchedVideoId");
            const targetUrl = `/videopage/${lastVideoId || ""}`;
            navigate(targetUrl, { replace: true });

          } catch (err) {
            console.error("Verification failed", err?.response?.data || err.message);
            alert("Something went wrong during payment verification.");
          }
        },

        prefill: {
          name: currentuser?.result?.name || "YourTube User",
          email: currentuser?.result?.email || "user@example.com",
        },

        theme: { color: "#0f62fe" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Payment Initialization Failed:", error?.response?.data || error.message);
      alert("Something went wrong while initiating payment.");
    }
  };

  return (
    <div className="premium-container">
      <h2>Upgrade to <span className="highlight">Premium</span></h2>
      <ul className="premium-benefits">
        <li>Unlimited Video Downloads</li>
        <li>Ad-Free Experience</li>
        <li>Earn Double Reward Points</li>
      </ul>
      {currentuser?.result?.ispremium ? (
        <span className="premium-badge">You are a Premium Member</span>
      ) : (
        <button onClick={handlePremiumPurchase} className="premium-btn">
          Buy Premium - ₹599
        </button>
      )}
    </div>
  );
};

export default Premium;
