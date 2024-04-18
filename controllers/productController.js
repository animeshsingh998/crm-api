import Product from "../models/Product.js";
import User from "../models/User.js";
import Voucher from "../models/Voucher.js";
import { validIdParams } from "../middlewares/utils.js";
import Order from "../models/Order.js";
import Feedback from "../models/Feedback.js";

export const createProduct = async (req, res) => {
  const user = await User.findById(req.user._id);
  const userId = user._id;
  const { description, name, category, price } = req.body;
  try {
    const ProductData = {
      soldBy: userId,
      description,
      name,
      category,
      price,
    };
    const product = await Product.create(ProductData);
    user.products.push(product._id);
    await user.save();

    return res.status(201).json({ message: "Product Added." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export const createFeedback = async (req, res) => {
  const { feedback, rating, experience, productId } = req.body;
  const user = await User.findById(req.user._id);
  const userId = user._id;
  try {
    const feedbackData = {
      userId,
      productId,
      feedback,
      rating,
      experience,
    };
    const createdFeedback = await Feedback.create(feedbackData);
    await createdFeedback.save();

    return res.status(201).json({ message: "Feedback Added." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req, res) => {
  const valid = validIdParams(req.params.id);
  if (!valid) {
    return res.status(404).json({ error: "Product not found." });
  }
  try {
    const product = await Product.findOne({ _id: req.params.id }).populate(
      "soldBy"
    );
    if (product) {
      return res.status(200).json(product);
    } else {
      return res.status(404).json({ error: "Product not found." });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getMyProducts = async (req, res) => {
  try {
    const admin = await User.findOne({ email: "admin@crm.com" }).populate("products");
    let products = admin.products;
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export const getProductFeedbacks = async (req, res) => {
  try {
    const { productId } = req.body;
    const feedbacks = await Feedback.find({productId}).populate("userId");
    return res.status(200).json(feedbacks);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  const ownerId = product.soldBy;
  const owner = await User.findById(ownerId);
  if (product.soldBy.toString() !== req.user._id.toString()) {
    return res.status(401).json({ error: "Unauthorized User." });
  }
  var newProducts = [];
  try {
    owner.products.forEach((prod) => {
      if (prod.toString() !== product._id.toString()) {
        newProducts.push(product);
      }
    });
    console.log(newProducts)
    owner.products = newProducts;
    await owner.save();
    await product.deleteOne();
    return res.status(200).json({ message: "Product deleted." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//CART

export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const user = await User.findById(req.user._id);
    const cartItem = { product: productId, quantity };
    user.cart.push(cartItem);
    await user.save();
    return res.status(200).json({ message: "Product added to cart!" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  const { index } = req.params;
  try {
    const user = await User.findById(req.user._id);
    const newCart = user.cart.filter((item) => {
      //   console.log(item.product.toString() !== index.toString())
      return item.product.toString() !== index.toString();
    });
    user.cart = newCart;
    await user.save();
    return res.status(200).json({ message: "Product removed from cart!" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const clearUserCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();
    return res.status(200).json({ message: "Cart Cleared!" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getUserCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    var newCart = [];
    let idx = 0;
    user.cart.forEach(async (item, id) => {
      const x = await Product.findById(item.product);
      newCart.push({ ...x, quantity: item.quantity });
      idx = idx + 1;
      if (idx === user.cart.length) {
        return res.status(200).json(newCart);
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const addVoucher = async (req, res) => {
  try {
      const { name, discount } = req.body;
      const voucher = await Voucher.findOne({ name });
      if (!voucher) {
        await Voucher.create({ name, discount });
        return res.status(200).json({ message: "Voucher Added!" });
      } else {
        return res.status(404).json({ error: "Voucher name already Exists!" });
      }
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const checkVoucher = async (req, res) => {
  try {
    const { name } = req.body;
      const voucher = await Voucher.findOne({ name })
      if (voucher) {
          return res.status(200).json({discount: voucher.discount});      
      } else {
          return res.status(404).json({ error: "Voucher Not Valid!" });         
      }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


//Order Controller

export const createOrder = async (req, res) => {
  const { products, totalPrice, address } = req.body;
  let newProducts = [];
  for (let i = 0; i < products.length; i++) {
    newProducts.push({
      productId: products[i]._doc._id,
      quantity: products[i].quantity,
    });  
  }
  let salesId = [];
  for (let i = 0; i < products.length; i++) {
    salesId.push(products[i]._doc.soldBy);
  }
  const user = await User.findById(req.user._id);
  const userId = req.user._id;
  try {
    const order = await Order.create({
      products: newProducts,
      userId,
      totalPrice,
      salesId,
      address,
      status: "pending"
    });
    user.address = address;
    await user.save();
    return res
      .status(201)
      .json({ message: "Order Created Successfully!", order, user });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id });
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.user._id);
    order.status = "completed";
    await order.save();
    return res.status(200).json({"message": "order updated!"});
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//Sales

export const getMySales = async (req, res) => {
  try {
    const allSales = await Order.find({});
    const mySales = [];
    for (let i = 0; i < allSales.length; i++) {
      if (allSales[i].salesId.includes(req.user._id.toString())) {
        mySales.push(allSales[i]);
      }   
    };
    return res.status(200).json(mySales);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const completeSale = async (req, res) => {
  try {
    const { saleId } = req.body;
    const sale = await Order.findById(saleId);
    sale.salesId = [];
    sale.salesId.push(req.user._id);
    sale.status = "completed";
    await sale.save();
    return res.status(200).json({"message": "Sale Completed!"});
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};