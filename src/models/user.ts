import mongoose from "mongoose";
import jwt from "jsonwebtoken";

interface UserSchemeInterface {
  name: string;
  auth0Id: string;
  email: string;
  password: string;
  address: string;
  city: string;
  contact: string;
  isAdmin: boolean;
}

interface UserDocument extends UserSchemeInterface, Document {
  generateToken(): Promise<string>;
}

const userSchema = new mongoose.Schema<UserDocument>({
  auth0Id: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  address: {
    type: String,
  },
  city: {
    type: String,
  },
  contact: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    // required: true
  },
});


userSchema.methods.generateToken = async function (): Promise<string> {
  try {
    if (process.env.JWT_SECRET_KEY) {
      const token = jwt.sign(
        {
          name: `${this.name}`,
          userId: this._id.toString(),
          email: this.email,
          isAdmin: this.isAdmin
        },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: '3h',
        }
      );
      return token;
    } else {
      return "";
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const User = mongoose.model("User", userSchema);


export default User;
