const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        institutionId: { type: String, required: true },
        departmentId: { type: String, required: true },
        username: { type: String, required: false },
        email: { type: String, required: true },
        password: { type: String, required: true },
        fullName: { type: String, required: true },
        rollNumber: { type: String, required: true },
        courseStartYear: { type: String, required: true },
        courseEndYear: { type: String, required: true },
        isActive: { type: Boolean, default: false },
        profilePicture: { type: String, required: false },
        dateOfBirth: { type: String, required: false },
        gender: {
            type: String,
            enum: ["male", "female"],
            required: false,
        },
        mobile: { type: String, required: false },
        about: { type: String, required: false },
        socialMedia: {
            linkedin: { type: String, required: false },
            instagram: { type: String, required: false },
            twitter: { type: String, required: false },
            facebook: { type: String, required: false },
            behance: { type: String, required: false },
            personalWebsite: { type: String, required: false },
        },
        isUsernameUpdated: { type: Boolean, default: false },
        isOnBoardingCompleted: { type: Boolean, default: false },
        interestBasedSkills: { type: Array, default: [] },
        isEmailVerified: { type: Boolean, default: false },
        goalType: {
            type: String,
            enum: ["Week", "Month", "Year"],
        },
        goalHours: {
            type: Number,
        },
    },
    { timestamps: true },
);

const User = mongoose.model("User", userSchema);
module.exports = User;
