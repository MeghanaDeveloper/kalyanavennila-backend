const mongoose = require("mongoose");
const { userDetailsSchema } = require("./userSchema");

userDetailsSchema.pre("save", function (next) {
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    this.myAge = age;
  }
  next();
});

const capitalizeWords = (value) => {
  if (!value) return value;
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

userDetailsSchema.pre("save", function (next) {
  this.surName = capitalizeWords(this.surName);
  this.firstName = capitalizeWords(this.firstName);
  this.lastName = capitalizeWords(this.lastName);
  this.motherTongue = capitalizeWords(this.motherTongue);
  this.religion = capitalizeWords(this.religion);
  this.caste = capitalizeWords(this.caste);
  this.subCaste = capitalizeWords(this.subCaste);
  next();
});

const userDetailsModel = mongoose.model("UserDetails", userDetailsSchema);

module.exports = {
  userDetailsModel,
};
