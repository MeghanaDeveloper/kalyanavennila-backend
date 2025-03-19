const mongoose = require('mongoose');

const capitalizeWords = (value) => {
    if (!value) return value;
    return value
        .split(" ") // Split words by space
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
        .join(" "); // Join back into a string
};

const userDetailsSchema = new mongoose.Schema({
    accountId: { type: String, unique: true, sparse: true },
    accountCreatedBy: { type: String, required: true, enum: ['Myself', 'Parent', 'Guardian', 'Sister', 'Brother', 'Relative', 'Friend'] },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    motherTongue: { type: String, required: true },
    religion: { type: String, required: true },
    verifyOtp: { type: String },
    otpExpiresAt: { type: Date },
    isUserVerified: { type: Boolean, default: false },
    password: { type: String },
    temporaryPassword: { type: String },

    languages: { 
        type: [String], 
        enum: ["Tamil", "Hindi", "English", "Telugu", "Malayalam", "Kannada", "Marathi", "Gujarati", "Bengali", "Punjabi", "Urdu"] 
    },
    caste: { type: String },
    subCaste: { type: String },
    dateOfBirth: { type: Date},
    myAge: { type: Number },  
    education: { type: String, enum: ['Professional Degree', 'Post Graduation', 'Graduation', 'Diploma'] },
    jobType: { type: String, enum: ['Govt', 'MNC', 'Private', 'NRI', 'Business', 'Others'] },
    lookingFor: { type: String, enum: ['Man', 'Woman'] },
    partnerAge: { type: String, enum: ['21-25', '25-30', '30-35', '35-40', '40-45', '45-50', '50-55'] },
    partnerReligion: { type: String, default: "No Religion Bar", immutable: true },
    partnerCaste: { type: String, default: "No Caste Bar", immutable: true },
    partnerMotherTongue: { type: String, default: "No Language Bar", immutable: true },
},
 { timestamps: true }
);


userDetailsSchema.pre("save", function (next) {
    if (this.dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(this.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        this.myAge = age; 
    }
    next();
});

// ✅ Capitalize fields before saving
userDetailsSchema.pre("save", function (next) {
    this.fullName = capitalizeWords(this.fullName);
    this.motherTongue = capitalizeWords(this.motherTongue);
    this.religion = capitalizeWords(this.religion);
    this.caste = capitalizeWords(this.caste);
    this.subCaste = capitalizeWords(this.subCaste);
    next();
});

const userDetailsModel = new mongoose.model("UserDetails", userDetailsSchema);

module.exports = { userDetailsModel };
