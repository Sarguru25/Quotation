// scripts/seed.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGO_URI = "mongodb://localhost:27017/quotation_app";

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
});

const User = mongoose.model("User", UserSchema);

async function seed() {
  await mongoose.connect(MONGO_URI);

  const admin = await User.findOne({ email: "admin@example.com" });
  if (!admin) {
    const hash = await bcrypt.hash("admin123", 10);
    await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: hash,
      role: "Admin",
    });
    console.log("Admin user created");
  } else {
    console.log("Admin user already exists");
  }

  process.exit();
}

seed();