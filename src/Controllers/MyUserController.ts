import { Request, Response } from "express";
import User from "../models/user";
import { LoginUserType, RegisterUserType } from "../types/UserType";
import bcrypt from 'bcrypt'
import parseToken from "../utils/parse_token";

const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const { authorization } = req.headers;

    const tokenVar = await parseToken(authorization);

    if(!tokenVar){
      return res.status(401).json({ message: "Unauthorized" });
    }
    const currentUser = await User.findOne({ _id: req.userId });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(currentUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const createCurrentUser = async (req: Request, res: Response) => {
  //1. Check if the user exists.
  //2. Create the user if it doesn't exist
  //3. Return the user object to the calling client

  try {
    const { authorization } = req.headers;

    const tokenVar = await parseToken(authorization);

    if(!tokenVar){
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { auth0Id } = req.body;
    const existingUser = await User.findOne({ auth0Id });

    if (existingUser) {
      return res.status(200).send(existingUser);
    }
    const newUser = new User(req.body);
    await newUser.save();

    res.status(201).json(newUser.toObject());
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating user" });
  }
};

const updateCurrentUser = async (req: Request, res: Response) => {
  try {
    const { authorization } = req.headers;

    const tokenVar = await parseToken(authorization);
    
    if(!tokenVar){
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { name, address, city, contact } = req.body;
    const user = await User.findById(tokenVar.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name;
    user.address = address;
    user.city = city;
    user.contact = contact;

    await user.save();

    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating user" });
  }
};

const getAllUser = async (req: Request, res: Response) => {
  try {
    const { authorization } = req.headers;

    const tokenVar = await parseToken(authorization);

    if(!tokenVar){
      return res.status(401).json({ message: "Unauthorized" });
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const users = await User.find().sort({ _id: 1 }).skip(skip).limit(limit);
    const total = await User.countDocuments();
    res.status(200).json({ users, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const { authorization } = req.headers;

    const tokenVar = await parseToken(authorization);

    if(!tokenVar){
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const users = await User.findByIdAndDelete(userId);

    if (!users) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const makeUserAdmin = async (req: Request, res: Response) => {
  try {
    const { authorization } = req.headers;

    const tokenVar = await parseToken(authorization);

    if(!tokenVar){
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isAdmin = !user.isAdmin;
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  createCurrentUser,
  updateCurrentUser,
  getCurrentUser,
  getAllUser,
  deleteUser,
  makeUserAdmin
};

