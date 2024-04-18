import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/product.js";
import { setAdmin, setDefaultServices } from "./middlewares/utils.js";

dotenv.config();

const app = express();

app.use(bodyParser.json({ limit: "50mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use("/auth", cors(), authRoutes);
app.use("/product", cors(), productRoutes);

app.get("/", (req, res) => {
  return res.json({ message: "Welcome to Enhancing Customer Engagements API...." });
});

const PORT = 7000;

mongoose
  .connect(process.env.MONGO_URL)
  .then(console.log("Connection with database Successfull"))
  .catch((error) => {
    console.log(error.message);
  });

const runAllFuns = async () => {
  await setAdmin();
  await setDefaultServices()
};

runAllFuns();

app.listen(PORT, () => {
  console.log(`server running at PORT ${PORT}`);
});
