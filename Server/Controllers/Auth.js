import users from "../Models/Auth.js";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  const { email } = req.body;
 console.log("Login attempt with email:",email);
 
  try {
    const existingUser = await users.findOne({ email });

    if (!existingUser) {
      const newUser = await users.create({ email });

      const token = jwt.sign(
        { email: newUser.email, id: newUser._id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.status(200).json({
        result: newUser,
        token,
        isPremium: newUser.isPremium 
      });
    } else {
      const token = jwt.sign(
        { email: existingUser.email, id: existingUser._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        result: existingUser,
        token,
        isPremium: existingUser.isPremium
      });
    }
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Something went wrong...", error: error.message });
  }
};
