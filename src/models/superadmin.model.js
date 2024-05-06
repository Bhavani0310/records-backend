const mongoose = require("mongoose");

const superAdminSchema = new mongoose.Schema({
    superAdminId: {
        type: String,
        unique: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: { type: String, required: true },
});

const SuperAdmin = mongoose.model("SuperAdmin", superAdminSchema);
module.exports = SuperAdmin;
