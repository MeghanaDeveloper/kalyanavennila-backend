const mongoose = require('mongoose');

const capitalizeWords = (value) => {
    if (!value) return value;
    return value
        .split(" ") 
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
};

const userDetailsSchema = new mongoose.Schema({
    accountId: { type: String, unique: true, sparse: true },
    accountCreatedBy: { type: String, required: true, enum: ['Myself', 'Parent', 'Guardian', 'Sister', 'Brother', 'Relative', 'Friend'] },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    surName: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
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
    lookingFor: { type: String, enum: ['Bride', 'Groom'] },
    partnerAge: { type: String, enum: ['21-25', '25-30', '30-35', '35-40', '40-45', '45-50', '50-55'] },
    partnerReligion: { type: String, default: "No Religion Bar",},
    partnerCaste: { type: String, default: "No Caste Bar",},
    partnerMotherTongue: { type: String, default: "No Language Bar",},
    profilePic:{ type: String },
    documents: { type: [String]}
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

const userDetailsModel = new mongoose.model("UserDetails", userDetailsSchema);

module.exports = { userDetailsModel };
