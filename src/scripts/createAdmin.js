

require("dotenv").config(); 
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { adminDetailsModel } = require("../models/adminSchema");


const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGOOSE_CONNECTION);
    console.log("✅ MongoDB connected");

    const userName = "superadmin";
    const plainPassword = "Admin@123";

    const existingAdmin = await adminDetailsModel.findOne({ userName });
    if (existingAdmin) {
      console.log("⚠️ Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const newAdmin = await adminDetailsModel.create({ userName, password: hashedPassword });

    console.log("✅ Admin created:", newAdmin);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
  } finally {
    mongoose.disconnect();
  }
};

createAdmin();
