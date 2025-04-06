const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
  },
  { timestamps: true }
);

const adminDetailsModel = new mongoose.model("Admin", adminSchema);

module.exports = { adminDetailsModel };
