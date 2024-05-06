const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        from: { type: String, required: true },
        to: { type: String, required: true },
        type: { type: String, required: true },
        message: { type: String, required: true },
        read: { type: Boolean, default: false },
        link: { type: String },
        date: { type: Date, default: Date.now },
    },
    { timestamps: true },
);

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
