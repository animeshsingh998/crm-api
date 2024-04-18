import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
  try {
    const token = req.params.token;
    if (!token || token === "j:null") {
      return res.status(401).json("Please Login First");
    }

    const data = await jwt.verify(token, process.env.JWT_KEY);
    const user = await User.findOne({ _id: data._id });
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json("Server Error...");
  }
};
