import express from "express";
import {
  addToCart,
  addVoucher,
  checkVoucher,
  clearUserCart,
  completeSale,
  createFeedback,
  createOrder,
  createProduct,
  deleteProduct,
  getAllProducts,
  getMyOrders,
  getMyProducts,
  getMySales,
  getProductById,
  getProductFeedbacks,
  getUserCart,
  removeFromCart,
  updateOrder,
} from "../controllers/productController.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.post("/create/:token", authenticate, createProduct);
router.post("/createFeedback/:token", authenticate, createFeedback);
router.get("/getMyProducts/:token", authenticate, getMyProducts);
router.post("/getProductFeedbacks/:token", authenticate, getProductFeedbacks);
router.delete("/:id/delete/:token", authenticate, deleteProduct);
router.get("/allProducts", getAllProducts);
router.get("/productById/:id", getProductById);
router.post("/addVoucher/:token", authenticate, addVoucher);
router.post("/checkVoucher/:token", authenticate, checkVoucher);
router.post("/addToCart/:token", authenticate, addToCart);
router.get("/getUserCart/:token", authenticate, getUserCart);
router.post("/createOrder/:token", authenticate, createOrder);
router.get("/getMyOrders/:token", authenticate, getMyOrders);
router.get("/getMySales/:token", authenticate, getMySales);
router.post("/completeSale/:token", authenticate, completeSale);
router.put("/updateOrder/:token", authenticate, updateOrder);
router.delete("/removeFromCart/:index/:token", authenticate, removeFromCart);
router.get("/clearUserCart/:token", authenticate, clearUserCart);

export default router;
