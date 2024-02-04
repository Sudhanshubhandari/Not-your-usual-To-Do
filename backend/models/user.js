import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema({
  id: {
    type:Number
  },
  priority: {
    type: Number,
  },
  phone_number:{
    type:String,
  },

});



const User = mongoose.model("User", userSchema);

export default User;
