import mongoose from "mongoose";
import {ObjectId} from "mongodb";

const userSchema = new mongoose.Schema({

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
    city:{
        type: String,
    },
    contact: {
        type: String,
    },
    isAdmin: {
        type: Boolean,
        default: false
    }

})

const User = mongoose.model("User",userSchema);
export default User;