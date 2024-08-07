import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import cloudinary from "cloudinary";
import mongoose, { Types } from "mongoose";
import User from "../models/user";
import parseToken from "../utils/parse_token";
import Order from "../models/order";

const getMyRestaurant = async (req: Request, res: Response) => {
  try {
    const { authorization } = req.headers;

    const tokenVar = await parseToken(authorization);

    if (!tokenVar) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const restaurant = await Restaurant.findOne({ user: req.userId });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    return res.status(200).json({ message: "", data: restaurant });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching restaurant" });
  }
};

const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "order not found" });
    }

    const restaurant = await Restaurant.findById(order.restaurant);

    if (restaurant?.user?._id.toString() !== req.userId) {
      return res.status(401).send();
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "unable to update order status" });
  }
};

const createMyRestaurant = async (req: Request, res: Response) => {
  try {
    const { authorization } = req.headers;
    console.log("req.body.deliveryPrice", req.body.deliveryPrice);
    const tokenVar = await parseToken(authorization);

    if (!tokenVar) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const existingRestaurant = await Restaurant.findOne({
      user: tokenVar.userId,
    });

    console.log(existingRestaurant);

    if (existingRestaurant) {
      return res
        .status(409)
        .json({ message: "User restaurant already exists." });
    }

    // const image = req.file as Express.Multer.File;
    // const base64Image = Buffer.from(image.buffer).toString("base64");
    // const dataURI = `data:${image.mimetype};base64,${base64Image}`;
    //
    // const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);

    const imageUrl = await uploadImage(req.file as Express.Multer.File);

    const restaurant = new Restaurant(req.body);
    restaurant.imageUrl = imageUrl;
    restaurant.user = new mongoose.Types.ObjectId(req.userId);
    restaurant.lastUpdated = new Date();
    await restaurant.save();

    res.status(201).send(restaurant);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const updateMyRestaurant = async (req: Request, res: Response) => {
  try {
    const { authorization } = req.headers;

    const tokenVar = await parseToken(authorization);

    if (!tokenVar) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const restaurant = await Restaurant.findOne({
      user: req.userId,
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    restaurant.restaurantName = req.body.restaurantName;
    restaurant.city = req.body.city;
    restaurant.deliveryPrice = req.body.deliveryPrice
      ? req.body.deliveryPrice
      : 0;
    restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime
      ? req.body.estimatedDeliveryTime
      : 0;
    restaurant.cuisines = req.body.cuisines;
    restaurant.menuItems = req.body.menuItems;
    restaurant.lastUpdated = new Date();

    if (req.file) {
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
      restaurant.imageUrl = imageUrl;
    }

    await restaurant.save();
    res.status(200).send(restaurant);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getAllMyRestaurant = async (req: Request, res: Response) => {
  try {
    const { authorization } = req.headers;

    const tokenVar = await parseToken(authorization);

    if (!tokenVar) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const restaurants = await Restaurant.find()
      .sort({ _id: 1 })
      .skip(skip)
      .limit(limit);
    restaurants.forEach(async (response) => {
      if (response.user) {
        return await User.findById(new Types.ObjectId(response.user));
      }
    });
    const total = await Restaurant.countDocuments();
    res.status(200).json({ restaurants, total });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getRestaurantById = async (req: Request, res: Response) => {
  try {
    const { authorization } = req.headers;

    const tokenVar = await parseToken(authorization);

    if (!tokenVar) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { restaurantID } = req.query;
    if (!restaurantID) {
      return res.status(404).json({ message: "RestaurantID not provided" });
    }

    const restaurant = await Restaurant.findById(
      new Types.ObjectId(restaurantID.toString())
    );

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const restaurantOwner = await User.findById(restaurant.user);

    let restaurantWithOwner = {};

    if (restaurantOwner) {
      restaurantWithOwner = {
        ...restaurant.toObject(),
        owner: restaurantOwner.toObject(),
      };
    } else {
      restaurantWithOwner = {
        ...restaurant.toObject(),
        owner: {},
      };
    }
    res.status(200).send(restaurantWithOwner);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteRestaurant = async (req: Request, res: Response) => {
  try {
    const { authorization } = req.headers;

    const tokenVar = await parseToken(authorization);

    if (!tokenVar) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { restaurantId } = req.query;

    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    const restaurants = await Restaurant.findByIdAndDelete(
      new Types.ObjectId(restaurantId.toString())
    );

    let isRestaurantDeleted = false;

    if (!restaurants) {
      return res.status(404).json({ message: "Restaurant not found" });
    } else {
      isRestaurantDeleted = true;
    }

    const restaurantsWithDeletion = {
      ...restaurants.toObject(),
      isRestaurantDeleted,
    };

    res.status(200).json(restaurantsWithDeletion);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const allUserAndRestaurant = async (req: Request, res: Response) => {
  try {
    const { authorization } = req.headers;

    const tokenVar = await parseToken(authorization);

    if (!tokenVar) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const totalUsers = await User.countDocuments();
    const totalRestaurant = await Restaurant.countDocuments();
    res
      .status(200)
      .json({ totalUsers: totalUsers, totalRestaurant: totalRestaurant });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getMyRestaurantOrders = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({
      user: new Types.ObjectId(req.userId),
    });
    if (!restaurant) {
      return res.status(404).json({ message: "restaurant not found" });
    }

    const orders = await Order.find({ restaurant: restaurant._id })
      .populate("restaurant")
      .populate("user");

    return res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const uploadImage = async (file: Express.Multer.File) => {
  const image = file;
  const base64Image = Buffer.from(image.buffer).toString("base64");
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;

  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
  return uploadResponse.url;
};

const getRestaurantWithoutLogin = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const skip = (page - 1) * limit;
    const restaurants = await Restaurant.find()
      .sort({ averageRating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const allRestaurant = await Restaurant.countDocuments();
    res.status(200).json({ data: restaurants, count: allRestaurant });
  } catch (error) {
    console.log("getRestaurantWithoutLogin", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const getOrderHistory = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const skip = (page - 1) * limit;
    const userId = req.query.userId;

    const orders = await Order.find({
      user: userId,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("restaurant")
      .populate("user");

    const orderCount = await Order.find({
      user: userId,
    }).countDocuments();
    res.status(200).json({ data: orders, count: orderCount });
  } catch (error) {
    console.log("getRestaurantWithoutLogin", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export {
  getMyRestaurantOrders,
  getMyRestaurant,
  createMyRestaurant,
  updateMyRestaurant,
  getAllMyRestaurant,
  getRestaurantById,
  deleteRestaurant,
  allUserAndRestaurant,
  updateOrderStatus,
  getRestaurantWithoutLogin,
  getOrderHistory,
};
