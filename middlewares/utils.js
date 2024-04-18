import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { serviceData } from "../data/data.js";
import Product from "../models/Product.js";

export const getDetails = (user) => {
  const { password, ...otherDetails } = user._doc;
  return otherDetails;
};

export const validIdParams = (id) => {
  if (id.length < 24) {
    return false;
  } else {
    return true;
  }
};

export const setAdmin = async () => {
  const usrr = await User.findOne({ email: "admin@crm.com" });
  if (!usrr) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const newUser = {
      type: "admin",
      email: "admin@crm.com",
      password: hashedPassword,
    };
    const createdUser = new User(newUser);
    await createdUser.save();
  }
};

export const setDefaultServices = async () => {
  try {
    serviceData.forEach(async (service, id) => {
      const usrr = await Product.findOne({ slug: service.slug });
      const admin = await User.findOne({ email: "admin@crm.com" });
      if (!usrr) {
        const newService = {
          name: service.name,
          description: service.description,
          ordersCompleted: service.ordersCompleted,
          image: service.image,
          slug: service.slug,
          ratings: service.ratings,
          soldBy: admin?._id || "",
        };
        const createdService = new Product(newService);
        if (admin) {
          admin.products.push(createdService._id);
          await admin.save();
        }
        await createdService.save();
      }
    });
  } catch (error) {
    console.log(error);
  }
};
