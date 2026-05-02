import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, select: false }, // not selected by default
  role: {
    type: String,
    enum: ["Admin", "Manager", "Employee"],
    default: "Employee",
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  googleId: { type: String }, // for Google provider
});

export default mongoose.models.User || mongoose.model("User", UserSchema);