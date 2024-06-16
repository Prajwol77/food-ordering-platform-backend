import { Request, Response } from "express";
import { LoginUserType, RegisterUserType } from "../types/UserType";
import User from "../models/user";
import bcrypt from "bcrypt";

const register = async (req: Request, res: Response) => {
  try {
    const requestUser: RegisterUserType = req.body;

    if (!requestUser.email || !requestUser.password || !requestUser.name) {
      return res.status(400).json({ message: "User Details is insufficient" });
    }

    const user = await User.findOne({ email: requestUser.email });

    if (user) {
      return res.status(404).json({ message: "User already exist" });
    }

    const hashedPassword = await bcrypt.hash(requestUser.password, 12);
    requestUser.password = hashedPassword;

    if (!requestUser.auth0Id) {
      requestUser.auth0Id = "Placeholder";
    }

    const newUser = new User({
      email: requestUser.email,
      name: requestUser.name,
      password: requestUser.password,
      auth0Id: requestUser.auth0Id,
    });

    await newUser.save();

    res
      .status(201)
      .json({ isSuccess: true, message: "User registered successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const requestUser: LoginUserType = req.body;

    if (!requestUser.email || !requestUser.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = await User.findOne({ email: requestUser.email });

    if (!user) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    if (user.password) {
      const isPasswordMatch = await bcrypt.compare(
        requestUser.password,
        user.password
      );

      if (!isPasswordMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
    }

    const token = await user.generateToken();

    res.status(201).json({
      isSuccess: true,
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { register, login };
