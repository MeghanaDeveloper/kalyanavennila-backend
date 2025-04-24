

require("dotenv").config(); 
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { adminDetailsModel } = require("../models/adminSchema");


const createAdmin = async () => {
  console.log('admin')
  try {
    mongoose.connect(process.env.MONGOOSE_CONNECTION)
    .then(() => {
        console.log("MongoDb Database connection for admin is established")
    })
    .catch((err) => {
        console.log(`db error : ${err}`)
    })

    const userName = "admin";
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

module.exports = createAdmin

